from flask import Blueprint
from app.controllers.cart_controller import add_to_cart, get_cart
from flask_jwt_extended import jwt_required

cart_bp = Blueprint('cart_bp', __name__)

# Thêm sản phẩm vào giỏ (yêu cầu đăng nhập)
cart_bp.route('/api/cart', methods=['POST'])(jwt_required()(add_to_cart))

# Xem giỏ hàng (yêu cầu đăng nhập)
cart_bp.route('/api/cart', methods=['GET'])(jwt_required()(get_cart))