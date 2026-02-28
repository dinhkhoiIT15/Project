import eventlet
eventlet.monkey_patch()
from flask import Flask
from flask_cors import CORS 
from config import Config
from app.models.models import db, User
from app.routes.auth_routes import auth_bp 
from app.routes.user_routes import user_bp 
from app.routes.category_routes import category_bp
from app.routes.product_routes import product_bp
from app.routes.review_routes import review_bp
from app.routes.cart_routes import cart_bp 
from app.routes.order_routes import order_bp
from app.routes.dashboard_routes import dashboard_bp 
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from flask_socketio import join_room, leave_room
from app.extensions import socketio

def create_app():
    app = Flask(__name__)
    
    CORS(app) 
    
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY'] = 'my-secret-ecommerce-ai-key-2024'
    db.init_app(app)

    jwt = JWTManager(app)
    socketio.init_app(app) 
    
    @socketio.on('join')
    def on_join(data):
        room = data['room'] 
        join_room(room)

    @socketio.on('leave')
    def on_leave(data):
        room = data['room']
        leave_room(room)

    @socketio.on('join_personal')
    def on_join_personal(data):
        user_id = data.get('user_id')
        if user_id:
            join_room(f"user_{user_id}")
    
    app.register_blueprint(auth_bp) 
    app.register_blueprint(user_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(cart_bp) 
    app.register_blueprint(order_bp)
    app.register_blueprint(dashboard_bp) 
    
    with app.app_context():
        db.create_all()
        
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
    socketio.run(app, debug=True, port=5000)