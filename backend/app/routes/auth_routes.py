from flask import Blueprint
from app.controllers.auth_controller import register, login, logout
from flask_jwt_extended import jwt_required

auth_bp = Blueprint('auth_bp', __name__)

auth_bp.route('/api/register', methods=['POST'])(register)

auth_bp.route('/api/login', methods=['POST'])(login)

auth_bp.route('/api/logout', methods=['POST'])(jwt_required()(logout))