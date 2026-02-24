from flask import Blueprint
from app.controllers.auth_controller import register, login

# Tạo Blueprint cho phần Authentication
auth_bp = Blueprint('auth_bp', __name__)

# Route cho khách hàng đăng ký tài khoản mới
auth_bp.route('/api/register', methods=['POST'])(register)

# Route cho người dùng (Customer/Admin) đăng nhập
auth_bp.route('/api/login', methods=['POST'])(login)