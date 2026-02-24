from flask import Blueprint
# Đảm bảo import đầy đủ các hàm từ controller
from app.controllers.order_controller import (
    checkout, 
    get_user_orders, 
    get_all_orders, 
    update_order_status, 
    confirm_payment,
    cancel_order_and_restore_cart
)
from flask_jwt_extended import jwt_required
from app.utils.decorators import admin_required

order_bp = Blueprint('order_bp', __name__)

# --- ROUTES CHO CUSTOMER ---
order_bp.route('/api/orders/checkout', methods=['POST'])(jwt_required()(checkout))
order_bp.route('/api/orders/my-orders', methods=['GET'])(jwt_required()(get_user_orders))

# Xác nhận thanh toán Online (Thành công)
order_bp.route('/api/orders/<int:order_id>/pay', methods=['PUT'])(jwt_required()(confirm_payment))

# Hủy đơn hàng và khôi phục giỏ hàng (Khi nhấn Cancel ở cổng thanh toán)
order_bp.route('/api/orders/<int:order_id>/cancel', methods=['DELETE'])(jwt_required()(cancel_order_and_restore_cart))

# --- ROUTES CHO ADMIN ---
order_bp.route('/api/orders/all', methods=['GET'])(admin_required()(get_all_orders))
order_bp.route('/api/orders/<int:order_id>/status', methods=['PUT'])(admin_required()(update_order_status))