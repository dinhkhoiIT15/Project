from flask import request, jsonify
from app.models.models import db, Review, Product, Order, OrderDetail, User, Notification, Category
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from app.extensions import socketio
import os
import re
import requests

# Địa chỉ của AI Microservice đang chạy ở cổng 8000
AI_SERVICE_URL = "http://127.0.0.1:8000/predict"

def is_gibberish(text):
    """Phát hiện chuỗi vô nghĩa, quảng cáo hoặc link tào lao."""
    # 1. Chặn Link quảng cáo
    if re.search(r'(http://|https://|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})', text):
        return True
    
    words = text.split()
    for word in words:
        # 2. Từ quá dài không có khoảng trắng (VD: asdasdasdasdasdasd)
        if len(word) > 20:
            return True
        # 3. Chuỗi chứa 6 phụ âm liên tiếp (VD: bcdfgh)
        if re.search(r'[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}', word):
            return True
            
    return False

def is_irrelevant_comment(content, product_name, category_name):
    """Check if the review is irrelevant or off-topic for the product."""
    content_lower = content.lower()
    
    # 1. Blacklist of keywords from other categories (can be expanded)
    # Example: If selling a Phone, but the comment contains words related to Clothing, Home Appliances...
    wrong_context_keywords = {
        'phone': ['shirt', 'pants', 'shoes', 'fridge', 'kitchen', 'keyboard', 'mouse'],
        'laptop': ['shirt', 'pants', 'phone', 'lipstick', 'sunscreen'],
        'clothing': ['battery', 'screen', 'keyboard', 'specs', 'ram', 'ssd']
    }
    
    # Determine the current product category (based on category_name or product_name)
    current_context = ""
    if category_name:
        cat_lower = category_name.lower()
        if 'phone' in cat_lower or 'mobile' in cat_lower: 
            current_context = 'phone'
        elif 'laptop' in cat_lower or 'computer' in cat_lower: 
            current_context = 'laptop'
        elif 'cloth' in cat_lower or 'apparel' in cat_lower: 
            current_context = 'clothing'
            
    # If the product context is identified, check if the comment contains irrelevant keywords
    if current_context in wrong_context_keywords:
        for wrong_word in wrong_context_keywords[current_context]:
            if wrong_word in content_lower:
                return True  # Clearly irrelevant!

    return False

def predict_fake_score(content):
    """Gửi request sang AI Microservice để chấm điểm Fake Review."""
    try:
        response = requests.post(AI_SERVICE_URL, json={"content": content}, timeout=5)
        if response.status_code == 200:
            data = response.json()
            # Lấy điểm fake_score (thang 0-100)
            return data.get("fake_score", 0.0)
        else:
            print(f"⚠️ AI Service returned status {response.status_code}")
            return 0.0
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to AI Microservice: {e}")
        return 0.0

def test_ai_review():
    """Test endpoint for UI to verify AI model confidence scores via Microservice."""
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({"message": "Content is required"}), 400
        
    try:
        response = requests.post(AI_SERVICE_URL, json={"content": content}, timeout=5)
        
        if response.status_code == 503:
            return jsonify({"message": "AI Server is warming up. Please wait!"}), 503
            
        if response.status_code != 200:
            return jsonify({"message": f"AI Service Error: {response.text}"}), 500
            
        result = response.json()
        real_prob = result["real_prob"]
        fake_prob = result["fake_prob"]
        
        is_fake = fake_prob > real_prob
        confidence = max(real_prob, fake_prob) * 100
        
        return jsonify({
            "is_fake": is_fake,
            "confidence": round(confidence, 2),
            "status": "success"
        }), 200
        
    except requests.exceptions.ConnectionError:
        return jsonify({"message": "Cannot connect to AI Microservice (Port 8000). Is it running?"}), 500
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

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
    
    # Lấy thông tin sản phẩm và danh mục để làm ngữ cảnh kiểm tra lạc đề
    product_info = Product.query.get(product_id)
    category_info = Category.query.get(product_info.category_id) if product_info and product_info.category_id else None
    product_name = product_info.name if product_info else ""
    category_name = category_info.name if category_info else ""

    is_irrelevant_flag = is_irrelevant_comment(content, product_name, category_name)

    # Kiểm tra Gibberish/Link tào lao trước
    if is_gibberish(content):
        fake_prob = 99.9  # Ép điểm tuyệt đối để đưa ngay vào thẻ AI Fake Alerts
    else:
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
        confidence_score=fake_prob,
        is_irrelevant=is_irrelevant_flag  # Lưu trạng thái lạc đề
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
            "is_irrelevant": getattr(r, 'is_irrelevant', False), # MỚI: Trả về Frontend
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

def admin_get_product_context(product_id):
    """API lấy thông tin sản phẩm và toàn bộ review của nó cho Pop-up"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    reviews = db.session.query(Review, User.username).join(User).filter(
        Review.product_id == product_id
    ).order_by(Review.created_at.desc()).all()
    
    result_reviews = []
    for r, username in reviews:
        result_reviews.append({
            "review_id": r.review_id,
            "username": username,
            "content": r.content,
            "rating": r.rating,
            "is_fake": r.is_fake,
            "is_hidden": r.is_hidden,
            "confidence_score": getattr(r, 'confidence_score', 0.0),
            "date": r.created_at.strftime('%b %d, %Y') if r.created_at else "Unknown"
        })
        
    return jsonify({
        "product": {
            "product_id": product.product_id,
            "name": product.name,
            "image_url": product.image_url,
            "price": product.price
        },
        "reviews": result_reviews,
        "status": "success"
    }), 200