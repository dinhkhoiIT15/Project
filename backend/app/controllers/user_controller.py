from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models.models import db, User

def get_home():
    return jsonify({
        "status": "success",
        "message": "Welcome to E-commerce AI Platform API!" # Đã chuyển sang tiếng Anh
    }), 200

def register():
    # Lấy dữ liệu JSON từ request (do Front-end gửi lên)
    data = request.get_json()
    
    # 1. Kiểm tra đầu vào
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Missing username or password"}), 400
        
    username = data.get('username')
    password = data.get('password')
    phone_number = data.get('phone_number', '')
    address = data.get('address', '')
    
    # 2. Kiểm tra xem username đã tồn tại trong database chưa
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409
        
    # 3. Mã hóa mật khẩu
    hashed_password = generate_password_hash(password)
    
    # 4. Tạo User mới. Ép cứng role là 'Customer' và trạng thái là 'activated'
    new_user = User(
        username=username,
        password=hashed_password,
        phone_number=phone_number,
        address=address,
        role='Customer',
        account_status='activated'
    )
    
    # 5. Lưu vào Database
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback() # Hoàn tác nếu có lỗi cơ sở dữ liệu
        return jsonify({"message": "An error occurred while registering user"}), 500


def login():
    data = request.get_json()
    
    # 1. Kiểm tra đầu vào
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Missing username or password"}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    # 2. Tìm User trong database
    user = User.query.filter_by(username=username).first()
    
    # 3. Kiểm tra User có tồn tại và mật khẩu có khớp không
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid username or password"}), 401
        
    # 4. Kiểm tra tài khoản có bị khóa không
    if user.account_status != 'activated':
        return jsonify({"message": "Account is locked. Please contact Admin."}), 403
        
    # 5. Tạo Access Token với identity là user_id
    access_token = create_access_token(identity=str(user.user_id))
    
    # 6. Trả về Token và thông tin user cho Front-end
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.user_id,
            "username": user.username,
            "role": user.role
        }
    }), 200