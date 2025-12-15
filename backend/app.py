import jwt  
from datetime import datetime, timedelta
import os
import argparse
import json
import jwt
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

from flask import Flask, request, jsonify, abort, render_template_string
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash


# -----------------------------------------------------
# Config
# -----------------------------------------------------
app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///Users.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key") 
db = SQLAlchemy(app)

# JWT настройки
JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-key-change-this-in-production")
JWT_EXPIRATION = timedelta(hours=24)
JWT_SECRET = "your-super-secret-key-change-this-in-production"  # Секретный ключ

@staticmethod 
def generate_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token

# -----------------------------------------------------
# Models
# -----------------------------------------------------
class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    #owner_name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    

    # Хеширование
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    # Метод для проверки пароля
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
    #        "owner_name": self.owner_name,
            "username": self.username
        }

# -----------------------------------------------------
# JWT функции
# -----------------------------------------------------
def generate_token(user_id):
    """Генерация JWT токена для пользователя"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + JWT_EXPIRATION,
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return token

def verify_token(token):
    """Проверка JWT токена"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None  # Токен истек
    except jwt.InvalidTokenError:
        return None  # Невалидный токен



class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    game_type = db.Column(db.String(50), nullable=False)
    game_name = db.Column(db.String(200), nullable=False)
    game_content = db.Column(db.Text, nullable=False)  # JSON строка с данными игры
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связь с пользователем
    user = db.relationship('Account', backref=db.backref('games', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "game_type": self.game_type,
            "game_name": self.game_name,
            "game_content": self.game_content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# -----------------------------------------------------
# API endpoints
# -----------------------------------------------------
@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"status": "backend works!"})

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({
                "error": "Email и password обязательны"
            }), 400
        
        email = data['email'].strip()
        password = data['password']

        # Проверяем, существует ли пользователь с таким email
        existing_user = Account.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                "error": "Пользователь с таким email уже существует"
            }), 409
        
        # Валидация входных данных
        required_fields = ['username', 'password']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    "error": f"Поле '{field}' обязательно для заполнения"
                }), 400
        
        # Проверяем, существует ли пользователь с таким username
        existing_user = Account.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({
                "error": "Пользователь с таким именем уже существует"
            }), 409
        
        # Создаем новый аккаунт
        new_account = Account(
            email=email,
            username=data['username'].strip()
        )
        new_account.set_password(data['password'])  # Хешируем пароль
        
        db.session.add(new_account)
        db.session.commit()
        
        return jsonify({
            "message": "Аккаунт успешно создан",
            "account": new_account.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": f"Ошибка при создании аккаунта: {str(e)}"
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    

    """Аутентификация пользователя"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                "error": "Email и пароль обязательны"
            }), 400
        
        email = data['email'].strip()
        password = data['password']
        
        # Ищем пользователя по email
        user = Account.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({
                "error": "Неверный email или пароль"
            }), 401
        
        # Проверяем пароль
        if not user.check_password(password):
            return jsonify({
                "error": "Неверный email или пароль"
            }), 401
        
        # Успешная аутентификация
        token = generate_token(user.id)
        return jsonify({
        "message": "Вход выполнен успешно",
        "user": user.to_dict(),
        "token": token
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Ошибка при входе: {str(e)}"
        }), 500

# -----------------------------------------------------
# Games API endpoints
# -----------------------------------------------------
@app.route('/api/games', methods=['POST'])
def create_game():
    """Создание новой игры"""
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['game_type', 'game_name', 'game_content']):
            return jsonify({
                "error": "game_type, game_name и game_content обязательны"
            }), 400
        
        # Получить токен из заголовка
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Токен не предоставлен"}), 401
        
        token = auth_header.split(' ')[1]  # Убираем 'Bearer '
        user_id = verify_token(token)  # Проверяем токен
        
        if not user_id:
            return jsonify({"error": "Недействительный токен"}), 401
        
        # Создаем новую игру
        new_game = Game(
            user_id=user_id,
            game_type=data['game_type'],
            game_name=data['game_name'],
            game_content=json.dumps(data['game_content'])  # Сохраняем как JSON строку
        )
        
        db.session.add(new_game)
        db.session.commit()
        
        return jsonify({
            "message": "Игра успешно создана",
            "game": new_game.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": f"Ошибка при создании игры: {str(e)}"
        }), 500

@app.route('/api/my-games', methods=['GET'])
def get_user_games():
    """Получение игр пользователя"""
    try:
        # Получить токен из заголовка
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Токен не предоставлен"}), 401
        
        token = auth_header.split(' ')[1]  # Убираем 'Bearer '
        user_id = verify_token(token)  # Проверяем токен
        
        if not user_id:
            return jsonify({"error": "Недействительный токен"}), 401
        
        games = Game.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            "games": [game.to_dict() for game in games]
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Ошибка при получении игр: {str(e)}"
        }), 500

@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Получение конкретной игры"""
    try:
        # Получить токен из заголовка
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Токен не предоставлен"}), 401
        
        token = auth_header.split(' ')[1]  # Убираем 'Bearer '
        user_id = verify_token(token)  # Проверяем токен
        
        if not user_id:
            return jsonify({"error": "Недействительный токен"}), 401
        
        game = Game.query.get_or_404(game_id)
        
        # Проверяем, что пользователь имеет право доступа к этой игре
        if game.user_id != user_id:
            return jsonify({"error": "Нет доступа к этой игре"}), 403
        
        return jsonify({
            "game": game.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Ошибка при получении игры: {str(e)}"
        }), 500

@app.route('/api/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    """Удаление игры"""
    try:
        # Получить токен из заголовка
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Токен не предоставлен"}), 401
        
        token = auth_header.split(' ')[1]  # Убираем 'Bearer '
        user_id = verify_token(token)  # Проверяем токен
        
        if not user_id:
            return jsonify({"error": "Недействительный токен"}), 401
        
        game = Game.query.get_or_404(game_id)
        
        # Проверяем, что пользователь имеет право удалить эту игру
        if game.user_id != user_id:
            return jsonify({"error": "Нет прав для удаления этой игры"}), 403
        
        db.session.delete(game)
        db.session.commit()
        
        return jsonify({
            "message": "Игра успешно удалена"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": f"Ошибка при удалении игры: {str(e)}"
        }), 500


# -----------------------------------------------------
# Initialization
# -----------------------------------------------------
@app.before_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)