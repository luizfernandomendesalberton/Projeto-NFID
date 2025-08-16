ngrok_public_url = None

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

@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('../data', filename)

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

# 🔹 Rota para cadastrar material
@app.route('/busca-cadastro', methods=['POST'])
def cadastrar_material():
    novo_material = request.json
    print("Recebido do frontend:", novo_material) 
    mat_path = os.path.join(DATA_DIR, 'material.json')
    materiais = []

    if os.path.exists(mat_path):
        with open(mat_path, 'r', encoding='utf-8') as f:
            materiais = json.load(f)

    numero_serie_novo = novo_material.get("numeroSerie")

    for material in materiais:
        if material.get("numeroSerie") == numero_serie_novo:
            return jsonify({"mensagem": "Número de série já cadastrado! Favor Verifique na tela de Busca!"}), 400

    materiais.append(novo_material)

    with open(mat_path, 'w', encoding='utf-8') as f:
        json.dump(materiais, f, indent=4)

    return jsonify({"mensagem": "Material cadastrado com sucesso!"})

# 🔹 Rota para cadastrar equipamento
@app.route('/estoque', methods=['POST'])
def cadastrar_equipamento():
    novo_equipamento = request.json
    equipamentos = []

    mat_path = os.path.join(DATA_DIR, 'estoque.json')

    if os.path.exists(mat_path):
        with open(mat_path, 'r', encoding='utf-8') as f:
            try:
                equipamentos = json.load(f)
            except json.JSONDecodeError:
                equipamentos = []

    # Aqui, apenas use o ID informado pelo usuário
    # novo_equipamento["id"] já deve estar presente

    # Opcional: verifique se o ID já existe
    for eq in equipamentos:
        if str(eq.get("id")) == str(novo_equipamento.get("id")):
            return jsonify({"mensagem": "ID já cadastrado!"}), 400

    equipamentos.append(novo_equipamento)

    with open(mat_path, 'w', encoding='utf-8') as f:
        json.dump(equipamentos, f, indent=4, ensure_ascii=False)

    return jsonify({"mensagem": "Equipamento cadastrado com sucesso!", "id": novo_equipamento["id"]}), 201

@app.route('/atualizar_status/<int:equip_id>', methods=['PATCH'])
def atualizar_status(equip_id):
    estoque_path = os.path.join(DATA_DIR, 'estoque.json')

    if not os.path.exists(estoque_path):
        return jsonify({"erro": "Arquivo de estoque não encontrado"}), 404

    with open(estoque_path, 'r', encoding='utf-8') as f:
        try:
            estoque = json.load(f)
        except json.JSONDecodeError:
            return jsonify({"erro": "Erro ao carregar estoque"}), 500

    data = request.json
    novo_status = data.get("status")

    atualizado = False
    for equipamento in estoque:
        if equipamento["id"] == equip_id:
            equipamento["status"] = novo_status
            atualizado = True
            break

    if not atualizado:
        return jsonify({"erro": "Equipamento não encontrado"}), 404

    with open(estoque_path, 'w', encoding='utf-8') as f:
        json.dump(estoque, f, indent=4, ensure_ascii=False)

    return jsonify({"mensagem": "Status atualizado com sucesso"}), 200

# 🔹 Rota para listar equipamentos
@app.route('/estoque', methods=['GET'])
def listar_equipamentos():
    mat_path = os.path.join(DATA_DIR, 'estoque.json')
    if os.path.exists(mat_path):
        with open(mat_path, 'r', encoding='utf-8') as f:
            try:
                equipamentos = json.load(f)
                return jsonify(equipamentos), 200
            except json.JSONDecodeError:
                return jsonify([]), 200
    return jsonify([]), 200

# 🔹 Rota para obter os funcionários
@app.route('/funcionarios', methods=['GET'])
def get_funcionarios():
    func_path = os.path.join(DATA_DIR, 'funcionario.json')

    if os.path.exists(func_path):
        with open(func_path, 'r', encoding='utf-8') as f:
            funcionarios = json.load(f)
        return jsonify(funcionarios)

    return jsonify([])

# Rota para obter o equipamento de materiais
@app.route('/equipamento', methods=['GET'])
def obter_equipamento():
    material_path = os.path.join(DATA_DIR, 'material.json')

    if not os.path.exists(material_path):
        return jsonify([])

    with open(material_path, 'r', encoding='utf-8') as f:
        materiais = json.load(f)

    return jsonify(materiais)

