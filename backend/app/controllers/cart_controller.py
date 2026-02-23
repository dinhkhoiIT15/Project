from flask import request, jsonify
from app.models.models import db, Cart, CartItem, Product
from flask_jwt_extended import get_jwt_identity

# Thêm sản phẩm vào giỏ hàng
def add_to_cart():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({"message": "Product ID is required"}), 400
        
    # Kiểm tra xem sản phẩm có tồn tại không
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    # 1. Tìm giỏ hàng của user. Nếu chưa có thì tạo mới.
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit() # Lưu để lấy cart_id
        
    # 2. Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    cart_item = CartItem.query.filter_by(cart_id=cart.cart_id, product_id=product_id).first()
    
    if cart_item:
        # Nếu có rồi thì tăng số lượng
        cart_item.quantity += quantity
    else:
        # Nếu chưa có thì thêm mới vào giỏ
        new_cart_item = CartItem(
            cart_id=cart.cart_id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(new_cart_item)
        
    try:
        db.session.commit()
        return jsonify({"message": "Product added to cart successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred while adding to cart"}), 500

# Xem giỏ hàng của người dùng hiện tại
def get_cart():
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()
    
    if not cart:
        return jsonify({"cart_items": [], "total_price": 0, "status": "success"}), 200
        
    cart_items = CartItem.query.filter_by(cart_id=cart.cart_id).all()
    result = []
    total_price = 0
    
    for item in cart_items:
        product = Product.query.get(item.product_id)
        if product:
            item_total = product.price * item.quantity
            total_price += item_total
            result.append({
                "cart_item_id": item.cart_item_id,
                "product_id": product.product_id,
                "product_name": product.name,
                "price": product.price,
                "quantity": item.quantity,
                "item_total": item_total
            })
            
    return jsonify({
        "cart_items": result,
        "total_price": total_price,
        "status": "success"
    }), 200