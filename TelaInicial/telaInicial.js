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
   MENU LATERAL
===================================================== */
function iniciarMenu() {
    const openMenuBtn = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const sidebar = document.getElementById('sidebar');
    const menuOverlay = document.getElementById('menuOverlay');

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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Fecha menu ao clicar em links (mobile)
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 850) closeMenu();
        });
    });
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
    if (status === "APROVADO") icon = "fa-circle-check";
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