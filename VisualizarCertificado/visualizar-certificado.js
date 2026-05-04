document.addEventListener('DOMContentLoaded', () => {

    const sidebar      = document.getElementById('sidebar');
    const mainContent  = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const pdfWrapper   = document.getElementById('pdfWrapper');
    const pdfFrame     = document.getElementById('pdf-frame');
    const expandIcon   = document.getElementById('expandIcon');

    /* =====================================================
       SIDEBAR COLAPSÁVEL (igual telaInicial)
    ===================================================== */
    function toggleMenu() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('visualizar_sidebarCollapsed', isCollapsed);
    }

    function restoreMenuState() {
        const isCollapsed = localStorage.getItem('visualizar_sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleMenu);
    restoreMenuState();

    /* =====================================================
       EXPANDIR PDF (MODO FOCO)
    ===================================================== */
    window.toggleExpand = function () {
        if (!pdfWrapper) return;

        const isFullscreen = pdfWrapper.classList.toggle('fullscreen-active');

        if (expandIcon) {
            if (isFullscreen) {
                expandIcon.classList.remove('fa-maximize');
                expandIcon.classList.add('fa-minimize');
            } else {
                expandIcon.classList.remove('fa-minimize');
                expandIcon.classList.add('fa-maximize');
            }
        }

        document.body.style.overflow = isFullscreen ? 'hidden' : 'auto';
    };

    /* =====================================================
       BOTÃO SAIR
    ===================================================== */
    window.handleExit = function () {
        const confirmar = confirm("Deseja fechar a visualização do documento?");
        if (confirmar) {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        }
    };

    /* =====================================================
       CARREGAMENTO DO PDF
    ===================================================== */
    const carregarPdf = (url) => {
        if (pdfFrame && url) {
            pdfFrame.src = `${url}#view=FitH`;
        }
    };

    const urlExemplo = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    carregarPdf(urlExemplo);
});
