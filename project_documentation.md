# Book Nook - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Documentation](#backend-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Features](#features)
9. [Deployment](#deployment)
10. [Development Setup](#development-setup)

---

## Project Overview

**Book Nook** is a comprehensive book management and e-commerce platform that allows users to borrow and purchase books. The system features role-based access control, AI-powered book recommendations, real-time notifications, and a complete order management system.

### Key Features
- **Multi-role System**: Client, Employee, Manager, and Courier roles
- **Book Management**: Borrow and purchase books with inventory tracking
- **AI Recommendations**: RAG-based book recommendations using user interests
- **Order Management**: Complete order lifecycle with delivery tracking
- **Wallet System**: Digital wallet for transactions
- **Promo Codes**: Discount system for purchases
- **Real-time Updates**: WebSocket notifications
- **Responsive UI**: Modern, mobile-friendly interface

---

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │   + pgvector    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│   AI/ML         │◄─────────────┘
                        │   (OpenAI)      │
                        │   (RAG)         │
                        └─────────────────┘
```

### Directory Structure
```
Book Nook/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic validation schemas
│   ├── routers/            # API route definitions
│   ├── crud/               # Database operations
│   ├── RAG/                # AI recommendation system
│   ├── utils/              # Utility functions
│   └── alembic/            # Database migrations
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── nginx/                  # Reverse proxy configuration
└── docker-compose.yaml     # Container orchestration
```

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.116.1
- **Database**: PostgreSQL 17 with pgvector extension
- **ORM**: SQLAlchemy 2.0.41
- **Authentication**: JWT with bcrypt
- **AI/ML**: OpenAI GPT-4, LangChain, RAG system
- **File Storage**: Cloudinary
- **Email**: FastAPI-Mail
- **Payments**: Stripe integration
- **Real-time**: WebSockets
- **Migrations**: Alembic

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 7.7.1
- **UI Components**: Flowbite React, Lucide React icons
- **Forms**: React Final Form
- **Animations**: Framer Motion
- **Notifications**: React Toastify

### DevOps
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Environment**: Development, Staging, Production ready

---

## Backend Documentation

### Core Components

#### 1. Models (SQLAlchemy ORM)
- **User**: Authentication, roles, wallet, interests
- **Book**: Book information, categories, authors
- **BookDetails**: Inventory management (borrow/purchase stock)
- **Order**: Order management with status tracking
- **Cart**: Shopping cart functionality
- **Transaction**: Financial transaction history
- **PromoCode**: Discount system
- **Notification**: Real-time notifications

#### 2. API Routers
- **Auth Router** (`/api/auth`): Authentication endpoints
- **Book Router** (`/api/books`): Book CRUD operations
- **Order Router** (`/api/order`): Order management
- **Cart Router** (`/api/cart`): Shopping cart operations
- **Wallet Router** (`/api/wallet`): Financial transactions
- **Promo Code Router** (`/api/promo-codes`): Discount management
- **Interests Router** (`/api/interests`): User interests and RAG recommendations
- **WebSocket Router**: Real-time communication

#### 3. RAG System
The AI recommendation system uses:
- **Vector Database**: pgvector for semantic search
- **LLM**: OpenAI GPT-4 for generating recommendations
- **Embeddings**: OpenAI text-embedding-ada-002
- **Retrieval**: LangChain retrieval chain with 8 similar books
- **Prompt Engineering**: Structured prompts for consistent recommendations

### Key Backend Features

#### Authentication System
```python
# JWT-based authentication with role-based access
@router.post("/login")
async def login(credentials: LoginRequest):
    # Verify credentials and return JWT token
    
@router.get("/me")
async def get_current_user(current_user: User = Depends(get_user_via_session)):
    # Return current user information
```

#### Book Management
```python
# Book CRUD operations with inventory tracking
@book_router.get("/borrow")
async def get_borrow_books():
    # Return books available for borrowing
    
@book_router.get("/purchase") 
async def get_purchase_books():
    # Return books available for purchase
```

#### Order Processing
```python
# Complete order lifecycle
@order_router.post("/")
async def create_order(order_data: CreateOrderRequest):
    # Create order with validation and inventory checks
    
@order_router.patch("/{order_id}/status")
async def update_order_status():
    # Update order status with notifications
```

---

## Frontend Documentation

### Component Architecture

#### 1. Layout Components
- **ClientWithNavbarLayout**: Main client interface with navigation
- **ClientWithSidebarLayout**: Client pages with sidebar navigation
- **EmployeeLayout**: Staff interface with admin navigation
- **CourierLayout**: Delivery personnel interface

#### 2. Page Components
- **Home**: Landing page with book recommendations
- **BorrowBooksPage**: Browse and borrow books
- **PurchaseBooksPage**: Browse and purchase books
- **CartPage**: Shopping cart management
- **CheckoutPage**: Order completion
- **TransactionsPage**: Financial history
- **OrdersPage**: Order history and tracking

#### 3. Reusable Components
- **BookCard**: Book display component
- **HomeSlider**: Carousel for book displays
- **RecommendBookCard**: AI-recommended book display
- **SearchBar**: Book search functionality
- **MainButton**: Consistent button styling

### State Management

#### TanStack Query Integration
```typescript
// Custom hooks for API calls
export function useGetBorrowBooks() {
  return useQuery({
    queryKey: ["borrowBooks"],
    queryFn: () => apiReq("GET", "/books/borrow"),
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: () => apiReq("GET", "/interests/recommend"),
  });
}
```

#### Form Management
```typescript
// React Final Form integration
<Form
  onSubmit={handleSubmit}
  validate={validateForm}
  render={({ handleSubmit, submitting }) => (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )}
/>
```

### Routing System
```typescript
// Role-based routing
<Route element={<RoleBasedRoute allowedRoles={[UserRole.CLIENT]} />}>
  <Route path="/borrow-books" element={<BorrowBooksPage />} />
  <Route path="/purchase-books" element={<PurchaseBooksPage />} />
</Route>

<Route element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]} />}>
  <Route path="/staff/books" element={<BooksTablePage />} />
