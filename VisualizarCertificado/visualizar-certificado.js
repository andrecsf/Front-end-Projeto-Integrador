document.addEventListener('DOMContentLoaded', () => {

    const sidebar       = document.getElementById('sidebar');
    const mainContent   = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const pdfWrapper    = document.getElementById('pdfWrapper');
    const pdfFrame      = document.getElementById('pdf-frame');
    const expandIcon    = document.getElementById('expandIcon');
    const pdfLoading    = document.getElementById('pdf-loading');
    const pdfError      = document.getElementById('pdf-error');
    const pdfErrorMsg   = document.getElementById('pdf-error-msg');
    const btnRetry      = document.getElementById('btn-retry');
    const docAluno      = document.getElementById('doc-aluno');
    const docMeta       = document.getElementById('doc-meta');
    const sidebarUser   = document.getElementById('sidebar-user');

    let currentBlobUrl  = null;

   
    function toggleMenu() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('visualizar_sidebarCollapsed', isCollapsed);
    }

    function restoreMenuState() {
        if (localStorage.getItem('visualizar_sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleMenu);
    restoreMenuState();

  
    function getToken() {
        return localStorage.getItem('token');
    }

    async function authFetch(url, options = {}) {
        const token = getToken();
        if (!token) {
            window.location.href = '/login.html';
            throw new Error('Sem token de autenticação.');
        }

        const res = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...(options.headers || {})
            }
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            throw new Error('Sessão expirada.');
        }

        return res;
    }

   
    function mostrarLoading() {
        pdfLoading.style.display = 'flex';
        pdfError.style.display   = 'none';
        pdfWrapper.style.display = 'none';
    }

    function mostrarErro(msg) {
        pdfLoading.style.display  = 'none';
        pdfError.style.display    = 'flex';
        pdfWrapper.style.display  = 'none';
        pdfErrorMsg.textContent   = msg || 'Não foi possível carregar o certificado.';
    }

    function mostrarPdf() {
        pdfLoading.style.display = 'none';
        pdfError.style.display   = 'none';
        pdfWrapper.style.display = 'block';
    }

 
    function preencherInfo(dados) {
        // dados vêm da query string: nomeAluno, dataEnvio, horasAproveitadas
        if (dados.nomeAluno) {
            docAluno.textContent  = dados.nomeAluno;
            sidebarUser.textContent = dados.nomeAluno;
        }

        const partes = [];
        if (dados.dataEnvio) {
            const d = new Date(dados.dataEnvio);
            partes.push(d.toLocaleDateString('pt-BR'));
        }
        if (dados.horasAproveitadas) {
            partes.push(dados.horasAproveitadas + 'h');
        }
        if (dados.nomeCategoria) {
            partes.push(dados.nomeCategoria);
        }
        docMeta.textContent = partes.length ? partes.join(' • ') : '—';
    }

    /* =====================================================
       CARREGAR PDF COM AUTENTICAÇÃO
       A URL do certificado aponta para /submissoes/{id}/arquivo
       que requer Bearer token — não pode abrir direto no iframe.
       Fazemos o fetch autenticado, criamos um Blob e passamos
       para o iframe via blob URL.
    ===================================================== */
    async function carregarPdf(urlArquivo) {
        mostrarLoading();

        try {
            const res = await authFetch(urlArquivo);

            if (!res.ok) {
                throw new Error(`Erro ao buscar o certificado (HTTP ${res.status}).`);
            }

            const blob = await res.blob();

            // Verifica se realmente veio um PDF
            if (!blob.type.includes('pdf') && blob.size < 100) {
                throw new Error('O arquivo recebido não é um PDF válido.');
            }

            // Libera blob anterior para não vazar memória
            if (currentBlobUrl) {
                URL.revokeObjectURL(currentBlobUrl);
            }

            currentBlobUrl = URL.createObjectURL(blob);

            pdfFrame.onload = () => mostrarPdf();
            pdfFrame.onerror = () => mostrarErro('Falha ao renderizar o PDF.');
            pdfFrame.src = currentBlobUrl + '#view=FitH';

        } catch (err) {
            console.error('[PDF]', err);
            mostrarErro(err.message);
        }
    }

    
    window.toggleExpand = function () {
        const isFullscreen = pdfWrapper.classList.toggle('fullscreen-active');
        expandIcon.classList.toggle('fa-maximize', !isFullscreen);
        expandIcon.classList.toggle('fa-minimize',  isFullscreen);
        document.body.style.overflow = isFullscreen ? 'hidden' : 'auto';
    };

  
    window.handleExit = function () {
        // Libera o blob antes de sair
        if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);

        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    /* =====================================================
       INIT — lê parâmetros da URL
       Exemplo de link gerado pela tela anterior:
         visualizar-certificado.html
           ?id=1
           &urlArquivo=http://localhost:8080/submissoes/1/arquivo
           &nomeAluno=Caio Victor
           &dataEnvio=2026-05-04T10:00:00Z
           &horasAproveitadas=15
           &nomeCategoria=Cursos Complementares
    ===================================================== */
    const params = new URLSearchParams(window.location.search);

    const urlArquivo = params.get('urlArquivo');

    preencherInfo({
        nomeAluno        : params.get('nomeAluno'),
        dataEnvio        : params.get('dataEnvio'),
        horasAproveitadas: params.get('horasAproveitadas'),
        nomeCategoria    : params.get('nomeCategoria')
    });

    if (urlArquivo) {
        carregarPdf(decodeURIComponent(urlArquivo));
    } else {
        mostrarErro('Nenhum certificado foi indicado na URL.');
    }

    // Botão de tentar novamente
    btnRetry.addEventListener('click', () => {
        if (urlArquivo) carregarPdf(decodeURIComponent(urlArquivo));
    });
});