// menu-toggle.js: controla o menu lateral e a exibição das telas

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const btnMenu = document.getElementById('btn-menu');
    const sections = [
        document.getElementById('cadastrar-section'),
        document.getElementById('buscar-section'),
        document.getElementById('utilizar-section')
    ];

    // Abrir menu
    btnMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.add('sidebar-open');
        btnMenu.classList.add('hide');
    });

    // Fechar menu ao clicar fora ou em um item
    document.getElementById('menu-cadastrar').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(0);
        sidebar.classList.remove('sidebar-open');
        btnMenu.classList.remove('hide');
    });
    document.getElementById('menu-buscar').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(1);
        sidebar.classList.remove('sidebar-open');
        btnMenu.classList.remove('hide');
    });
    document.getElementById('menu-utilizar').addEventListener('click', function(e) {
        e.preventDefault();
        showSection(2);
        sidebar.classList.remove('sidebar-open');
        btnMenu.classList.remove('hide');
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (sidebar.classList.contains('sidebar-open') && !sidebar.contains(e.target) && e.target !== btnMenu) {
            sidebar.classList.remove('sidebar-open');
            btnMenu.classList.remove('hide');
        }
    });

    function showSection(idx) {
        sections.forEach((sec, i) => {
            if (i === idx) {
                sec.style.display = 'block';
            } else {
                sec.style.display = 'none';
            }
        });
    }

    // Começa mostrando só a primeira tela
    showSection(0);
});
