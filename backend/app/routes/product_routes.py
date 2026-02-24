from flask import Blueprint
# Nhớ import thêm get_product_by_id
from app.controllers.product_controller import get_all_products, get_product_by_id, create_product, update_product, delete_product
from app.utils.decorators import admin_required

product_bp = Blueprint('product_bp', __name__)

# GET và POST trên cùng 1 route
product_bp.route('/api/products', methods=['GET'])(get_all_products)
product_bp.route('/api/products', methods=['POST'])(admin_required()(create_product))

# MỚI: Route lấy thông tin chi tiết 1 sản phẩm (Public)
product_bp.route('/api/products/<int:product_id>', methods=['GET'])(get_product_by_id)

# PUT và DELETE trên cùng 1 route có ID
product_bp.route('/api/products/<int:product_id>', methods=['PUT'])(admin_required()(update_product))
product_bp.route('/api/products/<int:product_id>', methods=['DELETE'])(admin_required()(delete_product))