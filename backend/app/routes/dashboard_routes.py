from flask import Blueprint
from app.controllers.dashboard_controller import get_dashboard_stats
from app.utils.decorators import admin_required

dashboard_bp = Blueprint('dashboard_bp', __name__)

# Chỉ Admin mới được xem thống kê
dashboard_bp.route('/api/dashboard/stats', methods=['GET'])(admin_required()(get_dashboard_stats))