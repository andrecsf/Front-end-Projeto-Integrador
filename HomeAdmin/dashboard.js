document.addEventListener("DOMContentLoaded", async () => {

  const TOKEN = localStorage.getItem('token');

  const ROTAS = {
    inicio: "../HomeAdmin/home-super-admin.html",
    perfil: "../PerfilSuperadmin/dashboard-superadmin.html",
    cursos: "../GerenciarCurso/gerenciarCursos.html",
    usuarios: "../PI TELAGerenciarUsuário/TELAGERENCIARUSUARIO.html",
    documentos: "../CadastrarCategoria/cadastrarCategoria.html",
    configuracoes: "../Login/index.html",
    coordenadores: "../PI TELAGerenciarUsuário/TELAGERENCIARUSUARIO.html",
    categorias: "../CadastrarCategoria/cadastrarCategoria.html",
    relatorios: "../GerenciarCurso/gerenciarCursos.html"
  };

  // =========================
  // HELPERS
  // =========================
  async function fetchAPI(endpoint) {
    const res = await fetch(`http://localhost:8080${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`Erro ao buscar ${endpoint}`);
    return res.json();
  }

  function setCard(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  }

  // =========================
  // BUSCAR DADOS DO BACKEND
  // =========================
  let submissoes = [];
  let alunos = [];
  let coordenadores = [];
  let admins = [];
  let categorias = [];

  try {
    [submissoes, alunos, coordenadores, admins, categorias] = await Promise.all([
      fetchAPI('/submissoes'),
      fetchAPI('/alunos'),
      fetchAPI('/coordenadores'),
      fetchAPI('/admins'),
      fetchAPI('/categorias')
    ]);
  } catch (e) {
    console.error('Erro ao carregar dados do dashboard:', e);
  }

  // =========================
  // CALCULAR TOTAIS
  // =========================
  const totalUsuarios = alunos.length + coordenadores.length + admins.length;
  const totalAtividades = submissoes.length;
  const totalAprovadas = submissoes.filter(s => s.status === 'APROVADO').length;
  const totalPendentes = submissoes.filter(s => s.status === 'PENDENTE').length;

  // =========================
  // ATUALIZAR CARDS DO TOPO
  // =========================
  setCard('card-usuarios', totalUsuarios);
  setCard('card-atividades', totalAtividades);
  setCard('card-aprovadas', totalAprovadas);
  setCard('card-pendentes', totalPendentes);

  // =========================
  // ATUALIZAR BANNER
  // =========================
  const banner = document.querySelector('.banner p');
  if (banner) {
    banner.textContent = totalPendentes > 0
      ? `Você tem ${totalPendentes} atividade${totalPendentes > 1 ? 's' : ''} para revisar`
      : 'Nenhuma atividade pendente no momento ✅';
  }

  // =========================
  // GRÁFICO: ATIVIDADES POR CATEGORIA
  // =========================
  const CORES = ["#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#F44336", "#00BCD4", "#E91E63", "#FF5722"];

  // Conta submissões por categoria
  const contagemPorCategoria = {};
  submissoes.forEach(s => {
    const cat = s.nomeCategoria || 'Sem categoria';
    contagemPorCategoria[cat] = (contagemPorCategoria[cat] || 0) + 1;
  });

  
  const dadosCategoria = Object.keys(contagemPorCategoria).length > 0
    ? Object.entries(contagemPorCategoria).map(([nome, valor], i) => ({
        nome, valor, cor: CORES[i % CORES.length]
      }))
    : categorias.map((cat, i) => ({
        nome: cat.area || cat.nome || `Categoria ${i + 1}`,
        valor: 0,
        cor: CORES[i % CORES.length]
      }));

  const total = dadosCategoria.reduce((acc, d) => acc + d.valor, 0);

  const ctxCategoria = document.getElementById("categoriaChart");
  if (ctxCategoria) {
    new Chart(ctxCategoria, {
      type: "doughnut",
      data: {
        labels: dadosCategoria.map(d => d.nome),
        datasets: [{
          data: dadosCategoria.map(d => d.valor),
          backgroundColor: dadosCategoria.map(d => d.cor),
          borderWidth: 0
        }]
      },
      options: {
        cutout: "65%",
        plugins: { legend: { display: false } }
      }
    });
  }

  // Legenda do gráfico de categoria
  const legenda = document.getElementById("legenda");
  if (legenda) {
    legenda.innerHTML = '';
    dadosCategoria.forEach(item => {
      const porcentagem = total > 0 ? ((item.valor / total) * 100).toFixed(1) : '0.0';
      legenda.innerHTML += `
        <div class="legenda-item">
          <div>
            <span class="cor" style="background:${item.cor}"></span>
            ${item.nome}
          </div>
          <strong>${porcentagem}% (${item.valor})</strong>
        </div>
      `;
    });
  }

  // =========================
  // GRÁFICO: TENDÊNCIA MENSAL
  // =========================
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // Agrupa submissões por mês
  const atividadesPorMes = Array(12).fill(0);
  submissoes.forEach(s => {
    if (s.dataEnvio) {
      const mes = new Date(s.dataEnvio).getMonth();
      atividadesPorMes[mes]++;
    }
  });

  // Pega apenas os últimos 6 meses
  const mesAtual = new Date().getMonth();
  const ultimos6Meses = [];
  const dadosUltimos6 = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (mesAtual - i + 12) % 12;
    ultimos6Meses.push(meses[idx]);
    dadosUltimos6.push(atividadesPorMes[idx]);
  }

  const ctxLinha = document.getElementById("linhaChart");
  if (ctxLinha) {
    new Chart(ctxLinha, {
      type: "line",
      data: {
        labels: ultimos6Meses,
        datasets: [{
          label: "Atividades Enviadas",
          data: dadosUltimos6,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // =========================
  // GRÁFICO: STATUS DAS ATIVIDADES
  // =========================
  const totalRejeitadas = submissoes.filter(s => s.status === 'REJEITADO').length;

  const ctxStatus = document.getElementById("statusChart");
  if (ctxStatus) {
    new Chart(ctxStatus, {
      type: "bar",
      data: {
        labels: ["Aprovadas", "Pendentes", "Rejeitadas"],
        datasets: [{
          data: [totalAprovadas, totalPendentes, totalRejeitadas],
          backgroundColor: ["#4CAF50", "#FF9800", "#F44336"]
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // =========================
  // GRÁFICO: DISTRIBUIÇÃO DE USUÁRIOS
  // =========================
  const ctxUsuarios = document.getElementById("usuariosChart");
  if (ctxUsuarios) {
    new Chart(ctxUsuarios, {
      type: "bar",
      data: {
        labels: ["Alunos", "Coordenadores", "Admins"],
        datasets: [{
          data: [alunos.length, coordenadores.length, admins.length],
          backgroundColor: ["#2196F3", "#9C27B0", "#F44336"]
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // =========================
  // STATUS DO SISTEMA
  // =========================
  const elServidor = document.getElementById('status-servidor');
  const elBanco = document.getElementById('status-banco');
  const elUltimaAtividade = document.getElementById('status-ultima-atividade');

  
  const backendOnline = submissoes !== null;

  if (elServidor) {
    if (backendOnline) {
      elServidor.textContent = 'Online';
      elServidor.className = 'badge online';
    } else {
      elServidor.textContent = 'Offline';
      elServidor.className = 'badge offline';
    }
  }

  if (elBanco) {
    // Se conseguiu buscar submissões do banco, o banco está ativo
    if (backendOnline) {
      elBanco.textContent = 'Ativo';
      elBanco.className = 'badge active';
    } else {
      elBanco.textContent = 'Indisponível';
      elBanco.className = 'badge offline';
    }
  }

  if (elUltimaAtividade) {
    // Pega a submissão mais recente pelo dataEnvio
    const comData = submissoes.filter(s => s.dataEnvio);
    if (comData.length > 0) {
      const maisRecente = comData.sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio))[0];
      const data = new Date(maisRecente.dataEnvio);
      elUltimaAtividade.textContent = data.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } else {
      elUltimaAtividade.textContent = 'Nenhuma atividade registrada';
    }
  }


  const menuLinks = document.querySelectorAll(".sidebar-nav ul li a");
  const menuKeys = ["inicio", "perfil", "cursos", "usuarios", "documentos", "configuracoes"];

  menuLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const rota = menuKeys[index];
      if (ROTAS[rota]) window.location.href = ROTAS[rota];
    });
  });

  // =========================
  // AÇÕES RÁPIDAS
  // =========================
  document.querySelectorAll(".action-card").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const acao = card.getAttribute("data-action");
      if (ROTAS[acao]) window.location.href = ROTAS[acao];
    });
  });

  // =========================
  // CARDS DO TOPO (clicáveis)
  // =========================
  document.querySelectorAll(".card").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const rota = card.getAttribute("data-rota");
      if (ROTAS[rota]) window.location.href = ROTAS[rota];
    });
  });

  // =========================
  // SIDEBAR TOGGLE
  // =========================
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");

  if (sidebar && menuBtn) {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    function toggleSidebar() {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    }

    menuBtn.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
      }
    });
  }

});