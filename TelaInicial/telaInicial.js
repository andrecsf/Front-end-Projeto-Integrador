/* 
   DASHBOARD COORDENADOR - SCRIPT
   Lógica para Menu Retrátil à Direita
*/

document.addEventListener('DOMContentLoaded', () => {
    const openMenuBtn = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const sidebar = document.getElementById('sidebar');
    const menuOverlay = document.getElementById('menuOverlay');

    // Função para abrir o menu
    const openMenu = () => {
        sidebar.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impede scroll ao abrir menu
    };

    // Função para fechar o menu
    const closeMenu = () => {
        sidebar.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restaura scroll
    };

    // Eventos de clique
    if (openMenuBtn) openMenuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Interatividade nos cards de ação
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('strong').innerText;
            console.log(`Ação clicada: ${title}`);
        });
    });

    // Interatividade nos itens do menu (fechar ao clicar em um item)
    const navLinks = document.querySelectorAll('.side-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 850) closeMenu();
        });
    });
});
