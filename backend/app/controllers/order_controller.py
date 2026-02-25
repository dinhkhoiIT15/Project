from flask import request, jsonify
from app.models.models import db, Cart, CartItem, Order, OrderDetail, Product, User
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
import math # Import math để tính toán phân trang

# --- HÀM HELPER NỘI BỘ (Dùng chung cho Admin và Customer) ---
def _restore_items_to_cart(order):
    """Hoàn lại stock vào kho và đưa sản phẩm ngược lại vào giỏ hàng của User."""
    user_id = order.user_id
    # 1. Lấy hoặc tạo mới giỏ hàng cho user
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.flush()

    # 2. Duyệt qua từng sản phẩm trong đơn hàng
    details = OrderDetail.query.filter_by(order_id=order.order_id).all()
    for d in details:
        # Trả lại số lượng vào kho (Inventory)
        product = Product.query.get(d.product_id)
        if product:
            product.stock_quantity += d.quantity
        
        # Tạo lại item trong giỏ hàng (Cart)
        new_cart_item = CartItem(
            cart_id=cart.cart_id,
            product_id=d.product_id,
            quantity=d.quantity
        )
        db.session.add(new_cart_item)
    return True

# --- CÁC HÀM API ---

def checkout():
    """Xử lý đặt hàng từ giỏ hàng hiện tại."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    shipping_address = data.get('shipping_address', '')
    payment_method = data.get('payment_method', 'COD')
    
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
        payment_method=payment_method,
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
        return jsonify({
            "message": "Checkout successful", 
            "order_id": new_order.order_id,
            "total_amount": new_order.total_amount
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred"}), 500

def confirm_payment(order_id):
    """Xác nhận thanh toán cho đơn hàng."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    transaction_id = data.get('transaction_id', 'MOCK-TXN-123')
    
    order = Order.query.filter_by(order_id=order_id, user_id=user_id).first()
    if not order:
        return jsonify({"message": "Order not found"}), 404
        
    order.payment_status = 'paid'
    order.order_status = 'processing'
    order.transaction_id = transaction_id
    
    try:
        db.session.commit()
        return jsonify({"message": "Payment confirmed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error confirming payment"}), 500

def cancel_order_and_restore_cart(order_id):
    """API cho Customer: Hủy đơn hàng rác ở bước thanh toán và đưa hàng về giỏ."""
    user_id = get_jwt_identity()
    order = Order.query.filter_by(order_id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    if order.payment_status == 'paid':
        return jsonify({"message": "Cannot cancel a paid order"}), 400

    try:
        _restore_items_to_cart(order)
        OrderDetail.query.filter_by(order_id=order_id).delete()
        db.session.delete(order)
        db.session.commit()
        return jsonify({"message": "Order removed and items restored to cart"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

def update_order_status(order_id):
    """API cho Admin: Cập nhật trạng thái và tự động hoàn hàng nếu status là 'cancelled'."""
    data = request.get_json()
    new_status = data.get('order_status')
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404

    if new_status == 'cancelled' and order.order_status != 'cancelled':
        _restore_items_to_cart(order)
        
    order.order_status = new_status
    if new_status == 'completed':
        order.payment_status = 'paid'
        
    db.session.commit()
    return jsonify({"message": f"Order #{order_id} updated to {new_status}"}), 200

def get_user_orders():
    """Lấy danh sách đơn hàng của khách hàng với tính năng phân trang."""
    user_id = get_jwt_identity()
    
    # 1. Lấy thông số phân trang từ Query Params
    try:
        page = int(request.args.get('page', 1))
        # THAY ĐỔI: Hiển thị 5 đơn hàng mỗi trang theo yêu cầu
        per_page = int(request.args.get('per_page', 5)) 
    except ValueError:
        page = 1
        per_page = 5

    # 2. Xây dựng Query cơ bản
    query = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc())
    
    # 3. Tính toán phân trang
    total_count = query.count()
    total_pages = math.ceil(total_count / per_page)
    
    # 4. Thực hiện truy vấn với Limit/Offset
    orders = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for o in orders:
        result.append({
            "order_id": o.order_id,
            "total_amount": o.total_amount,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "payment_method": o.payment_method,
            "order_date": o.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "shipping_address": o.shipping_address
        })
        
    return jsonify({
        "orders": result,
        "total_pages": total_pages,
        "current_page": page,
        "total_orders": total_count,
        "status": "success"
    }), 200

def get_all_orders():
    """Lấy danh sách tất cả đơn hàng cho Admin với tính năng phân trang."""
    # 1. Lấy thông số phân trang
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10)) # Admin mặc định xem 10 đơn/trang
    except ValueError:
        page = 1
        per_page = 10

    # 2. Xây dựng Query
    query = Order.query.order_by(Order.order_date.desc())
    
    # 3. Tính toán phân trang
    total_count = query.count()
    total_pages = math.ceil(total_count / per_page)
    
    # 4. Thực hiện truy vấn
    orders = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for o in orders:
        user = User.query.get(o.user_id)
        result.append({
            "order_id": o.order_id,
            "customer_name": user.username if user else "Unknown",
            "total_amount": o.total_amount,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "payment_method": o.payment_method,
            "order_date": o.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "shipping_address": o.shipping_address
        })
        
    return jsonify({
        "orders": result,
        "total_pages": total_pages,
        "current_page": page,
        "total_orders": total_count,
        "status": "success"
    }), 200