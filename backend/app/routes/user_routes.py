from flask import Blueprint
from app.controllers.user_controller import (
    get_home, get_profile, update_profile, change_password,
    admin_get_all_users, admin_toggle_user_status,
    admin_update_user_info 
)
from flask_jwt_extended import jwt_required
from app.utils.decorators import admin_required # MỚI IMPORT

user_bp = Blueprint('user_bp', __name__)

user_bp.route('/', methods=['GET'])(get_home)

# API Quản lý tài khoản (Yêu cầu phải đăng nhập)
user_bp.route('/api/user/profile', methods=['GET'])(jwt_required()(get_profile))
user_bp.route('/api/user/profile', methods=['PUT'])(jwt_required()(update_profile))
user_bp.route('/api/user/change-password', methods=['PUT'])(jwt_required()(change_password))

# ================= MỚI: API QUẢN LÝ USER CHO ADMIN =================
user_bp.route('/api/admin/users', methods=['GET'])(admin_required()(admin_get_all_users))
user_bp.route('/api/admin/users/<int:user_id>/status', methods=['PUT'])(admin_required()(admin_toggle_user_status))
user_bp.route('/api/admin/users/<int:user_id>/info', methods=['PUT'])(admin_required()(admin_update_user_info))