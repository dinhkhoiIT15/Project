from flask import request, jsonify
from app.models.models import db, Cart, CartItem, Order, OrderDetail, Product
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

def checkout():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    # Lấy thông tin địa chỉ giao hàng từ request, nếu không có thì lấy chuỗi rỗng
    shipping_address = data.get('shipping_address', '')
    
    # 1. Tìm giỏ hàng của user
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"message": "Cart is empty"}), 400
        
    cart_items = CartItem.query.filter_by(cart_id=cart.cart_id).all()
    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 400
        
    # 2. Tính tổng tiền và chuẩn bị tạo Order
    total_amount = 0
    for item in cart_items:
        product = Product.query.get(item.product_id)
        if product:
            total_amount += product.price * item.quantity
            
            # (Tùy chọn) Kiểm tra số lượng tồn kho ở đây
            if product.stock_quantity < item.quantity:
                return jsonify({"message": f"Not enough stock for {product.name}"}), 400
    
    # 3. Tạo Đơn hàng (Order)
    new_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        order_status='pending',   # Trạng thái chờ xử lý
        payment_status='pending', # Trạng thái chờ thanh toán
        shipping_address=shipping_address,
        order_date=datetime.utcnow()
    )
    db.session.add(new_order)
    db.session.flush() # Lưu tạm để lấy order_id sinh ra tự động
    
    # 4. Chuyển sản phẩm từ CartItem sang OrderDetail
    for item in cart_items:
        product = Product.query.get(item.product_id)
        
        order_detail = OrderDetail(
            order_id=new_order.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=product.price # Lưu lại giá tại thời điểm mua
        )
        db.session.add(order_detail)
        
        # Trừ số lượng tồn kho của sản phẩm
        product.stock_quantity -= item.quantity
        
        # Xóa sản phẩm khỏi giỏ hàng
        db.session.delete(item)
        
    # 5. Lưu toàn bộ thay đổi vào Database
    try:
        db.session.commit()
        return jsonify({
            "message": "Checkout successful. Order created.",
            "order_id": new_order.order_id,
            "total_amount": total_amount
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred during checkout"}), 500