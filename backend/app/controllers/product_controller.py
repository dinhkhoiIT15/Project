from flask import request, jsonify
from app.models.models import db, Product, Category, CartItem, OrderDetail, Review
import math
from app.extensions import socketio 
import os
import requests
from dotenv import load_dotenv

import re # Đảm bảo có import re ở đầu file

def generate_description_api():
    """API endpoint to generate product description via Hugging Face"""
    data = request.get_json()
    name = data.get('name')
    category_name = data.get('category_name')
    keywords = data.get('keywords', '')

    if not name or not category_name:
        return jsonify({"message": "Product name and category are required"}), 400

    load_dotenv()
    HF_TOKEN = os.getenv("HF_TOKEN")
    
    API_URL = "https://router.huggingface.co/v1/chat/completions" 
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    # PROMPT SIÊU NGẮN VÀ CẤM NHẮC ĐẾN CODE
    prompt = f"""You are a professional copywriter.
Write a short, simple, plain text product description for:
- Product: {name}
- Category: {category_name}
- Features: {keywords}

Strict rule: Write maximum 3 short sentences. Only return normal words, no special formatting characters."""

    payload = {
        "model": "Qwen/Qwen2.5-7B-Instruct", # Dùng bản 7B cho tốc độ phản hồi cực nhanh
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            generated_text = result['choices'][0]['message']['content'].strip()
            
            # BỘ LỌC THÉP: Xóa sạch mọi thẻ ngoặc nhọn <...> nếu AI lỡ sinh ra
            clean_text = re.sub(r'<[^>]+>', '', generated_text)
            clean_text = clean_text.replace("```html", "").replace("```", "").strip()

            return jsonify({"description": clean_text, "status": "success"}), 200
        else:
            return jsonify({"message": "Hugging Face API is busy."}), 503
    except Exception as e:
        return jsonify({"message": f"AI Generation error: {str(e)}"}), 500

def get_all_products():
    search = request.args.get('search', '')
    category_id = request.args.get('category_id', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 8, type=int)
    
    query = db.session.query(Product, Category.name.label('category_name')).outerjoin(
        Category, Product.category_id == Category.category_id
    )
    
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))
        
    if category_id and str(category_id).strip() != '' and str(category_id).lower() != 'null':
        try:
            cat_id_int = int(category_id)
            if cat_id_int > 0:
                query = query.filter(Product.category_id == cat_id_int)
        except (ValueError, TypeError):
            pass
    
    total_count = query.count()
    total_pages = math.ceil(total_count / per_page)
    products = query.order_by(Product.product_id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for p, category_name in products:
        result.append({
            "product_id": p.product_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "stock_quantity": p.stock_quantity,
            "category_id": p.category_id,
            "category_name": category_name or "General",
            "image_url": p.image_url
        })
    
    return jsonify({
        "products": result, 
        "total_pages": total_pages,
        "current_page": page,
        "total_products": total_count,
        "status": "success"
    }), 200

def get_product_by_id(product_id):
    data = db.session.query(Product, Category.name.label('category_name')).outerjoin(
        Category, Product.category_id == Category.category_id
    ).filter(Product.product_id == product_id).first()

    if not data:
        return jsonify({"message": "Product not found"}), 404
        
    p, cat_name = data

    reviews = Review.query.filter_by(product_id=product_id, is_fake=False).all()
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0

    return jsonify({
        "product": {
            "product_id": p.product_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "stock_quantity": p.stock_quantity,
            "category_id": p.category_id,
            "category_name": cat_name or "Uncategorized",
            "image_url": p.image_url,
            "avg_rating": round(avg_rating, 1),
            "review_count": len(reviews)
        },
        "status": "success"
    }), 200

def create_product():
    data = request.get_json()
    try:
        category = Category.query.get(int(data.get('category_id')))
        if not category:
            return jsonify({"message": "Category not found"}), 404
            
        description = data.get('description', '')
        
        new_product = Product(
            name=data.get('name'),
            price=float(data.get('price')),
            description=description,
            stock_quantity=int(data.get('stock_quantity', 0)),
            category_id=int(data.get('category_id')),
            image_url=data.get('image_url', '')
        )
        db.session.add(new_product)
        db.session.commit()
        socketio.emit('product_list_updated') 
        return jsonify({
            "message": "Product created successfully", 
            "product": {"id": new_product.product_id}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Create error: {str(e)}"}), 500

def update_product(product_id):
    data = request.get_json()
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    try:
        if 'name' in data: product.name = data['name']
        if 'price' in data: product.price = float(data['price'])
        if 'stock_quantity' in data: product.stock_quantity = int(data['stock_quantity'])
        if 'image_url' in data: product.image_url = data['image_url']
        if 'category_id' in data: product.category_id = int(data['category_id'])
        if 'description' in data: product.description = data['description']

        db.session.commit()
        socketio.emit('product_list_updated')
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Update error: {str(e)}"}), 500

def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    try:
        OrderDetail.query.filter_by(product_id=product_id).delete()
        CartItem.query.filter_by(product_id=product_id).delete()
        Review.query.filter_by(product_id=product_id).delete()

        db.session.delete(product)
        
        db.session.commit()
        socketio.emit('product_list_updated') 
        
        return jsonify({
            "message": "Product and all related history deleted successfully",
            "status": "success"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Delete error: {str(e)}",
            "status": "error"
        }), 500