/* 
   RELATÓRIOS DE ALUNOS - SCRIPT
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos existentes (mantidos intactos) ---
    const openMenuBtn   = document.getElementById('openMenu');
    const closeMenuBtn  = document.getElementById('closeMenu');
    const menuOverlay   = document.getElementById('menuOverlay');
    const searchInput   = document.getElementById('searchInput');
    const studentCards  = document.querySelectorAll('.student-card');

    // --- Novos elementos para o menu colapsável (igual ao cadastro-coordenador) ---
    const sidebar       = document.getElementById('sidebar');
    const mainContent   = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');

    // Função para alternar o menu colapsável
    function toggleMenu() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('relatorios_sidebarCollapsed', isCollapsed);
    }

    // Restaurar estado salvo do menu
    function restoreMenuState() {
        const isCollapsed = localStorage.getItem('relatorios_sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    // Clique no cabeçalho da sidebar abre/fecha
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleMenu);
    }

    restoreMenuState();

    // --- Lógica original do Menu (overlay) mantida para não quebrar nada ---
    const openMenu = () => {
        // Agora essa lógica não é usada visualmente, mas permanece funcional
        if (menuOverlay) menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (openMenuBtn)  openMenuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay)  menuOverlay.addEventListener('click', closeMenu);

    // --- Lógica de Busca (mantida intacta) ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            studentCards.forEach(card => {
                const name = card.querySelector('h3').innerText.toLowerCase();
                card.style.display = name.includes(term) ? 'block' : 'none';
            });
        });
    }

    // --- Interatividade nos cards (mantida intacta) ---
    studentCards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.querySelector('h3').innerText;
            console.log(`Visualizando detalhes de: ${name}`);
        });
    });
});
