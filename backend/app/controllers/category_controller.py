from flask import request, jsonify
from app.models.models import db, Category, Product # Import thêm Product để check an toàn
import math

def get_all_categories():
    """Lấy danh sách tất cả category"""
    categories = Category.query.all()
    result = []
    for cat in categories:
        result.append({
            "category_id": cat.category_id,
            "name": cat.name,
            "description": cat.description
        })
    return jsonify({"categories": result, "status": "success"}), 200

def create_category():
    """Tạo category mới"""
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"message": "Category name is required"}), 400
        
    if Category.query.filter_by(name=data.get('name')).first():
        return jsonify({"message": "Category name already exists"}), 409
        
    new_category = Category(name=data.get('name'), description=data.get('description', ''))
    try:
        db.session.add(new_category)
        db.session.commit()
        return jsonify({"message": "Category created successfully"}), 201
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Server error"}), 500

def update_category(category_id):
    """Cập nhật thông tin danh mục"""
    data = request.get_json()
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({"message": "Category not found"}), 404
        
    # Kiểm tra trùng tên với danh mục khác
    if 'name' in data and data['name'] != category.name:
        if Category.query.filter_by(name=data['name']).first():
            return jsonify({"message": "New category name already exists"}), 409
        category.name = data['name']
        
    if 'description' in data:
        category.description = data['description']
        
    try:
        db.session.commit()
        return jsonify({"message": "Category updated successfully"}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Update failed"}), 500

def delete_category(category_id):
    """Xóa danh mục kèm kiểm tra ràng buộc"""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404
        
    # KIỂM TRA AN TOÀN: Không cho xóa nếu có sản phẩm thuộc danh mục này
    linked_product = Product.query.filter_by(category_id=category_id).first()
    if linked_product:
        return jsonify({
            "message": "Cannot delete. This category contains products. Please move or delete products first."
        }), 400
        
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category deleted successfully"}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Delete failed"}), 500