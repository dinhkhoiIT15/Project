from flask_socketio import SocketIO

# Khởi tạo SocketIO cho phép mọi nguồn (CORS) kết nối tới
socketio = SocketIO(cors_allowed_origins="*")