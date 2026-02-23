from flask import Blueprint
from app.controllers.category_controller import get_all_categories, create_category
from app.utils.decorators import admin_required

category_bp = Blueprint('category_bp', __name__)

# API Public: Lấy danh sách danh mục
category_bp.route('/api/categories', methods=['GET'])(get_all_categories)

# API Private: Thêm danh mục mới (Cần Token của Admin)
category_bp.route('/api/categories', methods=['POST'])(admin_required()(create_category))