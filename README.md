# 🛒 E-Commerce Platform with AI-Powered Fake Review Detection

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)

A full-stack e-commerce platform with intelligent fake review detection using BERT-based machine learning models. The system identifies and filters fake product reviews to ensure authentic customer feedback.

---

## 🧰 Technology Stack

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| **Flask** | 3.0.3 | Web framework for REST API |
| **Flask-SQLAlchemy** | 3.1.1 | ORM for database operations |
| **Flask-JWT-Extended** | 4.6.0 | JWT authentication |
| **Flask-SocketIO** | 5.5.0 | Real-time bidirectional communication |
| **PostgreSQL** | - | Primary database (supports SQLite for dev) |
| **Eventlet** | 0.36.1 | High-performance networking |

### AI/ML Service
| Technology | Version | Description |
|------------|---------|-------------|
| **FastAPI** | 0.115.0 | High-performance AI microservice |
| **Transformers** | 4.44.2 | BERT model & tokenizer |
| **ONNX Runtime** | 1.19.2 | Ultra-fast inference (no PyTorch dependency) |
| **Scikit-learn** | 1.5.1 | SVM fake review detection baseline |
| **Pydantic** | 2.9.2 | Data validation |
| **HuggingFace Hub** | 0.26.1 | Model storage & deployment |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| **React** | 19.2.4 | UI library |
| **Vite** | 8.0.0 | Build tool |
| **Tailwind CSS** | 3.4.19 | Utility-first CSS framework |
| **Recharts** | 3.7.0 | Data visualization |
| **Socket.io-client** | 4.8.3 | Real-time updates |
| **Axios** | 1.13.5 | HTTP client |
| **React Router** | 7.13.0 | Client-side routing |

---

## 📁 Project Structure

```
Project/
├── backend/                      # Flask Backend API
│   ├── app/
│   │   ├── models/              # Database models
│   │   │   └── models.py        # User, Product, Order, Review, Cart models
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth_routes.py   # Authentication endpoints
│   │   │   ├── product_routes.py
│   │   │   ├── order_routes.py
│   │   │   ├── cart_routes.py
│   │   │   ├── review_routes.py
│   │   │   └── dashboard_routes.py
│   │   ├── controllers/        # Business logic
│   │   └── utils/             # Utilities & decorators
│   ├── ai/                    # AI Training scripts & models
│   │   ├── train_svm.py       # SVM model training
│   │   ├── train_bert.py      # BERT model training
│   │   ├── svm_fake_review_model.pkl
│   │   └── bert_onnx_model/   # Exported BERT model
│   ├── ai_service/            # FastAPI AI Microservice
│   │   └── main.py           # Fake review detection API
│   ├── config.py             # Configuration
│   ├── run.py               # Application entry point
│   └── requirements.txt    # Python dependencies
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── cart/       # Shopping cart
│   │   │   ├── common/     # Button, Input, Modal, etc.
│   │   │   └── layout/     # Navbar, Footer, Layout
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard, product management
│   │   │   ├── auth/      # Login, Register pages
│   │   │   └── customer/   # Home, ProductDetail, Cart, Checkout
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React Context (Auth, Cart, Toast)
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Main application
│   ├── package.json
│   └── vite.config.js
│
└── README.md                # This file
```

---

## ✨ Features

### E-Commerce Core
- 👤 **User Management** - Registration, login, profile management
- 📦 **Product Catalog** - Browse, search, filter products by category
- 🛒 **Shopping Cart** - Add/remove items, quantity management
- 📝 **Order Processing** -Checkout, order history, order tracking
- ★ **Review System** - Product reviews with ratings
- 📊 **Admin Dashboard** - Analytics, user/product/review management

### AI-Powered Fake Review Detection
- 🤖 **BERT-based Detection** - Transformer-based model for fake review classification
- ⚡ **ONNX Runtime** - Ultra-fast inference (no GPU required)
- 📊 **Confidence Scoring** - Probability scores for each prediction
- 🔄 **Real-time Detection** - Instant review analysis via API
- 🔌 **Microservice Architecture** - Independent AI service deployable anywhere

### Real-Time Features
- 🔔 **Live Notifications** - Order status updates via Socket.IO
- 🛒 **Cart Sync** - Multi-device cart synchronization

---

## 🚀 Quick Start

> ⚠️ **Prerequisites**: Python 3.10+, Node.js 18+, PostgreSQL (optional)

### Step 1: Install Backend Dependencies

Navigate to the backend directory and install all required packages:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database (use SQLite for development)
DATABASE_URL=sqlite:///app.db
# Or PostgreSQL:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_db

# Security
SECRET_KEY=your_secret_key_here

# HuggingFace (for AI model sync - optional)
HF_TOKEN=your_huggingface_token
```

### Step 3: Start Backend Server

```bash
cd backend
venv\Scripts\activate
python run.py
```

- API server runs at **http://localhost:5000**
- Default admin account: `admin` / `admin123`

### Step 4: Start AI Service

Open a new terminal:

```bash
cd backend
venv\Scripts\activate
cd backend/ai_service
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

- AI service runs at **http://localhost:8000**
- API documentation at **http://localhost:8000/docs**

### Step 5: Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs at **http://localhost:5173**

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/<id>` | Get product details |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/<id>` | Update product (Admin) |
| DELETE | `/api/products/<id>` | Delete product (Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | User orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/<id>` | Order details |

### Reviews (with AI Detection)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Product reviews |
| POST | `/api/reviews` | Add review |
| POST | `/api/reviews/detect` | AI fake review detection |

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Detect fake review |

---

## 🖥️ Development

### Running All Services Together

**Terminal 1 - Backend:**
```bash
cd backend && python run.py
```

**Terminal 2 - AI Service:**
```bash
cd backend/ai_service && uvicorn main:app --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend && npm run dev
```

### Production Deployment

**Backend with Gunicorn:**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

**AI Service:**
```bash
cd backend/ai_service
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend Build:**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## 📦 Database Models

### Core Entities
- **User** - id, username, password, phone, address, role, status
- **Category** - id, name, description
- **Product** - id, name, price, description, stock, category, image_url
- **Review** - id, user_id, product_id, content, rating, timestamps
- **Order** - id, user_id, total_amount, status, payment_method
- **Cart** - id, user_id, items

### AI-Enhanced Fields
- `Review.is_fake` - AI classification result
- `Review.confidence_score` - Detection confidence (0-100)
- `Review.is_hidden` - Auto-hidden fake reviews

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [HuggingFace](https://huggingface.co/) - Model hub
- [ONNX Runtime](https://onnxruntime.ai/) - Cross-platform inference
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [React](https://react.dev/) - UI library
