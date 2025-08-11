# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack Fruit Store webapp with a clear separation between frontend and backend:

- **Frontend**: Vite + TypeScript SPA with pagination, basket functionality, and emoji-based fruit display (src/main.ts)
- **Backend**: FastAPI + MongoDB with CRUD operations for fruits and orders (backend/main.py)
- **Database**: MongoDB with collections for fruits and orders

## Development Commands

### Frontend (root directory)
- **Start dev server**: `npm run dev` - Runs Vite development server
- **Build**: `npm run build` - TypeScript compilation + Vite build
- **Preview**: `npm run preview` - Preview production build
- **Install deps**: `npm install`

### Backend (backend/ directory)
- **Setup virtual env**: `python -m venv venv` then `.\venv\Scripts\activate` (Windows)
- **Install deps**: `pip install -r requirements.txt` (or `pip install fastapi uvicorn pymongo`)
- **Start server**: `uvicorn main:app --reload` - Runs FastAPI development server
- **MongoDB**: Ensure MongoDB is running locally or update MONGO_URL env var in main.py

## Key Implementation Details

### Frontend State Management
- Uses vanilla TypeScript with a global `basket` object for cart state
- Pagination implemented with `currentPage` state and 9 items per page
- Fruit data is hardcoded in main.ts with emoji mapping

### Backend API Structure
- FastAPI with Pydantic models: `Fruit`, `FruitInDB`, `Order`, `OrderItem`, `OrderInDB`
- MongoDB collections: `fruits` and `orders`
- CRUD endpoints: `/fruits` (GET, POST, PUT, DELETE) and `/orders` (GET, POST)
- ObjectId handling for MongoDB document IDs

### Database Connection
- MongoDB URL configurable via MONGO_URL environment variable
- Default: `mongodb://localhost:27017/`
- Database name: `fruitstore`

## Tech Stack Guidelines
- Follow Vite + TypeScript patterns for frontend development
- Use FastAPI + Pydantic for backend API development
- MongoDB with pymongo for database operations
- Maintain separation between frontend and backend codebases