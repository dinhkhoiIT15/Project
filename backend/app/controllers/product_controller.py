from flask import request, jsonify
from app.models.models import db, Product, Category

# Hàm giả lập AI (Chúng ta sẽ thay bằng Model AI thật ở Giai đoạn sau)
def generate_ai_description(name, category_name):
    return f"This is an automated description for {name} in the {category_name} category. High quality and highly recommended!"

# Lấy danh sách sản phẩm (Public)
def get_all_products():
    products = Product.query.all()
    result = []
    for p in products:
        result.append({
            "product_id": p.product_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "stock_quantity": p.stock_quantity,
            "category_id": p.category_id,
            "image_url": p.image_url
        })
    return jsonify({"products": result, "status": "success"}), 200

# Thêm sản phẩm mới (Chỉ Admin)
def create_product():
    data = request.get_json()
    
    # 1. Kiểm tra đầu vào cơ bản
    if not data or not data.get('name') or not data.get('price') or not data.get('category_id'):
        return jsonify({"message": "Name, price, and category_id are required"}), 400
        
    # 2. Kiểm tra xem Category có tồn tại không
    category = Category.query.get(data.get('category_id'))
    if not category:
        return jsonify({"message": "Category not found"}), 404
        
    # 3. Gọi AI để sinh mô tả tự động (Dựa trên tên và danh mục)
    ai_description = generate_ai_description(data.get('name'), category.name)
    
    # 4. Tạo sản phẩm mới với mô tả từ AI
    new_product = Product(
        name=data.get('name'),
        price=data.get('price'),
        description=ai_description, # Mô tả do AI tạo ra
        stock_quantity=data.get('stock_quantity', 0),
        category_id=data.get('category_id'),
        image_url=data.get('image_url', '')
    )
    
    try:
        db.session.add(new_product)
        db.session.commit()
        return jsonify({
            "message": "Product created successfully",
            "product": {
                "id": new_product.product_id,
                "name": new_product.name,
                "description": new_product.description # Trả về xem AI viết gì
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred while creating product"}), 500