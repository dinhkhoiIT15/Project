# Project Context: AI-Enhanced E-Commerce Platform

## Overview
This is a full-stack e-commerce application with integrated machine learning capabilities for detecting fake product reviews. It features a customer-facing shopping experience and an admin dashboard with AI-powered moderation tools.

## Technologies Used

### Backend (Python)
- **Flask** 3.0.0 - Web framework
- **SQLAlchemy** 3.1.1 - ORM with PostgreSQL database
- **JWT** - Authentication and authorization
- **Socket.io** - Real-time notifications and WebSocket support
- **Eventlet** - Async I/O handling

### Frontend (React)
- **React** 19.2.4 - UI framework
- **React Router** 7.13.0 - Client-side routing
- **TailwindCSS** 3.4.19 - Styling
- **Axios** - HTTP client for API calls
- **Socket.io Client** 4.8.3 - Real-time communication
- **Recharts** 3.7.0 - Data visualization (for admin dashboard)
- **Lucide React** - Icon library

### AI/ML Components
- **Scikit-learn** 1.3.2 - SVM classifier for fake review detection
- **NLTK** 3.8.1 - Natural language processing & text preprocessing
- **Transformers** 4.35.2 - Advanced NLP models
- **PyTorch** 2.1.1 - Deep learning framework
- **Pandas & NumPy** - Data manipulation

## Project Structure

### Backend (`backend/`)
- `run.py` - Application entry point
- `config.py` - Configuration settings
- `requirements.txt` - Python dependencies
- `app/` - Main application code
  - `models/models.py` - Database models (User, Product, Order, etc.)
  - `controllers/` - Business logic controllers
  - `routes/` - API route definitions
  - `utils/` - Utility functions and decorators
- `ai/` - Machine learning components
  - `train_svm.py` - SVM model training script
  - `fake_reviews_dataset.csv` - Training dataset for fake review detection

### Frontend (`frontend/`)
- `package.json` - Node.js dependencies and scripts
- `src/` - React application source
  - `components/` - Reusable UI components
  - `pages/` - Page components (admin/customer sections)
  - `context/` - React context providers (Auth, Cart, Toast)
  - `services/api.js` - API service layer

## Main Features

### Core E-Commerce
- User registration and authentication (roles: Customer, Admin)
- Product catalog organized by categories
- Shopping cart management
- Order placement with multiple payment methods (COD, transaction tracking)
- User profiles with address management
- Review and rating system

### AI-Powered Review Moderation
- SVM-based fake review classifier
- Text preprocessing with NLTK stopword removal
- Confidence scoring for AI predictions
- Review hiding/flagging functionality
- Model exports as `svm_fake_review_model.pkl`

### Admin Dashboard
- Manage products, categories, users, orders, and reviews
- Real-time metrics and charts
- AI moderation tools

### Real-Time Features
- WebSocket support for instant notifications
- Order status updates
- Admin-to-customer messaging capability

## Development Environment
- Backend: Python virtual environment (venv)
- Frontend: Node.js with npm
- Database: PostgreSQL
- AI: Trained SVM model for fake review detection

## Key Files to Reference
- Backend entry: `backend/run.py`
- Frontend entry: `frontend/src/index.js`
- Models: `backend/app/models/models.py`
- AI training: `backend/ai/train_svm.py`
- API routes: `backend/app/routes/`
- React components: `frontend/src/components/`

This context file provides a high-level overview for quick understanding of the project structure and capabilities.