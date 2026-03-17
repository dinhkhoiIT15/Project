from flask import request, jsonify
from app.models.models import db, Review, Product, Order, OrderDetail, User, Notification
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from app.extensions import socketio
import os
import torch
import torch.nn.functional as F
from transformers import BertTokenizer, BertForSequenceClassification
from pathlib import Path

# Sử dụng pathlib để xây dựng đường dẫn chuẩn xác và an toàn trên Windows
# __file__ đang ở: backend/app/controllers/review_controller.py
# .parents[2] sẽ trỏ về thư mục gốc: backend/
CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[2]
MODEL_PATH = BACKEND_DIR / 'ai' / 'bert_fake_review_model'

# Chuyển đổi thành string chuẩn của Hệ điều hành đang chạy (Windows)
MODEL_PATH_STR = str(MODEL_PATH)

# Kiểm tra đường dẫn tồn tại trước khi load để chặn lỗi NoneType
if not MODEL_PATH.exists():
    print(f"❌ ERROR: Model directory not found at: {MODEL_PATH_STR}")
else:
    print(f"Loading BERT Model from: {MODEL_PATH_STR}")
    
    # 1. LOAD TOKENIZER (Load thẳng từ vựng gốc, bỏ qua lỗi thiếu file local)
    try:
        print("Loading Tokenizer...")
        bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        print("✅ Tokenizer loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load Tokenizer: {e}")

    # 2. LOAD MODEL (Load phần tạ/weights mà bạn đã train ở local)
    try:
        print("Loading Model...")
        bert_model = BertForSequenceClassification.from_pretrained(MODEL_PATH_STR, local_files_only=True)
        bert_model.eval()
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load Model: {e}")

def predict_fake_score(content):
    """Calculate AI confidence score for fake review detection using BERT."""
    if bert_model is None:
        return 0.0
    
    try:
        # 1. Mã hóa văn bản
        inputs = bert_tokenizer(content, return_tensors="pt", truncation=True, padding=True, max_length=128)
        
        # 2. Dự đoán với PyTorch (tắt tính toán đạo hàm để tiết kiệm RAM)
        with torch.no_grad():
            outputs = bert_model(**inputs)
            
            # 3. Tính xác suất (Softmax)
            probabilities = F.softmax(outputs.logits, dim=-1)
            
            # Label 1 là Fake review (Giả sử index 1 tương ứng với fake trong dữ liệu train)
            fake_score = float(probabilities[0][1])
            return fake_score
    except Exception as e:
        print(f"❌ Error during BERT prediction: {e}")
        return 0.0

