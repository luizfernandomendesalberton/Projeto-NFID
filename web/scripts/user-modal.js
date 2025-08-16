// Função para salvar cargo/email no backend
async function salvarDadosUsuarioBanco(nome, cargo, email) {
    try {
        const resp = await fetch('/atualizar-usuario', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: nome, cargo, email })
        });
        if (resp.ok) {
            alert('Dados salvos com sucesso!');
        } else {
            alert('Erro ao salvar dados no banco.');
        }
    } catch (e) {
        alert('Erro ao conectar com o servidor.');
    }
}
// Script para avatar flutuante e modal de usuário
const avatarBtn = document.getElementById('avatar');
avatarBtn.style.position = 'fixed';
avatarBtn.style.top = '24px';
avatarBtn.style.right = '32px';
avatarBtn.style.zIndex = '1001';
avatarBtn.style.background = 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
avatarBtn.style.border = 'none';
avatarBtn.style.width = '54px';
avatarBtn.style.height = '54px';
avatarBtn.style.borderRadius = '50%';
avatarBtn.style.boxShadow = '0 4px 18px 0 rgba(37,117,252,0.18), 0 2px 8px 0 rgba(106,17,203,0.12)';
avatarBtn.style.cursor = 'pointer';
avatarBtn.style.padding = '0';
avatarBtn.style.overflow = 'hidden';
avatarBtn.style.display = 'flex';
avatarBtn.style.alignItems = 'center';
avatarBtn.style.justifyContent = 'center';

// Seleciona imagem do avatar conforme usuário
function getAvatarSrc() {
    const nome = (localStorage.getItem('funcionarioAtual') || '').toLowerCase();
    if (nome === 'gabriel') return './assets/imagens/gabriel.jpg';
    if (nome === 'luiz fernando' || nome === 'luiz') return './assets/imagens/luiz.png';
    if (nome === 'ana') return './assets/imagens/ana.jpg';
    return './assets/imagens/novo.png';
}
const imgSrc = getAvatarSrc();
avatarBtn.style.backgroundImage = `url('${imgSrc}')`;
avatarBtn.style.backgroundSize = 'cover';
avatarBtn.style.backgroundPosition = 'center';

// Modal de usuário
const userModal = document.getElementById('user-modal');
const closeUserModal = document.getElementById('closeUserModal');
const avatarModal = document.getElementById('avatar-modal');
const nomeModal = document.getElementById('user-modal-nome');
const cargoModal = document.getElementById('user-modal-cargo');
const emailModal = document.getElementById('user-modal-email');

avatarBtn.onclick = async function() {
    // Buscar dados do usuário no backend
    const nome = localStorage.getItem('funcionarioAtual') || 'Usuário';
    let cargo = '';
    let email = '';
    try {
        const resp = await fetch(`/usuario/${encodeURIComponent(nome)}`);
        if (resp.ok) {
            const dados = await resp.json();
            cargo = dados.cargo || '';
            email = dados.email || '';
            // Atualiza localStorage para cache
            localStorage.setItem('cargoAtual', cargo);
            localStorage.setItem('emailAtual', email);
        } else {
            cargo = localStorage.getItem('cargoAtual') || '';
            email = localStorage.getItem('emailAtual') || '';
        }
    } catch {
        cargo = localStorage.getItem('cargoAtual') || '';
        email = localStorage.getItem('emailAtual') || '';
    }
    nomeModal.textContent = nome;
        cargoModal.innerHTML = `
            <div class='field-group'>
                <label style='font-size:0.95em;color:#2575fc;'>Cargo:</label>
                <input id='inputCargo' type='text' value='${cargo}' class='input-cargo-email'>
            </div>`;
        emailModal.innerHTML = `
            <div class='field-group'>
                <label style='font-size:0.95em;color:#2575fc;'>Email:</label>
                <div class='icon-input-wrapper'>
                    <input id='inputEmail' type='email' value='${email}' class='input-cargo-email'>
                    <button id='emailIconBtn' class='email-icon-btn' title='Enviar email'><img src='./assets/icons/gmail.ico' alt='Email'></button>
                </div>
            </div>`;
        // Campo GitHub
                if (!document.getElementById('github-field-wrapper')) {
                    const githubDiv = document.createElement('div');
                    githubDiv.id = 'github-field-wrapper';
                    githubDiv.className = 'field-group';
                    githubDiv.innerHTML = `
                        <label style='font-size:0.95em;color:#2575fc;'>Rede social do desenvolvedor:</label>
                        <div class='icon-input-wrapper'>
                            <button id='githubIconBtn' class='github-icon-btn' title='Abrir GitHub'><img src='./assets/icons/github.ico' alt='GitHub'></button>
                            <button id='linkedinIconBtn' class='github-icon-btn' title='Abrir LinkedIn'><img src='./assets/icons/linkedin.ico' alt='LinkedIn'></button>
                            <button id='gmailIconBtn' class='github-icon-btn' title='Enviar email'><img src='./assets/icons/gmail.ico' alt='Gmail'></button>
                        </div>
                    `;
                    emailModal.parentNode.insertBefore(githubDiv, emailModal.nextSibling);
                    setTimeout(() => {
                        document.getElementById('githubIconBtn').onclick = function() {
                            window.open('https://github.com/luizfernandomendesalberton/Projeto-NFID', '_blank');
                        };
                        document.getElementById('linkedinIconBtn').onclick = function() {
                            window.open('https://www.linkedin.com/in/seu-linkedin', '_blank');
                        };
                        document.getElementById('gmailIconBtn').onclick = function() {
                            window.open('luizfernandomendesalbertonx30@gmail.com');
                        };
                    }, 100);
                }
    // Clique no ícone de email abre o cliente de email
    setTimeout(() => {
        const emailIconBtn = document.getElementById('emailIconBtn');
        if (emailIconBtn) {
            emailIconBtn.onclick = function() {
                const emailValue = document.getElementById('inputEmail').value;
                if (emailValue) {
                    window.open(`mailto:${emailValue}`);
                }
            };
        }
    }, 100);
    avatarModal.src = imgSrc;
    userModal.classList.add('active');
    userModal.style.display = 'flex';

    // Salvar cargo/email no localStorage ao editar
    document.getElementById('inputCargo').onchange = function(e) {
        localStorage.setItem('cargoAtual', e.target.value);
    };
    document.getElementById('inputEmail').onchange = function(e) {
        localStorage.setItem('emailAtual', e.target.value);
    };

    // Botão para salvar no banco
    const btnSalvar = document.getElementById('salvar-modal');
    btnSalvar.onclick = async function() {
        const cargo = document.getElementById('inputCargo').value;
        const email = document.getElementById('inputEmail').value;
        localStorage.setItem('cargoAtual', cargo);
        localStorage.setItem('emailAtual', email);
        await salvarDadosUsuarioBanco(nome, cargo, email);
    };
};
closeUserModal.onclick = function() {
    userModal.classList.remove('active');
    userModal.style.display = 'none';
};
window.onclick = function(event) {
    if (event.target === userModal) {
        userModal.classList.remove('active');
        userModal.style.display = 'none';
    }
};
