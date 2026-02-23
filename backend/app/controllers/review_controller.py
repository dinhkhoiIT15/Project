from flask import request, jsonify
from app.models.models import db, Review, Product
from flask_jwt_extended import get_jwt_identity

# Hàm MOCK AI: Giả lập phát hiện Fake Review
# Sau này sẽ thay bằng Model AI thật (Xử lý NLP)
def predict_fake_review(content):
    # Tạm thời cấu hình: Nếu comment chứa các từ khóa này thì bị coi là Fake
    fake_keywords = ['scam', 'spam', 'buy followers', 'fake', 'terrible product do not buy']
    content_lower = content.lower()
    for word in fake_keywords:
        if word in content_lower:
            return True # Phát hiện Fake!
    return False # Comment bình thường

# API: Người dùng thêm Review (Cần đăng nhập)
def add_review():
    data = request.get_json()
    user_id = get_jwt_identity() # Lấy ID người dùng từ Token
    
    if not data or not data.get('product_id') or not data.get('content'):
        return jsonify({"message": "Product ID and content are required"}), 400
        
    # Gọi AI model để kiểm tra nội dung
    is_fake_detected = predict_fake_review(data.get('content'))
    
    new_review = Review(
        user_id=user_id,
        product_id=data.get('product_id'),
        content=data.get('content'),
        is_fake=is_fake_detected
    )
    
    try:
        db.session.add(new_review)
        db.session.commit()
        return jsonify({
            "message": "Review added successfully",
            "review": {
                "id": new_review.review_id,
                "is_fake": new_review.is_fake # Trả về để ta dễ test
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred while adding review"}), 500

# API: Admin lấy danh sách Fake Reviews cho Dashboard
def get_fake_reviews():
    # Lấy các review bị AI đánh dấu là Fake
    fake_reviews = Review.query.filter_by(is_fake=True).all()
    result = []
    for r in fake_reviews:
        result.append({
            "review_id": r.review_id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "content": r.content
        })
    return jsonify({"fake_reviews": result, "status": "success"}), 200

# API: Admin quyết định xóa (ẩn) Fake Review
def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"message": "Review not found"}), 404
        
    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred while deleting review"}), 500