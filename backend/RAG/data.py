import logging
import os
import json

from crud.book import get_all_books_sync
from db.database import get_db_sync
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_postgres import PGVector
from pydantic import SecretStr
from settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONNECTION_STRING = os.getenv("SQLALCHEMY_DATABASE_URL")
if CONNECTION_STRING and CONNECTION_STRING.startswith("postgresql+asyncpg"):
    CONNECTION_STRING = CONNECTION_STRING.replace(
        "postgresql+asyncpg", "postgresql+psycopg2"
    )

OPENAI_API_KEY = settings.OPENAI_API_KEY

if CONNECTION_STRING is None:
    raise ValueError("SQLALCHEMY_DATABASE_URL is not set")

if OPENAI_API_KEY is None:
    raise ValueError("OPENAI_API_KEY is not set")

# Initialize embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002", api_key=SecretStr(OPENAI_API_KEY)
)

# Initialize LLM
llm = ChatOpenAI(
    model="gpt-4o-mini", api_key=SecretStr(OPENAI_API_KEY), temperature=0.7
)

# Global vector store + chain
vector_store = None
vector_store_initialized = False
rag_chain = None


def fetch_books_from_database():
    """Fetch books directly from the database and deduplicate by ID"""
    try:
        db = get_db_sync()
        books = get_all_books_sync(db)
        documents = []
        seen_ids = set()

        for book in books:
            if book.id in seen_ids:
                continue
            seen_ids.add(book.id)

            status_info = ", ".join(
                f"{detail.status} (Stock: {detail.available_stock})"
                for detail in book.book_details
            )

            content = (
                f"id: {book.id}\n"
                f"Title: {book.title}\n"
                f"Description: {book.description}\n"
                f"Author: {book.author.name}\n"
                f"Category: {book.category.name}\n"
                f"Publish Year: {book.publish_year}\n"
                f"Status: {status_info}\n"
                f"cover_img: {book.cover_img}\n"
            )

            metadata = {
                "id": book.id,
                "title": book.title,
                "author": book.author.name,
                "category": book.category.name,
                "publish_year": book.publish_year,
            }

            documents.append(Document(page_content=content, metadata=metadata))

        print(f"Fetched {len(documents)} unique books from database")
        return documents
    except Exception as e:
        logger.error(f"Failed to fetch books from database: {e}")
        raise


def ensure_vector_store_initialized():
    """Make sure PGVector store is ready and populated"""
    global vector_store, vector_store_initialized
    if vector_store_initialized and vector_store is not None:
        return vector_store

    documents = fetch_books_from_database()
    if not documents:
        logger.warning("No documents fetched from DB for vector store")
        return None

    vector_store = PGVector(
        embeddings=embeddings,
        collection_name="books",
        connection=CONNECTION_STRING,
    )
    vector_store.add_documents(documents)

    vector_store_initialized = True
    logger.info("Vector store initialized with %d unique documents", len(documents))
    return vector_store


def initialize_rag_chain():
    """Initialize the full RAG chain"""
    global rag_chain, vector_store

    vector_store = ensure_vector_store_initialized()
    if vector_store is None:
        raise RuntimeError("Vector store could not be initialized")

    system_prompt = (
        "You are a book recommendation assistant for a RAG system. "
        "The user's interests may contain multiple topics. "
        "Use ONLY the following book details as the source of truth:\n"
        "{context}\n"
        "TASK:\n"
        "- Recommend **between 5 and 10 unique books** related to ANY of the user's interests. "
        "- If exact matches are not found, suggest the most similar or popular books from context instead. "
        "- Always return at least 5 books if context is not empty.\n"
        "OUTPUT:\n"
        "- Return ONLY a JSON array of objects. "
        "- Each object must contain exactly two fields: 'id' (integer from context) and 'title' (string from context).\n"
        "RULES:\n"
        "- Use ONLY books from {context}. Do NOT invent or fabricate books or IDs.\n"
        "- Copy 'id' and 'title' exactly from context.\n"
        "- All 'id' values must be unique (no duplicates).\n"
        "- If fewer than 5 books are relevant, return the top 5 closest matches from {context}.\n"
    )

    prompt = ChatPromptTemplate.from_messages(
        [("system", system_prompt), ("human", "{input}")]
    )

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(
        vector_store.as_retriever(search_kwargs={"k": 200}),
        question_answer_chain,
    )

    logger.info("RAG chain initialized")
    return rag_chain


async def get_recommendations(interests: str):
    """Get book recommendations based on user interests"""
    try:
        vector = ensure_vector_store_initialized()
        if not vector:
            raise Exception("Vector store could not be initialized")

        system_prompt = (
            "You are a book recommendation assistant for a RAG system. "
            "The user's interests may contain multiple topics. "
            "Use ONLY the following book details as the source of truth:\n"
            "{context}\n"
            "TASK:\n"
            "- Recommend **between 5 and 10 unique books** related to ANY of the user's interests. "
            "- If exact matches are not found, suggest the most similar or popular books from context instead. "
            "- Always return at least 5 books if context is not empty.\n"
            "OUTPUT:\n"
            "- Return ONLY a JSON array of objects. "
            "- Each object must contain exactly two fields: 'id' (integer from context) and 'title' (string from context).\n"
            "RULES:\n"
            "- Use ONLY books from {context}. Do NOT invent or fabricate books or IDs.\n"
            "- Copy 'id' and 'title' exactly from context.\n"
            "- All 'id' values must be unique (no duplicates).\n"
            "- If fewer than 5 books are relevant, return the top 5 closest matches from {context}.\n"
        )

        prompt = ChatPromptTemplate.from_messages(
            [("system", system_prompt), ("human", "{input}")]
        )

        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(
            vector.as_retriever(search_kwargs={"k": 200}),
            question_answer_chain,
        )

        response = rag_chain.invoke({"input": interests})

        # ✅ post-process to ensure uniqueness + 5–10 length
        recs = []
        try:
            recs = json.loads(response.get("answer", "[]"))
            seen = set()
            unique_recs = []
            for r in recs:
                if r["id"] not in seen:
                    seen.add(r["id"])
                    unique_recs.append(r)
            recs = unique_recs[:10]
        except Exception as e:
            logger.error(f"Failed to parse recommendations: {e}")
            recs = []

        if len(recs) < 5:
            logger.warning("Fewer than 5 recs, padding with extra results")
            extra_docs = vector.similarity_search(interests, k=200)
            seen = {r["id"] for r in recs}
            for d in extra_docs:
                if d.metadata["id"] not in seen:
                    recs.append({"id": d.metadata["id"], "title": d.metadata["title"]})
                    seen.add(d.metadata["id"])
                if len(recs) >= 5:
                    break

        return recs

    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise Exception(f"Failed to get recommendations: {e}")
