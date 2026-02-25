from flask import Blueprint
from app.controllers.order_controller import (
    checkout, 
    get_user_orders, 
    get_all_orders, 
    update_order_status
)
from flask_jwt_extended import jwt_required
from app.utils.decorators import admin_required

order_bp = Blueprint('order_bp', __name__)

# --- ROUTES CHO CUSTOMER ---
order_bp.route('/api/orders/checkout', methods=['POST'])(jwt_required()(checkout))
order_bp.route('/api/orders/my-orders', methods=['GET'])(jwt_required()(get_user_orders))

# --- ROUTES CHO ADMIN ---
order_bp.route('/api/orders/all', methods=['GET'])(admin_required()(get_all_orders))
order_bp.route('/api/orders/<int:order_id>/status', methods=['PUT'])(admin_required()(update_order_status))