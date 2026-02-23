from flask import Blueprint
from app.controllers.product_controller import get_all_products, create_product, update_product, delete_product
from app.utils.decorators import admin_required

product_bp = Blueprint('product_bp', __name__)

# GET và POST trên cùng 1 route
product_bp.route('/api/products', methods=['GET'])(get_all_products)
product_bp.route('/api/products', methods=['POST'])(admin_required()(create_product))

# PUT và DELETE trên cùng 1 route có ID
product_bp.route('/api/products/<int:product_id>', methods=['PUT'])(admin_required()(update_product))
product_bp.route('/api/products/<int:product_id>', methods=['DELETE'])(admin_required()(delete_product))