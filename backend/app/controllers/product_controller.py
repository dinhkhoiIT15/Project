from flask import request, jsonify
from app.models.models import db, Product, Category, CartItem, OrderDetail, Review
import math

def generate_ai_description(name, category_name):
    """Tạo mô tả sản phẩm tự động bằng AI (Giả lập)"""
    return f"Professional AI description for {name} ({category_name}): This high-quality product is designed for excellence and durability."

def get_all_products():
    """Lấy danh sách sản phẩm có hỗ trợ tìm kiếm, lọc theo danh mục và phân trang"""
    search = request.args.get('search', '')
    category_id = request.args.get('category_id', '')
    
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 8))
    except ValueError:
        page = 1
        per_page = 8
    
    query = db.session.query(Product, Category.name.label('category_name')).outerjoin(
        Category, Product.category_id == Category.category_id
    )
    
    # Lọc theo từ khóa tìm kiếm
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))
        
    # SỬA LỖI TẠI ĐÂY: Thụt đầu dòng đúng cho khối lệnh bên trong 'if'
    if category_id and str(category_id).strip() != '' and str(category_id).lower() != 'null':
        try:
            cat_id_int = int(category_id)
            # Chỉ thực hiện filter nếu ID là một số nguyên hợp lệ lớn hơn 0
            if cat_id_int > 0:
                query = query.filter(Product.category_id == cat_id_int)
        except (ValueError, TypeError):
            # Nếu ID không phải là số (chuỗi rác), bỏ qua filter để trả về toàn bộ sản phẩm
            pass
            
    total_count = query.count()
    total_pages = math.ceil(total_count / per_page)
    products = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for p, category_name in products:
        result.append({
            "product_id": p.product_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "stock_quantity": p.stock_quantity,
            "category_id": p.category_id,
            "category_name": category_name or "General",
            "image_url": p.image_url
        })
        
    return jsonify({
        "products": result, 
        "total_pages": total_pages,
        "current_page": page,
        "total_products": total_count,
        "status": "success"
    }), 200

def get_product_by_id(product_id):
    """Lấy chi tiết một sản phẩm theo ID"""
    data = db.session.query(Product, Category.name.label('category_name')).outerjoin(
        Category, Product.category_id == Category.category_id
    ).filter(Product.product_id == product_id).first()

    if not data:
        return jsonify({"message": "Product not found"}), 404
        
    p, cat_name = data

    # MỚI: Tính toán thống kê Review
    reviews = Review.query.filter_by(product_id=product_id, is_fake=False).all()
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0

    return jsonify({
        "product": {
            "product_id": p.product_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "stock_quantity": p.stock_quantity,
            "category_id": p.category_id,
            "category_name": cat_name or "Uncategorized",
            "image_url": p.image_url,
            "avg_rating": round(avg_rating, 1),
            "review_count": len(reviews)
        },
        "status": "success"
    }), 200

def create_product():
    """Tạo sản phẩm mới và tự động tạo mô tả bằng AI"""
    data = request.get_json()
    try:
        category = Category.query.get(int(data.get('category_id')))
        if not category:
            return jsonify({"message": "Category not found"}), 404
            
        ai_description = generate_ai_description(data.get('name'), category.name)
        
        new_product = Product(
            name=data.get('name'),
            price=float(data.get('price')),
            description=ai_description,
            stock_quantity=int(data.get('stock_quantity', 0)),
            category_id=int(data.get('category_id')),
            image_url=data.get('image_url', '')
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({
            "message": "Product created successfully", 
            "product": {"id": new_product.product_id}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Create error: {str(e)}"}), 500

def update_product(product_id):
    """Cập nhật thông tin sản phẩm"""
    data = request.get_json()
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    try:
        if 'name' in data: product.name = data['name']
        if 'price' in data: product.price = float(data['price'])
        if 'stock_quantity' in data: product.stock_quantity = int(data['stock_quantity'])
        if 'image_url' in data: product.image_url = data['image_url']
        if 'category_id' in data: product.category_id = int(data['category_id'])
            
        category = Category.query.get(product.category_id)
        if category:
            product.description = generate_ai_description(product.name, category.name)

        db.session.commit()
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Update error: {str(e)}"}), 500

def delete_product(product_id):
    """
    Xóa sản phẩm và toàn bộ lịch sử liên quan (OrderDetail, Cart, Reviews).
    Cho phép Admin dọn dẹp Database ngay cả khi sản phẩm đã có lịch sử đơn hàng.
    """
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    try:
        # 1. Xóa các bản ghi ở các bảng tham chiếu trước để tránh lỗi Foreign Key Constraint
        OrderDetail.query.filter_by(product_id=product_id).delete()
        CartItem.query.filter_by(product_id=product_id).delete()
        Review.query.filter_by(product_id=product_id).delete()

        # 2. Xóa bản ghi sản phẩm chính
        db.session.delete(product)
        
        # 3. Lưu các thay đổi
        db.session.commit()
        
        return jsonify({
            "message": "Product and all related history deleted successfully",
            "status": "success"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Delete error: {str(e)}",
            "status": "error"
        }), 500