from flask_socketio import SocketIO

socketio = SocketIO(
    cors_allowed_origins="*",
    ping_timeout=60,         
    ping_interval=25,        
    logger=False,            
    engineio_logger=False    
)