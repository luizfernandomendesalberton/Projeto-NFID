ngrok_public_url = None

from flask import Flask, send_from_directory, request, jsonify
import json
import mysql.connector
import os
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


# Caminhos das pastas
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
WEB_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "web"))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))
ASSETS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "assets"))


# Rota para buscar dados do usuário (cargo/email) pelo username
@app.route('/usuario/<username>', methods=['GET'])
def get_usuario(username):
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT cargo, email FROM funcionario WHERE username = %s", (username,))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        if usuario:
            return jsonify(usuario)
        else:
            return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    except Exception as e:
        return jsonify({'mensagem': f'Erro ao buscar usuário: {str(e)}'}), 500

# inicia o programa no login
@app.route('/')
def index():
    return send_from_directory(WEB_DIR, 'login.html')

@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('../data', filename)

# 🔹 Rota para cadastrar funcionário (MySQL)
@app.route('/cadastro-usuario', methods=['POST'])
def cadastrar_funcionario():
    novo_funcionario = request.json
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        sql = "INSERT INTO funcionario (username, password, nome, cargo, email) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (
            novo_funcionario.get('username'),
            novo_funcionario.get('password'),
            novo_funcionario.get('nome'),
            novo_funcionario.get('cargo'),
            novo_funcionario.get('email')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Funcionário cadastrado com sucesso!"})
    except mysql.connector.IntegrityError:
        return jsonify({"mensagem": "Usuário já existe!"}), 400
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao cadastrar funcionário: {str(e)}"}), 500

# 🔹 Rota para login (MySQL)
@app.route('/login', methods=['POST'])
def login():
    dados = request.json
    username = dados.get('username')
    password = dados.get('password')
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM funcionario WHERE username = %s AND password = %s"
        cursor.execute(sql, (username, password))
        funcionario = cursor.fetchone()
        cursor.close()
        conn.close()
        if funcionario:
            return jsonify({"mensagem": "Login bem-sucedido!"}), 200
        else:
            return jsonify({"mensagem": "Usuário ou senha incorretos!"}), 401
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao fazer login: {str(e)}"}), 500
    
    # Rota para atualizar cargo e email do usuário
@app.route('/atualizar-usuario', methods=['PATCH'])
def atualizar_usuario():
    dados = request.json
    username = dados.get('username')
    cargo = dados.get('cargo')
    email = dados.get('email')
    if not username:
        return jsonify({'mensagem': 'Usuário não informado!'}), 400
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        cursor.execute("UPDATE funcionario SET cargo = %s, email = %s WHERE username = %s", (cargo, email, username))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'mensagem': 'Dados atualizados com sucesso!'})
    except Exception as e:
        return jsonify({'mensagem': f'Erro ao atualizar usuário: {str(e)}'}), 500
    

# 🔹 Rota para cadastrar material (MySQL)
@app.route('/busca-cadastro', methods=['POST'])
def cadastrar_material():
    novo_material = request.json
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT numeroSerie FROM material WHERE numeroSerie = %s", (novo_material.get('numeroSerie'),))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"mensagem": "Número de série já cadastrado! Favor Verifique na tela de Busca!"}), 400
        sql = "INSERT INTO material (numeroSerie, nome, local, funcionario) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (
            novo_material.get('numeroSerie'),
            novo_material.get('nome'),
            novo_material.get('local'),
            novo_material.get('funcionario')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Material cadastrado com sucesso!"})
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao cadastrar material: {str(e)}"}), 500

# 🔹 Rota para cadastrar equipamento (MySQL)
@app.route('/estoque', methods=['POST'])
def cadastrar_equipamento():
    novo_equipamento = request.json
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM estoque WHERE id = %s", (novo_equipamento.get('id'),))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"mensagem": "ID já cadastrado!"}), 400
        sql = "INSERT INTO estoque (id, nome, status) VALUES (%s, %s, %s)"
        cursor.execute(sql, (
            novo_equipamento.get('id'),
            novo_equipamento.get('nome'),
            novo_equipamento.get('status')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Equipamento cadastrado com sucesso!", "id": novo_equipamento["id"]}), 201
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao cadastrar equipamento: {str(e)}"}), 500

@app.route('/atualizar_status/<int:equip_id>', methods=['PATCH'])
def atualizar_status(equip_id):
    data = request.json
    novo_status = data.get("status")
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        cursor.execute("UPDATE estoque SET status = %s WHERE id = %s", (novo_status, equip_id))
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"erro": "Equipamento não encontrado"}), 404
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Status atualizado com sucesso"}), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao atualizar status: {str(e)}"}), 500

# 🔹 Rota para listar equipamentos (MySQL)
@app.route('/estoque', methods=['GET'])
def listar_equipamentos():
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM estoque")
        equipamentos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(equipamentos), 200
    except Exception as e:
        return jsonify([]), 200

# 🔹 Rota para obter os funcionários (MySQL)
@app.route('/funcionarios', methods=['GET'])
def get_funcionarios():
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM funcionario")
        funcionarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(funcionarios)
    except Exception as e:
        return jsonify([])

# Rota para obter o equipamento de materiais (MySQL)
@app.route('/equipamento', methods=['GET'])
def obter_equipamento():
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM material")
        materiais = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(materiais)
    except Exception as e:
        return jsonify([])

# Rota para listar equipamentos completos (MySQL)
@app.route('/equipamentos_completos', methods=['GET'])
def listar_equipamentos_completos():
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT e.id, e.nome, e.status, m.local, m.funcionario FROM estoque e LEFT JOIN material m ON e.id = m.numeroSerie")
        resultado = []
        for row in cursor.fetchall():
            resultado.append({
                "id": str(row["id"]),
                "nome": row["nome"],
                "status": row["status"],
                "local": row["local"] if row["local"] else "Não atribuído",
                "funcionario": row["funcionario"] if row["funcionario"] else "Nenhum"
            })
        cursor.close()
        conn.close()
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify([]), 200

# Rota para excluir um equipamento do Estoque pelo ID
@app.route('/estoque/<id>', methods=['DELETE'])
def excluir_equipamento(id):
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        cursor.execute("DELETE FROM estoque WHERE id = %s", (id,))
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"mensagem": "Equipamento não encontrado"}), 404
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Equipamento excluído com sucesso!"})
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao excluir equipamento: {str(e)}"}), 500

# Rota para excluir um material pelo ID
@app.route('/excluir-material/<numeroSerie>', methods=['DELETE'])
def excluir_material(numeroSerie):
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        cursor.execute("DELETE FROM material WHERE numeroSerie = %s", (numeroSerie,))
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"mensagem": "Material não encontrado"}), 404
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Material excluído com sucesso!"})
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao excluir material: {str(e)}"}), 500

@app.route('/excluir-usuario/<id>', methods=['DELETE'])
def excluir_usuario(id):
    try:
        conn = mysql.connector.connect(
            user='root',
            password='ecalfma',
            host='localhost',
            database='projeto_nfid'
        )
        cursor = conn.cursor()
        cursor.execute("DELETE FROM funcionario WHERE username = %s", (id,))
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'mensagem': 'Usuário não encontrado'}), 404
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'mensagem': 'Usuário excluído com sucesso!'})
    except Exception as e:
        return jsonify({'mensagem': f'Erro ao excluir usuário: {str(e)}'}), 500

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
