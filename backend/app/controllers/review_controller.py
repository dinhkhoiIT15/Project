from flask import request, jsonify
from app.models.models import db, Review, Product, Order, OrderDetail, User, Notification
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from app.extensions import socketio
import joblib
import os
import string
import nltk
from nltk.corpus import stopwords
from flask import current_app
import __main__

# 1. Định nghĩa lại hàm tiền xử lý text y hệt như bên file train
def text_process(review):
    nopunc = [char for char in review if char not in string.punctuation]
    nopunc = ''.join(nopunc)
    return [word for word in nopunc.split() if word.lower() not in stopwords.words('english')]

# 2. "Bơm" hàm này vào bộ nhớ chính (__main__) để joblib tìm thấy khi giải nén
__main__.text_process = text_process

# Load the AI SVM model trained in Step 1
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ai/svm_fake_review_model.pkl'))
try:
    svm_model = joblib.load(MODEL_PATH)
    print("✅ AI Model loaded successfully!")
except Exception as e:
    print(f"❌ Failed to load AI Model: {e}")
    svm_model = None

def predict_fake_score(content):
    """AI Support Vector Machines: Trả về chính xác phần trăm khả năng là Fake"""
    if svm_model is None:
        return 0.0
    
    try:
        probabilities = svm_model.predict_proba([content])[0]
        classes = svm_model.classes_
        
        # Tìm xem class Fake (1, 1.0 hoặc CG) đang nằm ở vị trí nào trong mảng xác suất
        fake_idx = -1
        for i, c in enumerate(classes):
            c_str = str(c).strip().upper()
            if c_str in ('1', '1.0', 'CG'):
                fake_idx = i
                break
        
        # Nếu tìm thấy, trả về đúng % của class Fake
        if fake_idx != -1:
            return float(probabilities[fake_idx] * 100)
            
        return 0.0
    except Exception as e:
        print(f"Error calculating AI score: {e}")
        return 0.0

def test_ai_review():
    """API dành riêng cho Test UI để kiểm tra độ tin cậy của AI"""
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({"message": "Content is required"}), 400
        
    if svm_model is None:
        return jsonify({"message": "AI model not loaded"}), 500
        
    try:
        # 1. Lấy kết quả phán đoán (Fake/Real)
        prediction = svm_model.predict([content])[0]
        print(f"DEBUG AI - Raw prediction: {prediction} (Type: {type(prediction)})")
        
        # Xử lý nhãn an toàn như hàm trên
        pred_str = str(prediction).strip().upper()
        is_fake = True if (pred_str == '1' or pred_str == '1.0' or pred_str == 'CG') else False
        
        # 2. Lấy phần trăm độ tin cậy (Xác suất)
        probabilities = svm_model.predict_proba([content])[0]
        confidence = float(max(probabilities) * 100)
        
        return jsonify({
            "is_fake": is_fake,
            "confidence": round(confidence, 2),
            "status": "success"
        }), 200
    except Exception as e:
        error_msg = str(e)
        print(f"CRITICAL AI ERROR: {error_msg}")
        # Bắn thẳng lỗi thực tế về Frontend để xem bị gì
        return jsonify({"message": f"AI Error: {error_msg}"}), 500

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
    
    # MỚI: Lấy phần trăm Fake từ AI
    fake_prob = round(predict_fake_score(content), 2)
    
    is_fake = False
    is_hidden = False
    
    # Logic kiểm duyệt 3 cấp độ
    if fake_prob >= 60.0:
        is_fake = True
        is_hidden = True   # >= 60%: Nguy hiểm -> Ẩn tự động, đưa vào Alert
    elif fake_prob >= 30.0:
        is_fake = True
        is_hidden = False  # >= 30%: Nghi ngờ -> Vẫn hiện, nhưng đưa vào Alert
    else:
        is_fake = False
        is_hidden = False  # < 30%: An toàn (Real)

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
        
        # MỚI: Chỉ "bắn" review lên màn hình real-time nếu AI KHÔNG bắt nó là Fake
        if not is_hidden:
            socketio.emit('new_review', review_data, to=f'product_{product_id}')
            
        # Vẫn báo cho Admin biết để cập nhật danh sách quản lý
        socketio.emit('review_list_updated') 
        
        # MỚI: Trả về trạng thái is_fake để Frontend hiện đúng thông báo (Toast)
        return jsonify({
            "message": "Review added successfully", 
            "status": "success",
            "review": {"is_fake": is_fake}
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
    tab = request.args.get('tab', 'real') # MỚI: Lấy tham số tab từ Frontend
    
    query = db.session.query(Review, User).join(User, Review.user_id == User.user_id)
    
    # MỚI: Lọc dữ liệu theo tab tương ứng
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
            "confidence_score": getattr(r, 'confidence_score', 0.0), # Lấy % hiển thị cho Admin
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
        review.is_fake = predict_fake_review(data['content']) 
    if 'rating' in data:
        review.rating = data['rating']
        
    db.session.commit()
    
    socketio.emit('review_updated', {
        "review_id": review.review_id,
        "content": review.content,
        "rating": review.rating
    }, to=f'product_{review.product_id}')
    socketio.emit('review_list_updated') 
    
    return jsonify({"message": "Review updated successfully", "status": "success"}), 200

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