</Route>
```

---

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    role UserRole NOT NULL,
    wallet DECIMAL(10,2) DEFAULT 0.00,
    interests TEXT,
    phone_number VARCHAR,
    national_id VARCHAR,
    reset_token VARCHAR UNIQUE,
    reset_token_expires_at TIMESTAMP
);
```

#### Books Table
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cover_img VARCHAR,
    publish_year INTEGER,
    author_id INTEGER REFERENCES authors(id),
    category_id INTEGER REFERENCES categories(id)
);
```

#### Book Details Table
```sql
CREATE TABLE book_details (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    status BookStatus NOT NULL,
    available_stock INTEGER DEFAULT 0
);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status OrderStatus DEFAULT 'CREATED',
    pickup_type PickUpType NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    promo_code_id INTEGER REFERENCES promo_codes(id)
);
```

### Vector Database
```sql
-- pgvector extension for AI recommendations
CREATE EXTENSION IF NOT EXISTS vector;

-- Book embeddings table
CREATE TABLE book_embeddings (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    embedding vector(1536), -- OpenAI embedding dimension
    content TEXT
);
```

---

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login            # User login
POST /api/auth/logout           # User logout
GET  /api/auth/me               # Get current user
POST /api/auth/forget-password  # Password reset request
POST /api/auth/reset-password   # Password reset
```

### Book Endpoints
```
GET    /api/books/borrow        # Get borrowable books
GET    /api/books/purchase      # Get purchasable books
GET    /api/books/{id}          # Get book details
POST   /api/books/              # Create book (Employee)
PATCH  /api/books/{id}          # Update book (Employee)
GET    /api/books/authors       # Get authors
GET    /api/books/categories    # Get categories
```

### Order Endpoints
```
GET    /api/order/              # Get user orders
POST   /api/order/              # Create order
PATCH  /api/order/{id}/status   # Update order status
GET    /api/order/{id}          # Get order details
```

### Cart Endpoints
```
GET    /api/cart/               # Get user cart
POST   /api/cart/               # Add item to cart
PATCH  /api/cart/{id}           # Update cart item
DELETE /api/cart/{id}           # Remove cart item
```

### Wallet Endpoints
```
GET    /api/wallet/transactions # Get transaction history
POST   /api/wallet/checkout     # Create checkout session
POST   /api/wallet/webhook      # Stripe webhook
```

