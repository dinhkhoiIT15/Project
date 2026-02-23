from flask import request, jsonify
from app.models.models import db, Cart, CartItem, Order, OrderDetail, Product, User
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

# 1. Chốt đơn (Giữ nguyên code cũ của bạn)
def checkout():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    shipping_address = data.get('shipping_address', '')
    
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"message": "Cart is empty"}), 400
    cart_items = CartItem.query.filter_by(cart_id=cart.cart_id).all()
    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 400
        
    total_amount = 0
    for item in cart_items:
        product = Product.query.get(item.product_id)
        if product:
            total_amount += product.price * item.quantity
            if product.stock_quantity < item.quantity:
                return jsonify({"message": f"Not enough stock for {product.name}"}), 400
    
    new_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        order_status='pending',
        payment_status='pending',
        shipping_address=shipping_address,
        order_date=datetime.utcnow()
    )
    db.session.add(new_order)
    db.session.flush()
    
    for item in cart_items:
        product = Product.query.get(item.product_id)
        order_detail = OrderDetail(
            order_id=new_order.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=product.price
        )
        db.session.add(order_detail)
        product.stock_quantity -= item.quantity
        db.session.delete(item)
        
    try:
        db.session.commit()
        return jsonify({"message": "Checkout successful", "order_id": new_order.order_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred"}), 500

# 2. MỚI: Lấy danh sách đơn hàng của một Customer
def get_user_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).all()
    result = []
    for o in orders:
        result.append({
            "order_id": o.order_id,
            "total_amount": o.total_amount,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "order_date": o.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "shipping_address": o.shipping_address
        })
    return jsonify({"orders": result}), 200

# 3. MỚI: Lấy TOÀN BỘ đơn hàng (Dành cho Admin)
def get_all_orders():
    orders = Order.query.order_by(Order.order_date.desc()).all()
    result = []
    for o in orders:
        user = User.query.get(o.user_id)
        result.append({
            "order_id": o.order_id,
            "customer_name": user.username if user else "Unknown",
            "total_amount": o.total_amount,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "order_date": o.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "shipping_address": o.shipping_address
        })
    return jsonify({"orders": result}), 200

# 4. MỚI: Cập nhật trạng thái đơn hàng (Dành cho Admin)
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('order_status')
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404
        
    order.order_status = new_status
    if new_status == 'completed':
        order.payment_status = 'paid'
        
    db.session.commit()
    return jsonify({"message": f"Order #{order_id} updated to {new_status}"}), 200