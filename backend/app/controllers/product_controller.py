from flask import request, jsonify
from app.models.models import db, Product, Category

def generate_ai_description(name, category_name):
    return f"Professional AI description for {name} ({category_name}): This high-quality product is designed for excellence and durability."

def get_all_products():
    search = request.args.get('search', '')
    category_id = request.args.get('category_id', '')
    
    query = Product.query
    
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))
        
    if category_id:
        try:
            query = query.filter_by(category_id=int(category_id))
        except ValueError:
            pass 
            
    products = query.all()
    result = []
    for p in products:
        result.append({
            "product_id": p.product_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "stock_quantity": p.stock_quantity,
            "category_id": p.category_id,
            "image_url": p.image_url
        })
    return jsonify({"products": result, "status": "success"}), 200

# MỚI: Hàm lấy chi tiết 1 sản phẩm
def get_product_by_id(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    category = Category.query.get(product.category_id)
    category_name = category.name if category else "Uncategorized"
        
    return jsonify({
        "product": {
            "product_id": product.product_id,
            "name": product.name,
            "price": product.price,
            "description": product.description,
            "stock_quantity": product.stock_quantity,
            "category_id": product.category_id,
            "category_name": category_name,
            "image_url": product.image_url
        },
        "status": "success"
    }), 200

def create_product():
    data = request.get_json()
    try:
        category = Category.query.get(int(data.get('category_id')))
        if not category:
            return jsonify({"message": "Category not found"}), 404
            
        ai_description = generate_ai_description(data.get('name'), category.name)
        
        new_product = Product(
            name=data.get('name'),
            price=float(data.get('price')),
            description=ai_description,
            stock_quantity=int(data.get('stock_quantity', 0)),
            category_id=int(data.get('category_id')),
            image_url=data.get('image_url', '')
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product created successfully", "product": {"id": new_product.product_id, "description": new_product.description}}), 201
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
            
        category = Category.query.get(product.category_id)
        if category:
            product.description = generate_ai_description(product.name, category.name)

        db.session.commit()
        return jsonify({"message": "Product updated successfully", "product": {"id": product.product_id, "description": product.description}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Update error: {str(e)}"}), 500

def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
        
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Delete error: {str(e)}"}), 500