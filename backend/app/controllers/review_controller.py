from flask import request, jsonify
from app.models.models import db, Review, Product, Order, OrderDetail, User
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from app.extensions import socketio

def predict_fake_review(content):
    """Giả lập AI phát hiện Review rác/giả mạo"""
    fake_keywords = ['scam', 'spam', 'buy followers', 'fake', 'terrible product do not buy']
    content_lower = content.lower()
    for word in fake_keywords:
        if word in content_lower:
            return True 
    return False 

def add_review():
    """Customer thêm review. CHỈ CHO PHÉP nếu đã mua hàng thành công."""
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
        }), 403

    existing_review = Review.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing_review:
        return jsonify({"message": "You have already reviewed this product."}), 409

    new_review = Review(
        user_id=user_id,
        product_id=product_id,
        content=content,
        rating=rating,
        is_fake=predict_fake_review(content)
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
        
        socketio.emit('new_review', review_data, to=f'product_{product_id}')
        
        return jsonify({"message": "Review added successfully", "status": "success"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Server error"}), 500

def get_product_reviews(product_id):
    """Lấy danh sách review của 1 sản phẩm cụ thể (Công khai)"""
    reviews = db.session.query(Review, User.username).join(User).filter(
        Review.product_id == product_id,
        Review.is_fake == False 
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
    """Lấy danh sách đánh giá của chính user đang đăng nhập"""
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
    """Admin lấy danh sách các đánh giá bị AI đánh dấu là Fake"""
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
    """Admin lấy toàn bộ đánh giá, có thể lọc theo product_id"""
    product_id = request.args.get('product_id')
    query = db.session.query(Review, User).join(User, Review.user_id == User.user_id)
    
    if product_id and product_id.isdigit():
        query = query.filter(Review.product_id == int(product_id))
        
    reviews = query.order_by(Review.created_at.desc()).all()
    
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
    return jsonify({"reviews": result, "status": "success"}), 200

def delete_review(review_id):
    """Admin xóa review vi phạm"""
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"message": "Review not found"}), 404
    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Delete failed"}), 500