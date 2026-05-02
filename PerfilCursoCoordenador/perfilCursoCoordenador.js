// perfilCursoCoordenador.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos da Interface ---
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleMenuBtn = document.getElementById('toggle-menu');
    const searchInput = document.getElementById('search-student');
    const studentsList = document.getElementById('students-list');

    // --- 1. Lógica do Menu Lateral (Sidebar) ---
    // Faz a troca de classes para encolher/expandir o menu e ajustar o conteúdo
    if (toggleMenuBtn) {
        toggleMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }

    // --- 2. Lógica de Busca de Alunos ---
    // Filtra os itens da lista conforme o usuário digita
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const studentItems = studentsList.querySelectorAll('.student-item'); // Assume que os itens terão essa classe
            let foundAny = false;

            studentItems.forEach(item => {
                const studentName = item.textContent.toLowerCase();
                if (studentName.includes(searchTerm)) {
                    item.style.display = 'flex';
                    foundAny = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Se não encontrar ninguém, você pode mostrar uma mensagem de "não encontrado"
            const emptyMsg = studentsList.querySelector('.empty-state');
            if (emptyMsg) {
                emptyMsg.style.display = (studentItems.length === 0 || !foundAny) ? 'block' : 'none';
            }
        });
    }

    // --- 3. Simulação de Carregamento de Dados ---
    // Aqui você pode integrar com seu fetch() do backend futuramente
    const carregarDadosIniciais = () => {
        // Exemplo: Atualizar contador de alunos
        const contadorAlunos = document.getElementById('students-count');
        // contadorAlunos.textContent = "15"; // Exemplo de atualização
    };

    carregarDadosIniciais();

    // --- 4. Listeners para os Botões de Ação ---
    document.getElementById('btn-add-category')?.addEventListener('click', () => {
        console.log('Abrir modal de adicionar categoria');
        // Insira aqui a lógica para abrir seu modal ou redirecionar
    });

    document.getElementById('btn-add-student')?.addEventListener('click', () => {
        console.log('Abrir modal de vincular aluno');
        // Insira aqui a lógica para abrir seu modal ou redirecionar
    });
});