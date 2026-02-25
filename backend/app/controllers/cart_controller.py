from flask import request, jsonify
from app.models.models import db, Cart, CartItem, Product
from flask_jwt_extended import get_jwt_identity

def add_to_cart():
    data = request.get_json()
    user_id = get_jwt_identity()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({"message": "Product ID is required"}), 400
        
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    # KIỂM TRA: Số lượng yêu cầu có vượt quá tồn kho không?
    if quantity > product.stock_quantity:
        return jsonify({"message": f"Only {product.stock_quantity} items left in stock"}), 400
        
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
        
    cart_item = CartItem.query.filter_by(cart_id=cart.cart_id, product_id=product_id).first()
    
    if cart_item:
        # KIỂM TRA: Tổng số lượng sau khi cộng thêm có vượt quá tồn kho không?
        if (cart_item.quantity + quantity) > product.stock_quantity:
            return jsonify({"message": f"Cannot add more. You already have {cart_item.quantity} in cart and stock is {product.stock_quantity}"}), 400
        cart_item.quantity += quantity
    else:
        new_cart_item = CartItem(cart_id=cart.cart_id, product_id=product_id, quantity=quantity)
        db.session.add(new_cart_item)
        
    try:
        db.session.commit()
        return jsonify({"message": "Product added to cart successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error adding to cart"}), 500

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
                "stock_quantity": product.stock_quantity, # Trả về stock để UI giới hạn nút "+"
                "item_total": item_total,
                "image_url": product.image_url
            })
            
    return jsonify({"cart_items": result, "total_price": total_price, "status": "success"}), 200

def update_cart_item(item_id):
    data = request.get_json()
    new_quantity = data.get('quantity')
    
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
        
    product = Product.query.get(item.product_id)
    # KIỂM TRA: Số lượng cập nhật có vượt quá tồn kho không?
    if new_quantity > product.stock_quantity:
        return jsonify({"message": f"Only {product.stock_quantity} items available"}), 400
        
    if new_quantity <= 0:
        db.session.delete(item)
    else:
        item.quantity = new_quantity
        
    db.session.commit()
    return jsonify({"message": "Quantity updated"}), 200

# === HÀM MỚI BỔ SUNG ĐỂ FIX LỖI IMPORT ===
def remove_from_cart(item_id):
    """Xóa hoàn toàn một sản phẩm khỏi giỏ hàng"""
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
        
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item removed from cart successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error removing item: {str(e)}"}), 500