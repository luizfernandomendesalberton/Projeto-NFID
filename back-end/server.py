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

# 🔹 Rota para cadastrar material
@app.route('/busca-cadastro', methods=['POST'])
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

    ultimo_id = equipamentos[-1]["id"] if equipamentos else 0
    novo_equipamento["id"] = ultimo_id + 1

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

    equipamentos = [m for m in equipamentos if m.get("id") != int(id)]

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
