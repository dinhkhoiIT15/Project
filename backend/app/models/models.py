from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Khởi tạo đối tượng database
db = SQLAlchemy()

# 1. Bảng User (Người dùng) 
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True) # [cite: 18]
    username = db.Column(db.String(100), unique=True, nullable=False) # [cite: 19]
    password = db.Column(db.String(255), nullable=False) # [cite: 20]
    phone_number = db.Column(db.String(15)) # [cite: 21]
    address = db.Column(db.Text) # [cite: 22]
    role = db.Column(db.String(20), default='Customer') # Admin or Customer [cite: 23]
    account_status = db.Column(db.String(20), default='activated') # locked or activated [cite: 24]

# 2. Bảng Category (Danh mục sản phẩm) 
class Category(db.Model):
    __tablename__ = 'categories'
    category_id = db.Column(db.Integer, primary_key=True) # [cite: 51]
    name = db.Column(db.String(255), nullable=False) # [cite: 52]
    description = db.Column(db.Text) # [cite: 53]

# 3. Bảng Product (Sản phẩm) 
class Product(db.Model):
    __tablename__ = 'products'
    product_id = db.Column(db.Integer, primary_key=True) # [cite: 43]
    name = db.Column(db.String(255), nullable=False) # [cite: 44]
    price = db.Column(db.Float, nullable=False) # [cite: 45]
    description = db.Column(db.Text) # Do AI sinh ra [cite: 46]
    stock_quantity = db.Column(db.Integer, default=0) # [cite: 47]
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id')) # [cite: 48]
    image_url = db.Column(db.Text) # [cite: 49]

# 4. Bảng Review (Nhận xét tích hợp AI) 
class Review(db.Model):
    __tablename__ = 'reviews'
    review_id = db.Column(db.Integer, primary_key=True) # [cite: 66]
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id')) # [cite: 67]
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id')) # [cite: 68]
    content = db.Column(db.Text, nullable=False) # [cite: 69]
    is_fake = db.Column(db.Boolean, default=False) # AI check real/fake [cite: 70]

# 5. Bảng Order (Đơn hàng) 
class Order(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.Integer, primary_key=True) # [cite: 26]
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id')) # [cite: 27]
    total_amount = db.Column(db.Float) # [cite: 28]
    order_status = db.Column(db.String(50), default='not complete') # complete or not [cite: 29]
    payment_status = db.Column(db.String(50), default='pending') # [cite: 30]
    order_date = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 31]
    shipping_address = db.Column(db.Text) # [cite: 32]

# 6. Bảng OrderDetail (Chi tiết đơn hàng) 
class OrderDetail(db.Model):
    __tablename__ = 'order_details'
    id = db.Column(db.Integer, primary_key=True) # [cite: 34]
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id')) # [cite: 35]
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id')) # [cite: 36]
    quantity = db.Column(db.Integer, nullable=False) # [cite: 37]
    price_at_purchase = db.Column(db.Float, nullable=False) # [cite: 38]

# 7. Bảng Payment (Thanh toán) 
class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True) # [cite: 40]
    payment_method = db.Column(db.String(100)) # [cite: 41]

# 8. Bảng Cart (Giỏ hàng) 
class Cart(db.Model):
    __tablename__ = 'carts'
    cart_id = db.Column(db.Integer, primary_key=True) # [cite: 55]
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id')) # [cite: 56]
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 57]
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # [cite: 58]

# 9. Bảng CartItem (Chi tiết giỏ hàng) 
class CartItem(db.Model):
    __tablename__ = 'cart_items'
    cart_item_id = db.Column(db.Integer, primary_key=True) # [cite: 60]
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.cart_id')) # [cite: 61]
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id')) # [cite: 62]
    quantity = db.Column(db.Integer, default=1) # [cite: 63]
    added_at = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 64]