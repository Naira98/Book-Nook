# Book Nook - Complete Project Documentation

## Project Overview

**Book Nook** is a comprehensive book management and e-commerce platform that allows users to borrow and purchase books. The system features role-based access control, AI-powered book recommendations, real-time notifications, and a complete order management system.

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

---

## Technology Stack

### Backend

- **Framework**: FastAPI with Pydantic
- **Database**: PostgreSQL with pgvector extension
- **ORM**: SQLAlchemy
- **Authentication**: JWT with bcrypt
- **AI/ML**: OpenAI GPT-4, LangChain, RAG system
- **File Storage**: Cloudinary
- **Email**: FastAPI-Mail
- **Payments**: Stripe integration
- **Real-time**: WebSockets
- **Migrations**: Alembic

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Final Form
- **Animations**: Framer Motion
- **Notifications**: React Toastify

### DevOps

- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx

---

## Key Features

- **Multi-role System**: Client, Employee, Manager, and Courier roles
- **Book Management**: Borrow and purchase books with inventory tracking
- **AI Recommendations**: RAG-based recommendations using user interests and browsing behavior
- **Order Management**: Complete order lifecycle with delivery tracking
- **Wallet System**: Digital wallet with Stripe integration
- **Promo Codes**: Dynamic discount system
- **Real-time Updates**: WebSocket-powered notifications
- **Responsive UI**: Modern, mobile-friendly interface

---

## Highlighted Features

- **Automated Cron Jobs**: Reminders for upcoming returns & late return alerts
- **AI-Powered Personalization**: GPT-4 RAG, interest tracking, activity-based refinements
- **Live Order Tracking & Notifications**: Real-time updates for staff, couriers, and customers
- **Advanced E-Wallet**: Built-in wallet, Stripe, promo codes, transaction history
- **Dynamic Fee System**: Auto-calculation of deposit, borrowing, and delay fees

---

## Detailed Features

### 1. Book Management

- Comprehensive **catalog** with categories & authors
- **Inventory tracking** with real-time updates
- **Cloudinary** integration for book covers

### 2. Order System

- Borrow & purchase workflows
- Full **order lifecycle** from request → delivery → return
- **Courier assignment & tracking**

### 3. AI Recommendations

- **Interest-based learning** from user activity
- **RAG system** with GPT-4 + LangChain
- **Dynamic updates** to personalized recommendations
- **User tracking** of navigation & opened books to refine suggestions

### 4. Financial System

- **E-wallet with transaction history**
- **Stripe integration** (secure checkout + webhooks)
- **Promo codes** with flexible discounts

### 5. Real-time Features

- **WebSocket notifications** (no refresh)
- **Order status tracking** for staff & customers

### 6. Admin Features

- **Analytics dashboard** for insights
- Full **book & user management**
- **Order oversight** for employees/managers

---

## Performance & Scalability

- **Smart Request Prioritization** to prevent UI blocking
- **Lazy Loading & Code Splitting** for faster rendering
- **Optimized Queries** with proper indexing
- **Advanced Caching** with React Query
- **Cloudinary CDN** for global image delivery

---

## Roles

Book Nook supports **four roles**, each aligned with real-world library workflows:

- **Customer**: Borrow/purchase books, manage wallet, track orders, view history
- **Employee**: Confirm receipts, inspect returns, apply penalties
- **Courier**: Handle delivery & return logistics
- **Manager**: Configure fees, monitor analytics, onboard staff

---

## Conclusion

Book Nook is a modern, scalable book management platform that blends **traditional e-commerce workflows** with **AI-powered personalization**. It delivers:

- **Scalable architecture** (FastAPI + React + PostgreSQL)
- **AI-driven recommendations** via GPT-4 + RAG
- **Real-time communication** with WebSockets
- **Role-based security** with JWT
- **Optimized performance** for large-scale use

The platform is **production-ready**, containerized with Docker, and fully documented for deployment.
