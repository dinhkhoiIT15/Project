import os
from dotenv import load_dotenv

# Lấy đường dẫn thư mục hiện tại
basedir = os.path.abspath(os.path.dirname(__file__))

load_dotenv()

class Config:
    # MỚI: Sử dụng SQLite và tự động tạo file app.db trong thư mục backend
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'app.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key_123')