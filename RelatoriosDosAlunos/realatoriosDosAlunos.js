/* 
   RELATÓRIOS DE ALUNOS - SCRIPT
*/

document.addEventListener('DOMContentLoaded', () => {
    const openMenuBtn = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const sidebar = document.getElementById('sidebar');
    const menuOverlay = document.getElementById('menuOverlay');
    const searchInput = document.getElementById('searchInput');
    const studentCards = document.querySelectorAll('.student-card');

    // Lógica do Menu
    const openMenu = () => {
        sidebar.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        sidebar.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (openMenuBtn) openMenuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Lógica de Busca
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            studentCards.forEach(card => {
                const name = card.querySelector('h3').innerText.toLowerCase();
                if (name.includes(term)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Interatividade nos cards
    studentCards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.querySelector('h3').innerText;
            console.log(`Visualizando detalhes de: ${name}`);
        });
    });
});
