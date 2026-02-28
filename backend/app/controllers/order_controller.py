from flask import request, jsonify
# MỚI: Thêm Notification vào danh sách import
from app.models.models import db, Cart, CartItem, Order, OrderDetail, Product, User, Notification
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
import math
from app.extensions import socketio # MỚI IMPORT VÀO ĐÂY

# --- HÀM HELPER NỘI BỘ ---
def _restore_items_to_cart(order):
    """Hoàn lại tồn kho và đưa hàng về giỏ khi đơn bị hủy."""
    user_id = order.user_id
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.flush()

    details = OrderDetail.query.filter_by(order_id=order.order_id).all()
    for d in details:
        product = Product.query.get(d.product_id)
        if product:
            product.stock_quantity += d.quantity
        
        new_cart_item = CartItem(
            cart_id=cart.cart_id,
            product_id=d.product_id,
            quantity=d.quantity
        )
        db.session.add(new_cart_item)
    return True

# --- CÁC HÀM API ---

def checkout():
    """Đặt hàng với phương thức COD."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    shipping_address = data.get('shipping_address', '')
    
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart or not CartItem.query.filter_by(cart_id=cart.cart_id).first():
        return jsonify({"message": "Cart is empty"}), 400
        
    cart_items = CartItem.query.filter_by(cart_id=cart.cart_id).all()
    total_amount = 0
    for item in cart_items:
        product = Product.query.get(item.product_id)
        if product:
            if product.stock_quantity < item.quantity:
                return jsonify({"message": f"Not enough stock for {product.name}"}), 400
            total_amount += product.price * item.quantity
    
    new_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        order_status='pending',
        payment_status='pending',
        payment_method='COD', # Mặc định COD
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
        
        # MỚI: Phát tín hiệu có đơn hàng mới cho toàn bộ hệ thống (để Admin nhận)
        socketio.emit('new_order_placed', {
            'message': 'A new order has been placed'
        })
        
        return jsonify({"message": "Order placed successfully", "order_id": new_order.order_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Server error"}), 500

def update_order_status(order_id):
    """Admin cập nhật trạng thái đơn hàng."""
    data = request.get_json()
    new_status = data.get('order_status')
    order = Order.query.get(order_id)
    if not order: return jsonify({"message": "Order not found"}), 404

    if new_status == 'cancelled' and order.order_status != 'cancelled':
        _restore_items_to_cart(order)
    order.order_status = new_status
    if new_status == 'completed': order.payment_status = 'paid'
    
    # MỚI: Tạo thông báo cho khách hàng
    notif = Notification(
        user_id=order.user_id,
        order_id=order.order_id,
        message=f"Order #{order.order_id} status has been updated to '{new_status.upper()}'."
    )
    db.session.add(notif)
    db.session.commit()
    
    # Phát sóng (Broadcast) sự kiện thay đổi trạng thái tới toàn bộ client
    socketio.emit('order_status_changed', {
        'order_id': order.order_id,
        'new_status': order.order_status,
        'payment_status': order.payment_status
    })
    
    # MỚI: Bắn WebSocket ĐÍCH DANH cho khách hàng để chuông reo lên
    socketio.emit('new_notification', {
        "id": notif.id,
        "order_id": notif.order_id,
        "message": notif.message,
        "is_read": False,
        "date": "Just now"
    }, to=f'user_{order.user_id}')
    
    # MỚI: Nếu đơn hàng bị HỦY (hàng được trả về giỏ), báo cho máy Khách hàng tự động tải lại giỏ hàng
    if new_status == 'cancelled':
        socketio.emit('cart_updated', to=f'user_{order.user_id}')
    
    return jsonify({"message": "Status updated"}), 200

def get_user_orders():
    # """Lấy đơn hàng của khách hàng (phân trang 5 đơn/trang) kèm thông tin sản phẩm."""
    user_id = get_jwt_identity()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 5))

    query = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc())
    total_count = query.count()
    orders = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for o in orders:
        # CẬP NHẬT: Truy vấn danh sách sản phẩm cho mỗi đơn hàng để Frontend hiển thị nút Review
        details = OrderDetail.query.filter_by(order_id=o.order_id).all()
        items = []
        for d in details:
            product = Product.query.get(d.product_id)
            items.append({
                "product_id": d.product_id,
                "product_name": product.name if product else "Unknown Product",
                "image_url": product.image_url if product else "",
                "quantity": d.quantity,
                "price": d.price_at_purchase
            })

        result.append({
            "order_id": o.order_id,
            "total_amount": o.total_amount,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "order_date": o.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "shipping_address": o.shipping_address,
            "items": items # Trả về danh sách sản phẩm chi tiết
        })
    return jsonify({"orders": result, "total_pages": math.ceil(total_count/per_page)}), 200

def get_all_orders():
    """Lấy tất cả đơn hàng cho Admin (Phân trang 10 items/trang)"""
    page = request.args.get('page', 1, type=int)
    
    # Chuẩn hóa bằng .paginate() thay vì offset/limit
    pagination = Order.query.order_by(Order.order_date.desc()).paginate(page=page, per_page=10, error_out=False)
    orders = pagination.items
    
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
    return jsonify({
        "orders": result, 
        "total_pages": pagination.pages,
        "current_page": pagination.page
    }), 200

# CODE MỚI: Thêm hàm get_order_by_id
def get_order_by_id(order_id):
    """Lấy chi tiết 1 đơn hàng theo ID (Dùng chung cho Customer và Admin)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
        
    # SỬA LỖI Ở ĐÂY: Ép cả 2 biến về String trước khi so sánh để tránh lỗi khác kiểu dữ liệu
    if str(order.user_id) != str(user_id) and user.role != 'Admin':
        return jsonify({"message": "Permission denied"}), 403
        
    details = OrderDetail.query.filter_by(order_id=order.order_id).all()
    items = []
    for d in details:
        product = Product.query.get(d.product_id)
        items.append({
            "product_id": d.product_id,
            "product_name": product.name if product else "Unknown Product",
            "image_url": product.image_url if product else "",
            "quantity": d.quantity,
            "price": d.price_at_purchase
        })

    result = {
        "order_id": order.order_id,
        "total_amount": order.total_amount,
        "order_status": order.order_status,
        "payment_status": order.payment_status,
        "payment_method": getattr(order, 'payment_method', 'COD'),
        "order_date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
        "shipping_address": order.shipping_address,
        "items": items
    }
    return jsonify({"order": result, "status": "success"}), 200

# ================= MỚI: API THÔNG BÁO =================
def get_my_notifications():
    """Lấy danh sách thông báo của user đang đăng nhập"""
    user_id = get_jwt_identity()
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(20).all()
    result = []
    for n in notifs:
        result.append({
            "id": n.id,
            "order_id": n.order_id,
            "message": n.message,
            "is_read": n.is_read,
            "date": n.created_at.strftime('%b %d, %Y %H:%M')
        })
    # Trả về kèm user_id để Frontend dùng kết nối private Room
    return jsonify({"notifications": result, "user_id": user_id, "status": "success"}), 200

def mark_notification_read(notif_id):
    """Đánh dấu 1 thông báo là đã đọc"""
    notif = Notification.query.get(notif_id)
    if notif:
        notif.is_read = True
        db.session.commit()
    return jsonify({"status": "success"}), 200

def clear_all_notifications():
    """Xóa toàn bộ thông báo của user"""
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({"status": "success"}), 200