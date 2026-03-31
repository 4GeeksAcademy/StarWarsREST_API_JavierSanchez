"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from utils import APIException, generate_sitemap
from admin import setup_admin
from models import db, User, Planet, Character, FavoritePlanet, FavoriteCharacter

app = Flask(__name__)
app.url_map.strict_slashes = False

db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

MIGRATE = Migrate(app, db)
db.init_app(app)
CORS(app)
setup_admin(app)

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    return generate_sitemap(app)


@app.route('/user', methods=['GET'])
def handle_hello():

    response_body = {
        "msg": "Hello, this is your GET /user response "
    }

    return jsonify(response_body), 200


def get_current_user():
    """
    Temporary current-user resolver while auth is not implemented.
    Priority: query param `user_id` -> header `X-User-Id` -> first user in DB.
    """
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        user_id = request.headers.get("X-User-Id", type=int)

    if user_id is not None:
        user = db.session.get(User, user_id)
        if user is None:
            raise APIException("Usuario actual no encontrado", status_code=404)
        return user

    user = User.query.order_by(User.id.asc()).first()
    if user is None:
        raise APIException(
            "No hay usuarios en la base de datos. Crea uno desde Flask Admin.",
            status_code=404
        )
    return user


@app.route('/people', methods=['GET'])
def get_people():
    people = Character.query.order_by(Character.id.asc()).all()
    return jsonify([person.serialize() for person in people]), 200


@app.route('/people/<int:people_id>', methods=['GET'])
def get_single_person(people_id):
    person = db.session.get(Character, people_id)
    if person is None:
        raise APIException("Personaje no encontrado", status_code=404)
    return jsonify(person.serialize()), 200


@app.route('/planets', methods=['GET'])
def get_planets():
    planets = Planet.query.order_by(Planet.id.asc()).all()
    return jsonify([planet.serialize() for planet in planets]), 200


@app.route('/planets/<int:planet_id>', methods=['GET'])
def get_single_planet(planet_id):
    planet = db.session.get(Planet, planet_id)
    if planet is None:
        raise APIException("Planeta no encontrado", status_code=404)
    return jsonify(planet.serialize()), 200


@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.order_by(User.id.asc()).all()
    return jsonify([user.serialize() for user in users]), 200


@app.route('/users/favorites', methods=['GET'])
def get_user_favorites():
    current_user = get_current_user()

    favorite_planets = FavoritePlanet.query.filter_by(
        user_id=current_user.id).order_by(FavoritePlanet.id.asc()).all()
    favorite_people = FavoriteCharacter.query.filter_by(
        user_id=current_user.id).order_by(FavoriteCharacter.id.asc()).all()

    return jsonify({
        "user_id": current_user.id,
        "favorites": {
            "planets": [favorite.serialize() for favorite in favorite_planets],
            "people": [favorite.serialize() for favorite in favorite_people]
        }
    }), 200


@app.route('/favorite/planet/<int:planet_id>', methods=['POST'])
def add_favorite_planet(planet_id):
    current_user = get_current_user()

    planet = db.session.get(Planet, planet_id)
    if planet is None:
        raise APIException("Planeta no encontrado", status_code=404)

    existing_favorite = FavoritePlanet.query.filter_by(
        user_id=current_user.id,
        planet_id=planet_id
    ).first()
    if existing_favorite is not None:
        raise APIException("El planeta ya esta en favoritos", status_code=409)

    favorite = FavoritePlanet(user_id=current_user.id, planet_id=planet_id)
    db.session.add(favorite)
    db.session.commit()

    return jsonify(favorite.serialize()), 201


@app.route('/favorite/people/<int:people_id>', methods=['POST'])
def add_favorite_person(people_id):
    current_user = get_current_user()

    person = db.session.get(Character, people_id)
    if person is None:
        raise APIException("Personaje no encontrado", status_code=404)

    existing_favorite = FavoriteCharacter.query.filter_by(
        user_id=current_user.id,
        character_id=people_id
    ).first()
    if existing_favorite is not None:
        raise APIException(
            "El personaje ya esta en favoritos", status_code=409)

    favorite = FavoriteCharacter(
        user_id=current_user.id, character_id=people_id)
    db.session.add(favorite)
    db.session.commit()

    return jsonify(favorite.serialize()), 201


@app.route('/favorite/planet/<int:planet_id>', methods=['DELETE'])
def delete_favorite_planet(planet_id):
    current_user = get_current_user()

    favorite = FavoritePlanet.query.filter_by(
        user_id=current_user.id,
        planet_id=planet_id
    ).first()
    if favorite is None:
        raise APIException(
            "Favorito de planeta no encontrado", status_code=404)

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({"done": True, "message": "Planeta eliminado de favoritos"}), 200


@app.route('/favorite/people/<int:people_id>', methods=['DELETE'])
def delete_favorite_person(people_id):
    current_user = get_current_user()

    favorite = FavoriteCharacter.query.filter_by(
        user_id=current_user.id,
        character_id=people_id
    ).first()
    if favorite is None:
        raise APIException(
            "Favorito de personaje no encontrado", status_code=404)

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({"done": True, "message": "Personaje eliminado de favoritos"}), 200


# this only runs if `$ python src/app.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=PORT, debug=False)
