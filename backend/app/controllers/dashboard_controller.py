from flask import jsonify
from app.models.models import db, Order, User, Product, Review
from sqlalchemy import func
from datetime import datetime, timedelta

def get_dashboard_stats():
    try:
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(Order.order_status == 'completed').scalar() or 0
        total_orders = Order.query.count()
        total_customers = User.query.filter_by(role='Customer').count()
        
        active_customers = User.query.filter_by(role='Customer', account_status='activated').count()
        locked_customers = User.query.filter_by(role='Customer', account_status='locked').count()
        
        total_products = Product.query.count()

        low_stock_products = Product.query.filter(Product.stock_quantity < 10).limit(5).all()
        low_stock_list = [{"id": p.product_id, "name": p.name, "stock": p.stock_quantity} for p in low_stock_products]

        recent_pending_orders = Order.query.filter_by(order_status='pending').order_by(Order.order_date.desc()).limit(5).all()
        pending_orders_list = [{"id": o.order_id, "amount": o.total_amount, "date": o.order_date.strftime('%Y-%m-%d')} for o in recent_pending_orders]

        fake_reviews_count = Review.query.filter_by(is_fake=True).count()

        status_counts = db.session.query(Order.order_status, func.count(Order.order_id)).group_by(Order.order_status).all()
        order_status_data = [{"name": status.capitalize(), "value": count} for status, count in status_counts]

        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_completed_orders = Order.query.filter(Order.order_status == 'completed', Order.order_date >= seven_days_ago).all()
        
        revenue_dict = {}
        for i in range(6, -1, -1):
            day_str = (datetime.utcnow() - timedelta(days=i)).strftime('%m-%d')
            revenue_dict[day_str] = 0
        
        for order in recent_completed_orders:
            day_str = order.order_date.strftime('%m-%d')
            if day_str in revenue_dict:
                revenue_dict[day_str] += order.total_amount

        revenue_chart_data = [{"date": k, "revenue": v} for k, v in revenue_dict.items()]

        return jsonify({
            "kpi": {
                "revenue": total_revenue,
                "orders": total_orders,
                "customers": total_customers,
                "active_customers": active_customers, 
                "locked_customers": locked_customers, 
                "products": total_products
            },
            "alerts": {
                "low_stock": low_stock_list,
                "pending_orders": pending_orders_list,
                "fake_reviews": fake_reviews_count
            },
            "charts": {
                "order_status": order_status_data,
                "revenue": revenue_chart_data
            },
            "status": "success"
        }), 200

    except Exception as e:
        return jsonify({"message": str(e), "status": "error"}), 500