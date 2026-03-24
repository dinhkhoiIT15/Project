# Project Context & Business Logic 📋

## 🎯 Business Context
**E-commerce platform for Vietnamese market** with advanced **AI review moderation** to combat fake reviews (common issue in VN e-commerce).

### Core Problem Solved
- **Fake Reviews**: 30-40% reviews on VN platforms are fake (paid/promotional)
- **Spam/Irrelevant**: Off-topic comments degrade trust
- **Manual Moderation**: Scalability issue for thousands of reviews/day

### Solution
**Dual AI Pipeline**:
1. **SVM Fast Filter** (99% speed): TF-IDF + Vietnamese stopwords
2. **BERT Deep Analysis** (ONNX optimized): Semantic understanding + fake pattern detection
3. **Combined Score**: Review flagged if either model >0.85 confidence

## 🧠 AI Pipeline Details

### 1. Data & Training
```
Datasets (backend/ai/):
├── fake_reviews_dataset.csv (10k samples)
├── new_feedback_data.csv (Recent reviews)
Models:
├── svm_fake_review_model.pkl (SVM)
├── bert_onnx_model/ (DistilBERT Vietnamese + ONNX)
└── bert_fake_review_model/ (PyTorch checkpoint)
```

**Training Scripts**:
```bash
python backend/ai/train_svm.py     # TF-IDF + SVM (5 mins)
python backend/ai/train_bert.py    # Fine-tune + ONNX export (2 hours GPU)
```

### 2. Review Detection Workflow
```
New Review → Preprocessing (VN stopwords) 
         ↓
SVM Predict (ms) → Low confidence? → BERT Analyze (100ms)
         ↓
Score > 0.85? → FLAG as fake/irrelevant → Admin notification (SocketIO)
```

### 3. Review Model Fields
```python
class Review:
    content: str
    rating: int (1-5)
    is_fake: bool          # AI decision
    is_irrelevant: bool    # Off-topic
    confidence_score: float # 0.0-1.0
    is_hidden: bool        # Admin action
```

## 👥 User Roles & Permissions

| Role | Features | API Endpoints |
|------|----------|---------------|
| **Admin** | Full CRUD, AI dashboard, analytics | `/admin/*` |
| **Customer** | Shop, cart, reviews, orders | `/products`, `/cart`, `/orders` |

**Admin Dashboard Metrics**:
- Total Reviews / Fake Detected (%)
- Top Fake Patterns
- User Review Velocity (sudden spikes = suspicious)

## 🔄 Data Flow
```
Frontend → API → DB → AI Service → SocketIO Push → Admin Dashboard
Customer Review ───────┬─────────→ Label: FAKE (0.92) → Hide + Notify
                       │
                    APPROVED ────→ Visible to all
```

## 📊 Key Metrics Tracked
```
Success Criteria:
├── Fake Detection F1: >0.95 (Vietnamese)
├── Processing: <150ms/review 
├── False Positives: <2%
└── Scale: 10k reviews/day
```

## ⚙️ Configuration (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost/ecommerce_ai
JWT_SECRET_KEY=your-super-secret-key-here
AI_MODEL_PATH=./backend/ai/bert_onnx_model/
DEBUG=True
```

## 🚨 Edge Cases Handled
- Vietnamese slang/emojis in reviews
- Review bursts from same IP/User
- Mixed language reviews (VN/EN)
- Rating/review mismatch (1⭐ + \"Great product!\")