def test_ai_review():
    """Test endpoint for UI to verify AI model confidence scores."""
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({"message": "Content is required"}), 400
        
    if bert_model is None:
        return jsonify({"message": "AI model not loaded"}), 500
        
    try:
        inputs = bert_tokenizer(content, return_tensors="pt", truncation=True, padding=True, max_length=128)
        
        with torch.no_grad():
            outputs = bert_model(**inputs)
            probabilities = F.softmax(outputs.logits, dim=-1)[0]
            
            # Lấy xác suất của từng nhãn
            real_prob = float(probabilities[0])
            fake_prob = float(probabilities[1])
            
            # Nếu xác suất fake > real thì kết luận là Fake
            is_fake = fake_prob > real_prob
            
            # Độ tự tin (Confidence) là giá trị lớn nhất (đã nhân 100%)
            confidence = max(real_prob, fake_prob) * 100
        
        return jsonify({
            "is_fake": is_fake,
            "confidence": round(confidence, 2),
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({"message": f"AI Error: {str(e)}"}), 500

def add_review():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    product_id = data.get('product_id')
    content = data.get('content')
    rating = data.get('rating', 5)

    if not product_id or not content:
        return jsonify({"message": "Product ID and content are required"}), 400

    has_purchased = db.session.query(OrderDetail).join(Order).filter(
        Order.user_id == user_id,
        Order.order_status == 'completed',
        OrderDetail.product_id == product_id
    ).first()

    if not has_purchased:
        return jsonify({
            "message": "Verify purchase failed. You can only review products you have successfully purchased."
        }), 400

    existing_review = Review.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing_review:
        return jsonify({"message": "You have already reviewed this product."}), 409
    
    fake_prob = round(predict_fake_score(content), 2)
    
    is_fake = False
    is_hidden = False
    
    if fake_prob >= 60.0:
        is_fake = True
        is_hidden = True
    elif fake_prob >= 30.0:
        is_fake = True
        is_hidden = False
    else:
        is_fake = False
        is_hidden = False

    new_review = Review(
        user_id=user_id,
        product_id=product_id,
        content=content,
        rating=rating,
        is_fake=is_fake,
        is_hidden=is_hidden,
        confidence_score=fake_prob # Lưu % vào DB
    )
    
    try:
        db.session.add(new_review)
        db.session.commit()
        
        user = User.query.get(user_id)
        review_data = {
            "review_id": new_review.review_id,
            "username": user.username if user else "Unknown",
            "content": new_review.content,
            "rating": new_review.rating,
            "date": datetime.utcnow().strftime('%b %d, %Y')
        }
        
        if not is_hidden:
            socketio.emit('new_review', review_data, to=f'product_{product_id}')
        
        socketio.emit('review_list_updated')
        
        return jsonify({
            "message": "Review added successfully",
            "status": "success",
            "review": {"is_fake": is_fake, "is_hidden": is_hidden}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Server error"}), 500

def get_product_reviews(product_id):
    reviews = db.session.query(Review, User.username).join(User).filter(
        Review.product_id == product_id,
        Review.is_fake == False,
        Review.is_hidden == False
    ).order_by(Review.created_at.desc()).all()
    
    result = []
    for r, username in reviews:
        result.append({
            "review_id": r.review_id,
            "username": username,
            "content": r.content,
            "rating": r.rating,
            "date": r.created_at.strftime('%b %d, %Y')
        })
    return jsonify({"reviews": result, "status": "success"}), 200

def get_user_reviews():
    user_id = get_jwt_identity()
    reviews = db.session.query(Review, Product).join(Product, Review.product_id == Product.product_id).filter(Review.user_id == user_id).order_by(Review.created_at.desc()).all()
    
    result = []
    for r, p in reviews:
        result.append({
            "review_id": r.review_id,
            "product_id": p.product_id,
            "product_name": p.name,
            "product_image": p.image_url,
            "content": r.content,
            "rating": r.rating,
            "is_fake": r.is_fake,
            "created_at": r.created_at.strftime('%Y-%m-%d') if r.created_at else "Unknown"
        })
    return jsonify({"reviews": result, "status": "success"}), 200

def get_fake_reviews():
    reviews = db.session.query(Review, User).join(User, Review.user_id == User.user_id).filter(Review.is_fake == True).order_by(Review.created_at.desc()).all()
    
    result = []
    for r, u in reviews:
        result.append({
            "review_id": r.review_id,
            "product_id": r.product_id,
            "user_id": u.user_id,
            "username": u.username,
            "content": r.content,
            "rating": r.rating,
            "is_fake": r.is_fake,
            "created_at": r.created_at.strftime('%Y-%m-%d') if r.created_at else "Unknown"
        })
    return jsonify({"fake_reviews": result, "status": "success"}), 200

def admin_get_all_reviews():
    product_id = request.args.get('product_id')
    username = request.args.get('username') 
    page = request.args.get('page', 1, type=int)
    tab = request.args.get('tab', 'real')
    
    query = db.session.query(Review, User).join(User, Review.user_id == User.user_id)
    
    if tab == 'fake':
        query = query.filter(Review.is_fake == True)
    else:
        query = query.filter(Review.is_fake == False)
    
    if product_id and product_id.isdigit():
        query = query.filter(Review.product_id == int(product_id))
    if username:
        query = query.filter(User.username.ilike(f"%{username}%"))
        
    pagination = query.order_by(Review.created_at.desc()).paginate(page=page, per_page=10, error_out=False)
    reviews = pagination.items
    
    result = []
    for r, u in reviews:
        result.append({
            "review_id": r.review_id,
            "product_id": r.product_id,
            "user_id": u.user_id,
            "username": u.username,
            "content": r.content,
            "rating": r.rating,
            "is_fake": r.is_fake,
            "is_hidden": r.is_hidden,
            "confidence_score": getattr(r, 'confidence_score', 0.0),
            "created_at": r.created_at.strftime('%Y-%m-%d') if r.created_at else "Unknown"
        })
        
    return jsonify({
        "reviews": result, 
        "total_pages": pagination.pages,
        "current_page": pagination.page,
        "status": "success"
    }), 200

def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review: return jsonify({"message": "Review not found"}), 404
    try:
        product_id = review.product_id
        user_id = review.user_id
        
        notif = Notification(
            user_id=user_id,
            order_id=0, 
            message=f"Your review on Product #{product_id} was deleted by Admin due to policy violation."
        )
        db.session.add(notif)
        db.session.delete(review)
        db.session.commit()
        
        socketio.emit('new_notification', {
            "id": notif.id,
            "order_id": notif.order_id,
            "message": notif.message,
            "is_read": False,
            "date": "Just now"
        }, to=f'user_{user_id}')
        
        socketio.emit('review_deleted', {"review_id": review_id}, to=f'product_{product_id}')
        socketio.emit('review_list_updated') 
        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Delete failed"}), 500

def toggle_hide_review(review_id):
    review = Review.query.get(review_id)
    if not review: return jsonify({"message": "Not found"}), 404
    
    review.is_hidden = not review.is_hidden
    db.session.commit()
    
    if review.is_hidden:
        socketio.emit('review_deleted', {"review_id": review_id}, to=f'product_{review.product_id}')
    else:
        socketio.emit('review_unhidden', {}, to=f'product_{review.product_id}') 

    socketio.emit('review_list_updated') 
    return jsonify({"message": "Status updated", "is_hidden": review.is_hidden}), 200

def accept_review(review_id):
    review = Review.query.get(review_id)
    if not review: return jsonify({"message": "Review not found"}), 404
    
    review.is_fake = False
    review.is_hidden = False  # Đảm bảo nó được hiển thị
    db.session.commit()
    
    # Emit to product room to show the review
    socketio.emit('review_unhidden', {
        "review_id": review_id
    }, to=f'product_{review.product_id}')
    socketio.emit('review_list_updated') 
    return jsonify({"message": "Review accepted as real", "status": "success"}), 200

def update_review(review_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    review = Review.query.get(review_id)
    
    if not review or str(review.user_id) != str(user_id):
        return jsonify({"message": "Not authorized to edit this review"}), 403
        
    if 'content' in data:
        review.content = data['content']
        # Update AI prediction
        fake_prob = round(predict_fake_score(data['content']), 2)
        review.confidence_score = fake_prob
        if fake_prob >= 60.0:
            review.is_fake = True
            review.is_hidden = True
        elif fake_prob >= 30.0:
            review.is_fake = True
            review.is_hidden = False
        else:
            review.is_fake = False
            review.is_hidden = False
    if 'rating' in data:
        review.rating = data['rating']
        
    db.session.commit()
    
    # Only emit if not hidden
    if not review.is_hidden:
        socketio.emit('review_updated', {
            "review_id": review.review_id,
            "content": review.content,
            "rating": review.rating
        }, to=f'product_{review.product_id}')
    else:
        # If hidden, emit delete to remove from UI
        socketio.emit('review_deleted', {
            "review_id": review.review_id
        }, to=f'product_{review.product_id}')
    
    socketio.emit('review_list_updated') 
    
    return jsonify({
        "message": "Review updated successfully", 
        "status": "success",
        "is_hidden": review.is_hidden,
        "is_fake": review.is_fake
    }), 200

def user_delete_review(review_id):
    user_id = get_jwt_identity()
    review = Review.query.get(review_id)
    
    if not review or str(review.user_id) != str(user_id):
        return jsonify({"message": "Not authorized to delete this review"}), 403
        
    product_id = review.product_id
    db.session.delete(review)
    db.session.commit()
    
    socketio.emit('review_deleted', {
        "review_id": review_id
    }, to=f'product_{product_id}')
    socketio.emit('review_list_updated')
    
    return jsonify({"message": "Review deleted successfully", "status": "success"}), 200