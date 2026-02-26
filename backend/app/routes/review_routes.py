from flask import Blueprint
from app.controllers.review_controller import (
    add_review, 
    get_fake_reviews, 
    delete_review, 
    get_user_reviews, 
    admin_get_all_reviews,
    get_product_reviews # MỚI: Import thêm hàm lấy review cho Product
)
from app.utils.decorators import admin_required
from flask_jwt_extended import jwt_required

review_bp = Blueprint('review_bp', __name__)

review_bp.route('/api/reviews', methods=['POST'])(jwt_required()(add_review))
review_bp.route('/api/reviews/fake', methods=['GET'])(admin_required()(get_fake_reviews))
review_bp.route('/api/reviews/<int:review_id>', methods=['DELETE'])(admin_required()(delete_review))

# === CÁC ROUTE MỚI ===
review_bp.route('/api/reviews/my-reviews', methods=['GET'])(jwt_required()(get_user_reviews))
review_bp.route('/api/reviews/admin/all', methods=['GET'])(admin_required()(admin_get_all_reviews))

# MỚI: API Công khai để lấy danh sách review của 1 sản phẩm cụ thể
review_bp.route('/api/reviews/product/<int:product_id>', methods=['GET'])(get_product_reviews)