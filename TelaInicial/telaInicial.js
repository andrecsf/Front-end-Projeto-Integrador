/* =====================================================
   DASHBOARD COORDENADOR - SCRIPT COMPLETO
   Menu + Integração com Back-end
===================================================== */

const BASE_URL = "http://localhost:8080";

/* =====================================================
   INIT
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    iniciarMenu();
    iniciarEventosUI();
    carregarDashboard();
    carregarSubmissoes();
});


/* =====================================================
   SIDEBAR COLAPSÁVEL (padrão relatoriosDosAlunos)
===================================================== */
function iniciarMenu() {
    const sidebar       = document.getElementById('sidebar');
    const mainContent   = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');

    // Elementos originais mantidos no DOM — lógica preservada sem efeito visual
    const openMenuBtn  = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const menuOverlay  = document.getElementById('menuOverlay');

    function toggleMenu() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('telaInicial_sidebarCollapsed', isCollapsed);
    }

    function restoreMenuState() {
        const isCollapsed = localStorage.getItem('telaInicial_sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleMenu);

    // Mantidos para não quebrar referências existentes
    if (openMenuBtn)  openMenuBtn.addEventListener('click', () => {});
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => {});
    if (menuOverlay)  menuOverlay.addEventListener('click', () => {});

    // Fecha com Escape (comportamento original mantido)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    });

    restoreMenuState();
}


/* =====================================================
   EVENTOS DE UI
===================================================== */
function iniciarEventosUI() {
    const actionCards = document.querySelectorAll('.action-card');

    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('strong')?.innerText;
            console.log(`Ação clicada: ${title}`);
        });
    });
}


/* =====================================================
   DASHBOARD (CARDS SUPERIORES)
===================================================== */
async function carregarDashboard() {
    try {
        const res = await fetch(`${BASE_URL}/dashboard`);

        if (!res.ok) throw new Error("Erro ao buscar dashboard");

        const data = await res.json();

        atualizarTexto("pendentes", data.pendentes);
        atualizarTexto("aprovadas", data.aprovadas);
        atualizarTexto("rejeitadas", data.rejeitadas);
        atualizarTexto("alunos", data.alunos);

    } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        mostrarErro("Erro ao carregar dados do dashboard.");
    }
}


/* =====================================================
   SUBMISSÕES RECENTES
===================================================== */
async function carregarSubmissoes() {
    try {
        const res = await fetch(`${BASE_URL}/submissoes`);

        if (!res.ok) throw new Error("Erro ao buscar submissões");

        const lista = await res.json();
        const container = document.getElementById("submissionsContainer");

        if (!container) return;

        container.innerHTML = "";

        if (!lista || lista.length === 0) {
            container.innerHTML = "<p>Nenhuma submissão encontrada.</p>";
            return;
        }

        lista.slice(0, 3).forEach(sub => {
            container.appendChild(criarCardSubmissao(sub));
        });

    } catch (err) {
        console.error("Erro ao carregar submissões:", err);
        mostrarErro("Erro ao carregar atividades recentes.");
    }
}


/* =====================================================
   CRIAR CARD DE SUBMISSÃO
===================================================== */
function criarCardSubmissao(sub) {
    const card = document.createElement("div");
    card.className = "submission-card";

    const status = (sub.status || "").toUpperCase();

    let icon = "fa-clock";
    if (status === "APROVADO")  icon = "fa-circle-check";
    if (status === "REJEITADO") icon = "fa-circle-xmark";

    card.innerHTML = `
        <div class="card-top">
            <h3>${sub.titulo || "Atividade"}</h3>
            <span class="status-badge">
                <i class="fa-regular ${icon}"></i> ${status}
            </span>
        </div>
        <p class="category">${sub.categoria || "Sem categoria"}</p>
        <div class="card-bottom">
            <span>${sub.horas || 0}h complementares</span>
            <span>${formatarData(sub.data)}</span>
        </div>
    `;

    return card;
}


/* =====================================================
   UTILITÁRIOS
===================================================== */
function atualizarTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor ?? 0;
}

function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
}

function mostrarErro(msg) {
    console.warn(msg);
}
