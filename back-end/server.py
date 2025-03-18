from flask import Flask, send_from_directory, request, jsonify
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Caminhos das pastas
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
WEB_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "web"))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))
ASSETS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "assets"))

# inicia o programa no login
@app.route('/')
def index():
    return send_from_directory(WEB_DIR, 'login.html')

# 🔹 Rota para cadastrar funcionário
@app.route('/cadastro-usuario', methods=['POST'])
def cadastrar_funcionario():
    novo_funcionario = request.json
    funcionarios = []

    func_path = os.path.join(DATA_DIR, 'funcionario.json')

    if os.path.exists(func_path):
        with open(func_path, 'r', encoding='utf-8') as f:
            funcionarios = json.load(f)

    funcionarios.append(novo_funcionario)

    with open(func_path, 'w', encoding='utf-8') as f:
        json.dump(funcionarios, f, indent=4)

    return jsonify({"mensagem": "Funcionário cadastrado com sucesso!"})

# 🔹 Rota para login
@app.route('/login', methods=['POST'])
def login():
    dados = request.json
    username = dados.get('username')
    password = dados.get('password')

    func_path = os.path.join(DATA_DIR, 'funcionario.json')

    if os.path.exists(func_path):
        with open(func_path, 'r', encoding='utf-8') as f:
            funcionarios = json.load(f)

        for funcionario in funcionarios:
            if funcionario['username'] == username and funcionario['password'] == password:
                return jsonify({"mensagem": "Login bem-sucedido!"}), 200

    return jsonify({"mensagem": "Usuário ou senha incorretos!"}), 401


# Ainda não Funcional V


# 🔹 Rota para cadastrar material
@app.route('/cadastrar-equipamento', methods=['POST'])
def cadastrar_material():
    novo_material = request.json
    materiais = []

    mat_path = os.path.join(DATA_DIR, 'material.json')

    if os.path.exists(mat_path):
        with open(mat_path, 'r', encoding='utf-8') as f:
            materiais = json.load(f)

    materiais.append(novo_material)

    with open(mat_path, 'w', encoding='utf-8') as f:
        json.dump(materiais, f, indent=4)

    return jsonify({"mensagem": "Material cadastrado com sucesso!"})

# 🔹 Rota para obter os funcionários
@app.route('/funcionarios', methods=['GET'])
def get_funcionarios():
    func_path = os.path.join(DATA_DIR, 'funcionario.json')

    if os.path.exists(func_path):
        with open(func_path, 'r', encoding='utf-8') as f:
            funcionarios = json.load(f)
        return jsonify(funcionarios)

    return jsonify([])

# 🔹 Rota para obter os materiais
@app.route('/materiais', methods=['GET'])
def get_materiais():
    mat_path = os.path.join(DATA_DIR, 'material.json')

    if os.path.exists(mat_path):
        with open(mat_path, 'r', encoding='utf-8') as f:
            materiais = json.load(f)
        return jsonify(materiais)

    return jsonify([])

# 🔹 Rota para servir arquivos da pasta assets (imagens, ícones, vídeos)
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(ASSETS_DIR, filename)

# 🔹 Servir arquivos estáticos (CSS, JS, imagens) da pasta web
@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(WEB_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
