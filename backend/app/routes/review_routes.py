from flask import Blueprint
from app.controllers.review_controller import add_review, get_fake_reviews, delete_review
from app.utils.decorators import admin_required
from flask_jwt_extended import jwt_required

review_bp = Blueprint('review_bp', __name__)

# Customer đăng review (Yêu cầu có Token đăng nhập thông thường)
review_bp.route('/api/reviews', methods=['POST'])(jwt_required()(add_review))

# Admin xem danh sách Fake Review trên Dashboard
review_bp.route('/api/reviews/fake', methods=['GET'])(admin_required()(get_fake_reviews))

# Admin quyết định xóa Review
review_bp.route('/api/reviews/<int:review_id>', methods=['DELETE'])(admin_required()(delete_review))