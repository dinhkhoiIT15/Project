from flask import request, jsonify
from app.models.models import db, Category

# Lấy danh sách tất cả category (Ai cũng xem được)
def get_all_categories():
    categories = Category.query.all()
    result = []
    for cat in categories:
        result.append({
            "category_id": cat.category_id,
            "name": cat.name,
            "description": cat.description
        })
    return jsonify({"categories": result, "status": "success"}), 200

# Tạo category mới (Chỉ Admin)
def create_category():
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({"message": "Category name is required"}), 400
        
    # Kiểm tra xem tên danh mục đã tồn tại chưa
    existing_category = Category.query.filter_by(name=data.get('name')).first()
    if existing_category:
        return jsonify({"message": "Category already exists"}), 409
        
    new_category = Category(
        name=data.get('name'),
        description=data.get('description', '')
    )
    
    try:
        db.session.add(new_category)
        db.session.commit()
        return jsonify({
            "message": "Category created successfully",
            "category": {
                "id": new_category.category_id,
                "name": new_category.name
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred while creating category"}), 500