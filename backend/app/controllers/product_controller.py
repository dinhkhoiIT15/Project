from flask import request, jsonify
from app.models.models import db, Product, Category, CartItem, OrderDetail, Review
import math
from app.extensions import socketio 
import os
import requests
import string
import random
from dotenv import load_dotenv
import re 

def generate_description_api():
    """API endpoint to generate product description via Hugging Face"""
    data = request.get_json()
    name = data.get('name')
    category_name = data.get('category_name')
    keywords = data.get('keywords', '')
    specifications = data.get('specifications', {})

    if not name or not category_name:
        return jsonify({"message": "Product name and category are required"}), 400

    specs_str = ""
    if isinstance(specifications, dict) and specifications:
        specs_list = [f"{k}: {v}" for k, v in specifications.items() if str(v).strip()]
        if specs_list:
            specs_str = ", ".join(specs_list)

    load_dotenv()
    HF_TOKEN = os.getenv("HF_TOKEN")
    
    API_URL = "https://router.huggingface.co/v1/chat/completions" 
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    prompt = f"""You are an expert E-commerce SEO copywriter.
Write a highly engaging, natural, and professional plain text product description in Vietnamese for:
- Product Name: {name}
- Category: {category_name}
- Highlighted Features: {keywords}
- Key Specifications: {specs_str}

Requirements:
1. Language: MUST be in English.
2. Length: Maximum 4 sentences (under 200 words). Make it concise but impactful.
3. Content & Style: Seamlessly weave the specifications and features into a natural, persuasive narrative. Do NOT just list them mechanically. Use a dynamic and attractive tone suitable for tech products to boost SEO.
4. Format: Return ONLY pure plain text. Absolutely NO HTML tags, NO markdown (like ** or *), NO bullet points, and NO conversational filler."""

    payload = {
        "model": "Qwen/Qwen2.5-7B-Instruct", 
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 250,  
        "temperature": 0.8 
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            generated_text = result['choices'][0]['message']['content'].strip()
            
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
    brand = request.args.get('brand', '')  
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 8, type=int)
    
    query = db.session.query(Product, Category.name.label('category_name')).outerjoin(
        Category, Product.category_id == Category.category_id
    ).filter(
        Product.is_active == True
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
    
    if brand and brand.strip():
        query = query.filter(Product.brand.ilike(brand))
        print(f"[DEBUG] Filtering by brand: '{brand}'")
    
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
            "image_url": p.image_url,
            "sku": p.sku,
            "brand": p.brand,
            "discount_price": p.discount_price,
            "is_active": p.is_active,
            "specifications": p.specifications
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
    ).filter(
        Product.product_id == product_id,
        Product.is_active == True  
    ).first()

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
            "review_count": len(reviews),
            "sku": p.sku,
            "brand": p.brand,
            "discount_price": p.discount_price,
            "is_active": p.is_active,
            "specifications": p.specifications
        },
        "status": "success"
    }), 200

def get_similar_products(product_id):
    """Get up to 4 products from the SAME category only, excluding current product"""
    try:
        current_product = Product.query.get(product_id)
        if not current_product:
            return jsonify({"message": "Product not found"}), 404
        
        category = Category.query.get(current_product.category_id)
        category_name = category.name if category else "Unknown"
        
        similar_products = db.session.query(Product, Category.name.label('category_name')).outerjoin(
            Category, Product.category_id == Category.category_id
        ).filter(
            Product.category_id == current_product.category_id,
            Product.product_id != product_id,
            Product.is_active == True
        ).order_by(
            Product.stock_quantity > 0, 
            Product.product_id.desc()  
        ).limit(4).all()
        
        result = []
        for p, cat_name in similar_products:
            result.append({
                "product_id": p.product_id,
                "name": p.name,
                "price": p.price,
                "description": p.description,
                "stock_quantity": p.stock_quantity,
                "category_id": p.category_id,
                "category_name": cat_name or "General",
                "image_url": p.image_url,
                "sku": p.sku,
                "brand": p.brand,
                "discount_price": p.discount_price,
                "is_active": p.is_active,
                "specifications": p.specifications
            })
        
        return jsonify({
            "products": result,
            "count": len(result),
            "category": category_name,  
            "status": "success"
        }), 200
        
    except Exception as e:
        print(f"Error in get_similar_products: {str(e)}")  
        return jsonify({"message": f"Error fetching similar products: {str(e)}"}), 500

def create_product():
    data = request.get_json()
    try:
        category = Category.query.get(int(data.get('category_id')))
        if not category:
            return jsonify({"message": "Category not found"}), 404
            
        description = data.get('description', '')
        sku = data.get('sku', '')[:6].upper()

        while Product.query.filter_by(sku=sku).first():
            random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=3))
            sku = sku[:3] + random_suffix
        
        new_product = Product(
            name=data.get('name'),
            price=float(data.get('price')),
            description=description,
            stock_quantity=int(data.get('stock_quantity', 0)),
            category_id=int(data.get('category_id')),
            image_url=data.get('image_url', ''),
            sku=sku, 
            brand=data.get('brand', ''),
            specifications=data.get('specifications', {}),
            discount_price=float(data.get('discount_price')) if data.get('discount_price') else None,
            is_active=data.get('is_active', True)
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
        if 'sku' in data: product.sku = data['sku']
        if 'brand' in data: product.brand = data['brand']
        if 'specifications' in data: product.specifications = data['specifications']
        if 'discount_price' in data: 
            product.discount_price = float(data['discount_price']) if data['discount_price'] else None
        if 'is_active' in data: product.is_active = data['is_active']

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