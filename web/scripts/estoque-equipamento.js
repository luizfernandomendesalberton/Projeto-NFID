document.getElementById('searchButton').addEventListener('click', async function () {
    const searchId = document.getElementById('searchId').value.toLowerCase();
    const searchNome = document.getElementById('searchNome').value.toLowerCase();
    const searchStatus = document.getElementById('searchStatus').value;

    const itemList = document.getElementById('itemList');
    itemList.innerHTML = ''; // Limpar lista antes de exibir resultados

    try {
        // Buscar dados do servidor (material.json)
        const response = await fetch('http://127.0.0.1:5000/equipamento');
        const equipamentos = await response.json();

        // Filtrar os equipamentos de acordo com os critérios
        const filteredEquipamentos = equipamentos.filter((equipamento) => {
            const matchesId = equipamento.numeroSerie.toLowerCase().includes(searchId);
            const matchesNome = equipamento.local.toLowerCase().includes(searchNome);
            const matchesStatus = searchStatus === 'all' || equipamento.status === searchStatus;

            return matchesId && matchesNome && matchesStatus;
        });

        // Exibir os equipamentos filtrados
        filteredEquipamentos.forEach((equipamento) => {
            const li = document.createElement('li');
            li.textContent = `ID: ${equipamento.numeroSerie}, Local: ${equipamento.local}, Funcionário: ${equipamento.funcionario}, Status: ${equipamento.status}`;
            itemList.appendChild(li);
        });

        if (filteredEquipamentos.length === 0) {
            const noResults = document.createElement('li');
            noResults.textContent = 'Nenhum equipamento encontrado com os critérios de busca.';
            itemList.appendChild(noResults);
        }

    } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
    }
});
