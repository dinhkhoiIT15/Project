from flask_socketio import SocketIO

# Khởi tạo SocketIO cho phép mọi nguồn (CORS) kết nối tới
# MỚI: Bổ sung cấu hình tắt log rác và xử lý rớt mạng mượt hơn
socketio = SocketIO(
    cors_allowed_origins="*",
    ping_timeout=60,         # Tăng thời gian chờ trước khi ngắt kết nối
    ping_interval=25,        # Khoảng thời gian ping kiểm tra
    logger=False,            # Tắt log cảnh báo rác của SocketIO
    engineio_logger=False    # Tắt log rác của EngineIO cấp thấp
)