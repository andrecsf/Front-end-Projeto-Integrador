// =========================
// ELEMENTOS
// =========================
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarToggle = document.getElementById('sidebarToggle');
const menuOverlay = document.getElementById('menuOverlay');

/**
 * Função para alternar o estado da sidebar (aberta/fechada)
 */
function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    
    // Salva o estado no localStorage para persistência entre páginas
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    
    // Se o seu CSS usa uma classe no main-content para ajustar a margem
    if (mainContent) {
        mainContent.classList.toggle('expanded');
    }
}

/**
 * Restaura o estado da sidebar ao carregar a página
 * Isso evita que o menu fique "piscando" ou mude sozinho ao navegar
 */
function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
    } else {
        sidebar.classList.remove('collapsed');
        if (mainContent) {
            mainContent.classList.remove('expanded');
        }
    }
}

// =========================
// EVENT LISTENERS
// =========================

// Clique no ícone de barras (Hambúrguer) no topo da Sidebar
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleMenu);
}

// Caso você tenha mantido o botão "openMenu" no mobile/header
const btnOpenMenu = document.getElementById('openMenu');
if (btnOpenMenu) {
    btnOpenMenu.addEventListener('click', toggleMenu);
}

// Fechar ao clicar no overlay (comum em dispositivos móveis)
if (menuOverlay) {
    menuOverlay.addEventListener('click', toggleMenu);
}

// =========================
// INICIALIZAÇÃO
// =========================
document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    
    // Aqui você pode adicionar chamadas para carregar dados das estatísticas
    // Exemplo: carregarEstatisticas();
});