from flask import Blueprint
from app.controllers.category_controller import (
    get_all_categories, 
    create_category, 
    update_category, 
    delete_category  
)
from app.utils.decorators import admin_required

category_bp = Blueprint('category_bp', __name__)

category_bp.route('/api/categories', methods=['GET'])(get_all_categories)

category_bp.route('/api/categories', methods=['POST'])(admin_required()(create_category))
category_bp.route('/api/categories/<int:category_id>', methods=['PUT'])(admin_required()(update_category))
category_bp.route('/api/categories/<int:category_id>', methods=['DELETE'])(admin_required()(delete_category))