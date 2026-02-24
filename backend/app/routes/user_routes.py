from flask import Blueprint
from app.controllers.user_controller import get_home, get_profile, update_profile, change_password
from flask_jwt_extended import jwt_required

user_bp = Blueprint('user_bp', __name__)

user_bp.route('/', methods=['GET'])(get_home)

# API Quản lý tài khoản (Yêu cầu phải đăng nhập)
user_bp.route('/api/user/profile', methods=['GET'])(jwt_required()(get_profile))
user_bp.route('/api/user/profile', methods=['PUT'])(jwt_required()(update_profile))
user_bp.route('/api/user/change-password', methods=['PUT'])(jwt_required()(change_password))