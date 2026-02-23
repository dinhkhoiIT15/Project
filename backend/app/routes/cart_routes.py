from flask import Blueprint
from app.controllers.cart_controller import add_to_cart, get_cart, update_cart_item, remove_from_cart
from flask_jwt_extended import jwt_required

cart_bp = Blueprint('cart_bp', __name__)

cart_bp.route('/api/cart', methods=['POST'])(jwt_required()(add_to_cart))
cart_bp.route('/api/cart', methods=['GET'])(jwt_required()(get_cart))
cart_bp.route('/api/cart/<int:item_id>', methods=['PUT'])(jwt_required()(update_cart_item))
cart_bp.route('/api/cart/<int:item_id>', methods=['DELETE'])(jwt_required()(remove_from_cart))