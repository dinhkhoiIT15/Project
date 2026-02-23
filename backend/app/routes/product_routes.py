from flask import Blueprint
from app.controllers.product_controller import get_all_products, create_product
from app.utils.decorators import admin_required

product_bp = Blueprint('product_bp', __name__)

# Khách hàng có thể xem danh sách sản phẩm
product_bp.route('/api/products', methods=['GET'])(get_all_products)

# Chỉ Admin mới có quyền thêm sản phẩm (Có gắn bảo vệ)
product_bp.route('/api/products', methods=['POST'])(admin_required()(create_product))