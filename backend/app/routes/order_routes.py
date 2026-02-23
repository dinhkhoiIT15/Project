from flask import Blueprint
from app.controllers.order_controller import checkout
from flask_jwt_extended import jwt_required

order_bp = Blueprint('order_bp', __name__)

# Khách hàng thực hiện chốt đơn (Yêu cầu đăng nhập)
order_bp.route('/api/orders/checkout', methods=['POST'])(jwt_required()(checkout))