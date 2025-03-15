// Função para excluir um equipamento
function excluirEquipamento(index) {
    let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
    equipamentos.splice(index, 1);
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));
    alert('Equipamento excluído com sucesso!');
    location.reload();
}

export { excluirEquipamento };