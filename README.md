# AI-Powered E-Commerce Platform with Fake Review Detection

## Overview
Full-stack e-commerce platform featuring:
- Customer shopping (products, cart, checkout, orders, reviews)
- Admin dashboard (manage users, products, categories, orders, reviews)
- **AI Fake Review Detection** using BERT (transformers/PyTorch) for inference and SVM (scikit-learn) for training
- Real-time updates via SocketIO

## Features
- JWT Authentication & Authorization
- CRUD for Products/Categories/Orders/Users/Reviews
- Shopping Cart & Checkout (COD)
- Review system with purchase verification
- **AI detects fake reviews** (>60% confidence hidden, 30-60% flagged)
- Admin review moderation (hide/accept/delete)
- Real-time notifications & review updates
- Responsive React frontend with Tailwind CSS

## Tech Stack
| Backend | Frontend | Database | AI/ML |
|---------|----------|----------|-------|
| Flask, SQLAlchemy | React 18, Context API | PostgreSQL | BERT (transformers), PyTorch, SVM (sklearn), NLTK |
| Flask-JWT-Extended, SocketIO | Tailwind CSS, Axios | | Joblib, Pandas, NumPy |
| Eventlet (async), CORS | | | Accelerate |

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ (create DB: `ecommerce_db`, user: `postgres` / pass: `postgres`)
- Git

## Quick Start

### 1. Clone & Setup
```bash
git clone <repo-url>
cd Project
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Edit config.py or .env for DB if needed
python run.py
```
- API Server: http://localhost:5000
- Default Admin: `admin` / `admin123`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
- App: http://localhost:3000

### 4. AI Model Setup (Optional)
- SVM Training: `cd backend/ai && python train_svm.py`
- BERT: Pre-trained weights in `backend/ai/bert_fake_review_model/`

## Database Setup
```sql
-- Connect to PostgreSQL
CREATE DATABASE ecommerce_db;
```
Uses `postgresql://postgres:postgres@localhost:5432/ecommerce_db` (edit `backend/config.py`)

Auto-migrates tables on first run.

## API Usage
Base URL: `http://localhost:5000`
- Auth: POST `/register`, `/login`
- Products: GET/POST `/products`
- Reviews: POST `/reviews` (AI auto-detects fakes)
- See controllers/routes for full endpoints.

## Admin Panel
- Login as admin
- Manage all entities
- Moderate fake reviews (confidence scores shown)

## Troubleshooting
- **SocketIO issues**: Ensure eventlet installed
- **BERT load fail**: Check `backend/ai/bert_fake_review_model/` exists
- **DB connection**: Verify PostgreSQL running, credentials correct
- **CORS**: Frontend 3000 <-> Backend 5000 allowed

## Development
- Backend hot-reload: `python run.py` (debug=True)
- Frontend: `npm start`
- Train new SVM: `backend/ai/train_svm.py`
- Review AI tests: `/test-ai-review` endpoint

## License
MIT