### AI Recommendation Endpoints
```
POST   /api/interests/recommend # Get recommendations (POST interests)
GET    /api/interests/recommend # Get recommendations (saved interests)
PUT    /api/interests/          # Save user interests
GET    /api/interests/          # Get user interests
```

### Promo Code Endpoints
```
GET    /api/promo-codes/        # Get all promo codes
POST   /api/promo-codes/        # Create promo code (Employee)
PATCH  /api/promo-codes/{id}    # Update promo code (Employee)
POST   /api/promo-codes/active  # Apply promo code to cart
```

---

## Features

### 1. User Management
- **Registration & Authentication**: Secure JWT-based authentication
- **Role-Based Access**: Client, Employee, Manager, Courier roles
- **Profile Management**: User profiles with interests
- **Password Reset**: Email-based password recovery

### 2. Book Management
- **Book Catalog**: Comprehensive book database
- **Inventory Tracking**: Real-time stock management
- **Categories & Authors**: Organized book classification
- **Image Management**: Cloudinary integration for book covers

### 3. Order System
- **Borrow Orders**: Book borrowing with return dates
- **Purchase Orders**: Direct book purchases
- **Order Tracking**: Complete order lifecycle
- **Delivery Management**: Courier assignment and tracking

### 4. AI Recommendations
- **Interest-Based**: User preference learning
- **RAG System**: Semantic search and recommendations
- **Real-time Updates**: Dynamic recommendation generation
- **Personalization**: User-specific book suggestions

### 5. Financial System
- **Digital Wallet**: User account balance
- **Transaction History**: Complete financial records
- **Payment Integration**: Stripe payment processing
- **Promo Codes**: Discount system

### 6. Real-time Features
- **WebSocket Notifications**: Live updates
- **Order Status**: Real-time order tracking
- **Inventory Updates**: Live stock changes
- **Chat System**: User support communication

### 7. Admin Features
- **Book Management**: CRUD operations for books
- **User Management**: User administration
- **Order Management**: Order processing and tracking
- **Analytics**: System usage statistics

---

## Deployment

### Docker Configuration
```yaml
# docker-compose.yaml
services:
  postgres:
    image: pgvector/pgvector:pg17
    ports: ["5433:5432"]
    environment:
      POSTGRES_DB: fastapi
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ["./backend/.env.docker"]
    depends_on: [postgres]

  frontend:
    build: ./frontend
    env_file: ["./frontend/.env.docker"]

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on: [frontend, backend]
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/fastapi
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_URL=your_cloudinary_url
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET_KEY=your_jwt_secret

# Frontend (.env)
VITE_APP_API_URL=http://localhost:8000/api
VITE_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Production Deployment
1. **Database Setup**: PostgreSQL with pgvector extension
2. **Backend Deployment**: FastAPI with Uvicorn
3. **Frontend Build**: React production build
4. **Reverse Proxy**: Nginx configuration
5. **SSL Certificate**: HTTPS configuration
6. **Monitoring**: Health checks and logging

---

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 17 with pgvector extension

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd BookieJar

# Start services
docker-compose up -d

# Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head

# Frontend setup
cd ../frontend
npm install
npm run dev

# Access applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Development Workflow
1. **Database Migrations**: Use Alembic for schema changes
2. **API Development**: FastAPI with automatic documentation
3. **Frontend Development**: React with hot reload
4. **Testing**: Unit and integration tests
5. **Code Quality**: ESLint, Prettier, and type checking

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## Conclusion

Book Nook is a modern, scalable book management platform that combines traditional e-commerce functionality with cutting-edge AI technology. The system provides a comprehensive solution for book lending and purchasing with features like:

- **Scalable Architecture**: Microservices-ready design
- **AI Integration**: RAG-based recommendations
- **Real-time Features**: WebSocket communication
- **Security**: JWT authentication and role-based access
- **User Experience**: Modern, responsive interface
- **Admin Tools**: Complete management interface

The platform is production-ready with Docker containerization, comprehensive API documentation, and a robust development workflow. The combination of FastAPI, React, and PostgreSQL with AI capabilities makes it a powerful solution for modern book management needs.

---

*Documentation Version: 1.0*  
*Last Updated: January 2025*  
*Project: Book Nook - Complete Book Management Platform*
