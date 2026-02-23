from flask import Blueprint
from app.controllers.user_controller import get_home, register, login

user_bp = Blueprint('user_bp', __name__)

user_bp.route('/', methods=['GET'])(get_home)

# MỚI THÊM: Định nghĩa các đường dẫn API
user_bp.route('/api/register', methods=['POST'])(register)
user_bp.route('/api/login', methods=['POST'])(login)