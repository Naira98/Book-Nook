import logging
import os

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

# Global vector store variable
vector_store = None
vector_store_initialized = False


def fetch_books_from_database():
    """Fetch books directly from the database"""
    try:
        db = get_db_sync()
        books = get_all_books_sync(db)
        documents = []

        for book in books:
            # Extract status info from book_details
            status_info = ", ".join(
                f"{detail.status} (Stock: {detail.available_stock})"
                for detail in book.book_details
            )

            # Combine fields for embedding
            content = (
                f"Title: {book.title}\n"
                f"Description: {book.description}\n"
                f"Author: {book.author.name}\n"
                f"Category: {book.category.name}\n"
                f"Publish Year: {book.publish_year}\n"
                f"Status: {status_info}\n"
                f"id: {book.id}\n"
                f"cover_img: {book.cover_img}\n"
            )

            # Metadata for filtering/display
            metadata = {
                "id": book.id,
                "title": book.title,
                "author": book.author.name,
                "category": book.category.name,
                "publish_year": book.publish_year,
            }

            doc = Document(page_content=content, metadata=metadata)
            documents.append(doc)

            print(f"Fetched {len(documents)} books from database")
        return documents
    except Exception as e:
        logger.error(f"Failed to fetch books from database: {e}")
        raise Exception(f"Failed to fetch books from database: {e}")


def ensure_vector_store_initialized():
    global vector_store, vector_store_initialized
    print("Ensuring vector store is initialized...", "🔥🔥🔥")
    if vector_store_initialized and vector_store is not None:
        return vector_store

    try:
        print("Initializing vector store...", "🙂🙂")
        documents = fetch_books_from_database()

        if not documents:
            print("No documents to index", "🤢🤢")
            return None
        print("Documents fetched from database:", len(documents), "😄😄😄")
        # Direct async init
        vector_store = PGVector(
            embeddings=embeddings,
            collection_name="books",
            connection=CONNECTION_STRING,  # async engine
        )

        print("Adding documents to vector store...", "🙈🙈")
        vector_store.add_documents(documents)  # use async add

        vector_store_initialized = True
        print("Vector store initialized successfully!", "🙈🙈")
        return vector_store

    except Exception as e:
        logger.error(f"Failed to initialize vector store: {e}", "🙈🙈")
        raise


async def build_or_update_index_async(
    api_url="http://127.0.0.1:8000/api/books/", clear_existing=False
):
    """Async version of build_or_update_index"""
    return ensure_vector_store_initialized()


def initialize_rag_chain():
    """Initialize the RAG chain with the vector store"""
    global vector_store

    if vector_store is None:
        logger.warning("Vector store not initialized, will initialize on first use")
        # Don't initialize here - let it be done lazily

    # Create the prompt template
    system_prompt = (
        "You are a book recommendation assistant. Based on the user's interests and these book details:\n"
        "{context}\n"
        "Recommend 3-5 books with a brief reason for each recommendation. "
        "Include title, author, category, price , cover image URL and availability status. "
    )

    prompt = ChatPromptTemplate.from_messages(
        [("system", system_prompt), ("human", "{input}")]
    )

    # Create the document chain
    question_answer_chain = create_stuff_documents_chain(llm, prompt)

    # Create the retrieval chain (will be initialized when needed)
    rag_chain = create_retrieval_chain(
        None,  # Will be set when vector store is ready
        question_answer_chain,
    )
    print(rag_chain, "🤢🤢0🤢🤢")

    return rag_chain


# Initialize the RAG chain
rag_chain = None


def get_rag_chain():
    """Get the initialized RAG chain"""
    global rag_chain
    if rag_chain is None:
        rag_chain = initialize_rag_chain()
    return rag_chain


async def get_recommendations(interests: str):
    """Get book recommendations based on user interests"""
    try:
        # Ensure vector store is initialized
        # Create the prompt template
        system_prompt = (
            "You are a book recommendation assistant. Based on the user's interests and these book details:\n"
            "{context}\n"
            "Recommend 3-5 books "
            "Include book details id  , title, author, category , available purchase stock and cover image URL. "
            "Format your response as json object with fields:'id','title', 'author', 'category', 'status', 'cover_img' , 'available_stock' , 'description'."
            "If no relevant books are found, suggest alternative interests or categories."
        )

        prompt = ChatPromptTemplate.from_messages(
            [("system", system_prompt), ("human", "{input}")]
        )

        # Create the document chain
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        # Create the retrieval chain with the initialized vector store
        if vector_store is not None:
            rag_chain = create_retrieval_chain(
                vector_store.as_retriever(search_kwargs={"k": 8}), question_answer_chain
            )

            response = rag_chain.invoke({"input": interests})
            return response["answer"]
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise Exception(f"Failed to get recommendations: {e}")


async def update_book_index():
    """Update the book index with new data"""
    try:
        global vector_store_initialized
        vector_store_initialized = False  # Force re-initialization
        ensure_vector_store_initialized()
        return {"status": "success", "message": "Book index updated successfully"}
    except Exception as e:
        logger.error(f"Error updating book index: {e}")
        raise Exception(f"Failed to update book index: {e}")
