from flask import Blueprint
from app.controllers.product_controller import get_all_products, get_product_by_id, create_product, update_product, delete_product
from app.utils.decorators import admin_required

product_bp = Blueprint('product_bp', __name__)

product_bp.route('/api/products', methods=['GET'])(get_all_products)
product_bp.route('/api/products', methods=['POST'])(admin_required()(create_product))

product_bp.route('/api/products/<int:product_id>', methods=['GET'])(get_product_by_id)

product_bp.route('/api/products/<int:product_id>', methods=['PUT'])(admin_required()(update_product))
product_bp.route('/api/products/<int:product_id>', methods=['DELETE'])(admin_required()(delete_product))