@app.route('/equipamentos_completos', methods=['GET'])
def listar_equipamentos_completos():
    estoque_path = os.path.join(DATA_DIR, 'estoque.json')
    material_path = os.path.join(DATA_DIR, 'material.json')

    estoque = []
    if os.path.exists(estoque_path):
        with open(estoque_path, 'r', encoding='utf-8') as f:
            try:
                estoque = json.load(f)
            except json.JSONDecodeError:
                pass

    materiais = []
    if os.path.exists(material_path):
        with open(material_path, 'r', encoding='utf-8') as f:
            try:
                materiais = json.load(f)
            except json.JSONDecodeError:
                pass

    material_dict = {str(mat["numeroSerie"]): mat for mat in materiais}

    resultado = []
    for item in estoque:
        id_equipamento = str(item["id"])
        equipamento_info = material_dict.get(id_equipamento, {})

        resultado.append({
            "id": id_equipamento,
            "nome": item["nome"],
            "status": item["status"],
            "local": equipamento_info.get("local", "Não atribuído"),
            "funcionario": equipamento_info.get("funcionario", "Nenhum")
        })

    return jsonify(resultado), 200

# Rota para excluir um equipamento do Estoque pelo ID
@app.route('/estoque/<id>', methods=['DELETE'])
def excluir_equipamento(id):
    material_path = os.path.join(DATA_DIR, 'estoque.json')

    if not os.path.exists(material_path):
        return jsonify({"mensagem": "Equipamento não encontrado"}), 404

    with open(material_path, 'r', encoding='utf-8') as f:
        equipamentos = json.load(f)

    equipamentos = [m for m in equipamentos if str(m.get("id")) != str(id)]

    try:
        with open(material_path, 'w', encoding='utf-8') as f:
            json.dump(equipamentos, f, indent=4)
    except Exception as e:
        return jsonify({"mensagem": "Erro ao atualizar o JSON"}), 500

    return jsonify({"mensagem": "Equipamento excluído com sucesso!"})

# Rota para excluir um material pelo ID
@app.route('/excluir-material/<numeroSerie>', methods=['DELETE'])
def excluir_material(numeroSerie):
    material_path = os.path.join(DATA_DIR, 'material.json')

    if not os.path.exists(material_path):
        return jsonify({"mensagem": "Material não encontrado"}), 404

    with open(material_path, 'r', encoding='utf-8') as f:
        materiais = json.load(f)

    materiais = [m for m in materiais if m.get("numeroSerie") != numeroSerie]

    try:
        with open(material_path, 'w', encoding='utf-8') as f:
            json.dump(materiais, f, indent=4)
    except Exception as e:
        return jsonify({"mensagem": "Erro ao atualizar o JSON"}), 500

    return jsonify({"mensagem": "Material excluído com sucesso!"})

@app.route('/excluir-usuario/<id>', methods=['DELETE'])
def excluir_usuario(id):
    caminho = os.path.join(DATA_DIR, 'funcionario.json')
    if not os.path.exists(caminho):
        return jsonify({'mensagem': 'Arquivo não encontrado'}), 404

    with open(caminho, 'r', encoding='utf-8') as f:
        usuarios = json.load(f)

    # Remove pelo campo que você usa como id (ajuste conforme seu JSON)
    usuarios = [u for u in usuarios if str(u.get('id') or u.get('username') or u.get('nome')) != id]

    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(usuarios, f, ensure_ascii=False, indent=4)

    return jsonify({'mensagem': 'Usuário excluído com sucesso!'})

# 🔹 Rota para servir arquivos da pasta assets (imagens, ícones, vídeos)
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(ASSETS_DIR, filename)

# 🔹 Servir arquivos estáticos (CSS, JS, imagens) da pasta web
@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(WEB_DIR, filename)

@app.route('/ngrok-url', methods=['GET'])
def get_ngrok_url():
    global ngrok_public_url
    return jsonify({'ngrok_url': ngrok_public_url})

if __name__ == '__main__':
    import subprocess
    import time, requests
    try:
        ngrok = subprocess.Popen(["ngrok", "http", "5000"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(2)  # Aguarda o ngrok subir
        try:
            resp = requests.get("http://localhost:4040/api/tunnels")
            ngrok_public_url = resp.json()['tunnels'][0]['public_url']
            print(f"\n[NGROK] URL pública: {ngrok_public_url}\n")
        except Exception as e:
            print("[NGROK] ngrok iniciado, mas não foi possível obter a URL pública automaticamente.")
    except FileNotFoundError:
        print("[NGROK] ngrok não encontrado. Instale o ngrok e adicione ao PATH para integração automática.")
    app.run(debug=True, port=5000)
