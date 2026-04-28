/**
 * Script de Controle do Visualizador de Certificado
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. REFERÊNCIAS DOS ELEMENTOS
    const sidebar = document.getElementById('sidebar');
    const openMenuBtn = document.getElementById('openMenu');   // Hambúrguer no header
    const closeMenuBtn = document.getElementById('closeMenu'); // O "X" na sidebar
    
    const pdfWrapper = document.getElementById('pdfWrapper');
    const pdfFrame = document.getElementById('pdf-frame');
    const expandIcon = document.getElementById('expandIcon');

    /**
     * 2. CONTROLE DA SIDEBAR (ABRIR / FECHAR)
     * Gerencia a visibilidade da barra lateral e do ícone de hambúrguer
     */
    const toggleSidebar = (show) => {
        if (show) {
            // Abre a barra
            sidebar.classList.remove('hidden');
            // Oculta o hambúrguer enquanto a barra está aberta
            if (openMenuBtn) openMenuBtn.style.display = 'none';
        } else {
            // Fecha a barra
            sidebar.classList.add('hidden');
            // O ícone de hambúrguer aparecerá via CSS ou via JS abaixo
            if (openMenuBtn) openMenuBtn.style.display = 'block';
        }
    };

    // Listeners para os botões do menu
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => toggleSidebar(false));
    }

    if (openMenuBtn) {
        openMenuBtn.addEventListener('click', () => toggleSidebar(true));
    }

    /**
     * 3. LÓGICA DE EXPANDIR PDF (MODO FOCO)
     * Alterna entre o tamanho normal e o modo tela cheia
     */
    window.toggleExpand = function() {
        if (!pdfWrapper) return;

        const isFullscreen = pdfWrapper.classList.toggle('fullscreen-active');
        
        if (isFullscreen) {
            // Troca ícone para minimizar
            if (expandIcon) {
                expandIcon.classList.remove('fa-maximize', 'fa-expand');
                expandIcon.classList.add('fa-minimize', 'fa-compress');
            }
            // Bloqueia o scroll da página principal para focar no PDF
            document.body.style.overflow = 'hidden';
        } else {
            // Volta para o ícone de expandir
            if (expandIcon) {
                expandIcon.classList.remove('fa-minimize', 'fa-compress');
                expandIcon.classList.add('fa-maximize', 'fa-expand');
            }
            // Restaura o scroll da página
            document.body.style.overflow = 'auto';
        }
    };

    /**
     * 4. LÓGICA DO BOTÃO SAIR
     * Confirmação antes de voltar à página anterior
     */
    window.handleExit = function() {
        const confirmar = confirm("Deseja fechar a visualização do documento?");
        if (confirmar) {
            // Se houver histórico, volta. Senão, redireciona (exemplo)
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/'; // Altere para sua rota inicial
            }
        }
    };

    /**
     * 5. CARREGAMENTO DO DOCUMENTO (SIMULAÇÃO DE BUCKET/BACKEND)
     * Função que injeta a URL do PDF no frame
     */
    const carregarPdf = (url) => {
        if (pdfFrame && url) {
            // #view=FitH faz o PDF abrir ajustado à largura
            pdfFrame.src = `${url}#view=FitH`;
        }
    };

    // --- INICIALIZAÇÃO ---
    // Substitua pela URL real do seu documento
    const urlExemplo = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    carregarPdf(urlExemplo);

});