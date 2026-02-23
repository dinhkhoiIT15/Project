from flask import Flask
from flask_cors import CORS # MỚI THÊM 1: Nạp thư viện CORS
from config import Config
from app.models.models import db, User
from app.routes.user_routes import user_bp 
from app.routes.category_routes import category_bp
from app.routes.product_routes import product_bp
from app.routes.review_routes import review_bp
from app.routes.cart_routes import cart_bp 
from app.routes.order_routes import order_bp

from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash

def create_app():
    app = Flask(__name__)
    
    CORS(app) # MỚI THÊM 2: Bật CORS, cho phép Front-end (cổng 3000) gọi API
    
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY'] = 'my-secret-ecommerce-ai-key-2024'
    db.init_app(app)

    jwt = JWTManager(app)
    
    # Đăng ký các đường dẫn (Routes) vào ứng dụng
    app.register_blueprint(user_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(cart_bp) 
    app.register_blueprint(order_bp)
    
    with app.app_context():
        # Tạo tất cả các bảng nếu chưa có
        db.create_all()
        
        # Tự động khởi tạo tài khoản Admin
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            hashed_password = generate_password_hash('admin123')
            new_admin = User(
                username='admin',
                password=hashed_password,
                role='Admin',
                account_status='activated'
            )
            db.session.add(new_admin)
            db.session.commit()
            print("Default admin account created successfully: admin / admin123")
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)