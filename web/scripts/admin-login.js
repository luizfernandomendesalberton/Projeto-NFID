// admin-login.js
// Script separado para login de administrador na tela de login

// Fechar modal ao clicar fora
const adminModal = document.getElementById('admin-modal');
if (adminModal) {
    adminModal.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });
}

const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const user = document.getElementById('adminUser').value;
        const pass = document.getElementById('adminPass').value;
        // Aqui você pode fazer um fetch para o backend para autenticar admin
        // Exemplo fake:
        if(user === 'admin' && pass === 'admin123') {
            window.location.href = 'admin-panel.html';
        } else {
            document.getElementById('adminLoginMsg').innerText = 'Usuário ou senha inválidos!';
    }
  });
}
