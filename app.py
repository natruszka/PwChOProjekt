from flask import Flask, jsonify, render_template, request
from neo4j import GraphDatabase
import os


uri = os.getenv("NEO4J_URI")
username = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")


driver = GraphDatabase.driver(uri, auth=(username, password))

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/categories', methods = ['GET'])
def categories_get():
    query = "MATCH (c:Category) RETURN c.name AS name"
    with driver.session() as session:
        results = session.run(query)
        categories = [{"name": record["name"]} for record in results]
    return jsonify(categories)


@app.route('/categories', methods = ['POST'])
def categories_post():
    data = request.get_json()
    query = """
        CREATE (c:Category {name: $name})
        RETURN c.name AS name
    """
    parameters = {"name": data["name"]}
    with driver.session() as session:
        result = session.run(query, parameters)
        cat_name = result.single()["name"]
    return jsonify({"name": cat_name}), 201


@app.route('/products', methods = ['GET'])
def products_get():
    query = "MATCH (p:Product)-[:BELONGS_TO]->(c:Category) RETURN p.id AS id, p.name AS name, p.price AS price, c.name AS category"
    with driver.session() as session:
        results = session.run(query)
        products = [{"id": record["id"], "name": record["name"],"price": record["price"], "category": record["category"]} for record in results]
    return jsonify(products)


@app.route('/products', methods=['POST'])
def products_post():
    data = request.get_json()
    query = """
        MATCH (c:Category {name: $category})
        CREATE (p:Product {id: randomUUID(), name: $name, price: $price})-[:BELONGS_TO]->(c)
        RETURN p.id AS id
    """
    parameters = {"name": data["name"], "price": data["price"], "category": data["category"]}
    with driver.session() as session:
        result = session.run(query, parameters)
        product_id = result.single()["id"]
    return jsonify({"id": product_id}), 201


@app.route('/products/popular', methods=['GET'])
def products_popular_get():
    query = """
        MATCH (p:Product)<-[:BOUGHT]-(:User)
        RETURN p.name AS name, COUNT(*) AS popularity
        ORDER BY popularity DESC
        LIMIT 10
    """
    with driver.session() as session:
        results = session.run(query)
        products = [{"name": record["name"], "popularity": record["popularity"]} for record in results]
    return jsonify(products)


@app.route('/users', methods = ['GET'])
def users_get():
    query = "MATCH (u:User) RETURN u.id AS id, u.name AS name, u.surname AS surname, u.born AS born"
    with driver.session() as session:
        results = session.run(query)
        users = [{"id": record["id"], "name": record["name"], "surname": record["surname"], "born": record["born"]} for record in results]
    return jsonify(users)


@app.route('/users', methods=['POST'])
def users_post():
    data = request.get_json()
    query = """
        CREATE (u:User {id: randomUUID(), name: $name, surname: $surname, born: $born})
        RETURN u.id AS id
    """
    parameters = {"name": data["name"], "surname": data["surname"], "born": data["born"]}
    with driver.session() as session:
        result = session.run(query, parameters)
        user_id = result.single()["id"]
    return jsonify({"id": user_id}), 201


@app.route('/users/<user_id>/products', methods=['GET'])
def user_products_get(user_id):
    query = """
        MATCH (u:User {id: $user_id})-[:BOUGHT]->(p:Product)
        RETURN p.id AS id, p.name AS name, p.price AS price
    """
    parameters = {"user_id": user_id}
    with driver.session() as session:
        results = session.run(query, parameters)
        products = [{"id": record["id"], "name": record["name"], "price": record["price"]} for record in results]
    return jsonify(products)


@app.route('/products/<product_id>/reviews', methods=['POST'])
def reviews_post(product_id):
    data = request.get_json()
    query = """
        MATCH (p:Product {id: $product_id}), (u:User {id: $user_id})
        CREATE (u)-[:REVIEWED {rating: $rating, comment: $comment}]->(p)
        RETURN p.id AS product_id, u.id AS user_id
    """
    parameters = {
        "product_id": product_id,
        "user_id": data["user_id"],
        "rating": data["rating"],
        "comment": data["comment"]
    }
    with driver.session() as session:
        session.run(query, parameters)
    return jsonify({"message": "Review added successfully"}), 201


@app.route('/products/<product_id>/reviews', methods=['GET'])
def reviews_get(product_id):
    query = """
        MATCH (u:User)-[r:REVIEWED]->(p:Product {id: $product_id})
        RETURN u.name AS user, r.rating AS rating, r.comment AS comment
    """
    parameters = {"product_id": product_id}
    with driver.session() as session:
        results = session.run(query, parameters)
        reviews = [{"user": record["user"], "rating": record["rating"], "comment": record["comment"]} for record in results]
    return jsonify(reviews)


@app.route('/users/<user_id>/recommendations', methods=['GET'])
def user_recommendations_get(user_id):
    query = """
        MATCH (u:User {id: $user_id})-[:BOUGHT]->(p:Product)<-[:BOUGHT]-(other:User)-[:BOUGHT]->(rec:Product)
        WHERE NOT (u)-[:BOUGHT]->(rec)
        RETURN rec.id AS id, rec.name AS name, rec.price AS price, COUNT(*) AS score
        ORDER BY score DESC
        LIMIT 10
    """
    parameters = {"user_id": user_id}
    with driver.session() as session:
        results = session.run(query, parameters)
        recommendations = [{"id": record["id"], "name": record["name"], "price": record["price"], "score": record["score"]} for record in results]
    return jsonify(recommendations)


@app.route('/products/buy', methods=['POST'])
def buy_product():
    data = request.get_json()
    
    user_id = data.get("user_id")
    product_id = data.get("product_id")

    if not user_id or not product_id:
        return jsonify({"error": "User ID and Product ID are required."}), 400

    query = """
        MATCH (u:User {id: $user_id}), (p:Product {id: $product_id})
        CREATE (u)-[:BOUGHT]->(p)
        RETURN p.id AS product_id, u.id AS user_id
    """

    parameters = {
        "user_id": user_id,
        "product_id": product_id
    }

    try:
        with driver.session() as session:
            result = session.run(query, parameters)
            record = result.single()

            if not record:
                return jsonify({"error": "Unable to process purchase. User or Product not found."}), 404

            return jsonify({
                "message": "Product purchased successfully.",
                "user_id": record["user_id"],
                "product_id": record["product_id"]
            }), 201

    except Exception as e:
        return jsonify({"error": "An error occurred while processing the purchase.", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)