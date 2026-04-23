document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // DADOS
  // =========================
  const dados = [
    { nome: "Eventos", valor: 789, cor: "#4CAF50" },
    { nome: "Extensão", valor: 654, cor: "#2196F3" },
    { nome: "Pesquisa", valor: 445, cor: "#9C27B0" },
    { nome: "Cultural", valor: 445, cor: "#FF9800" },
    { nome: "Voluntariado", valor: 390, cor: "#F44336" },
    { nome: "Cursos", valor: 1100, cor: "#00BCD4" }
  ];

  const total = dados.reduce((acc, item) => acc + item.valor, 0);

  // =========================
  // GRÁFICO DE CATEGORIA
  // =========================
  const ctx = document.getElementById("categoriaChart");

  if (ctx) {
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: dados.map(d => d.nome),
        datasets: [{
          data: dados.map(d => d.valor),
          backgroundColor: dados.map(d => d.cor),
          borderWidth: 0
        }]
      },
      options: {
        cutout: "65%",
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // =========================
  // LEGENDA
  // =========================
  const legenda = document.getElementById("legenda");

  if (legenda) {
    dados.forEach(item => {
      const porcentagem = ((item.valor / total) * 100).toFixed(1);

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
  // GRÁFICO DE LINHA
  // =========================
  const ctxLinha = document.getElementById("linhaChart");

  if (ctxLinha) {
    new Chart(ctxLinha, {
      type: "line",
      data: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        datasets: [
          {
            label: "Atividades",
            data: [200, 300, 250, 400, 350, 500],
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            tension: 0.4,
            fill: true
          },
          {
            label: "Novos Usuários",
            data: [100, 150, 200, 180, 220, 300],
            borderColor: "#2196F3",
            backgroundColor: "rgba(33, 150, 243, 0.2)",
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // =========================
  // STATUS CHART
  // =========================
  const ctxStatus = document.getElementById("statusChart");

  if (ctxStatus) {
    new Chart(ctxStatus, {
      type: "bar",
      data: {
        labels: ["Aprovadas", "Pendentes"],
        datasets: [{
          data: [3200, 800],
          backgroundColor: ["#4CAF50", "#FF9800"]
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // =========================
  // USUÁRIOS CHART
  // =========================
  const ctxUsuarios = document.getElementById("usuariosChart");

  if (ctxUsuarios) {
    new Chart(ctxUsuarios, {
      type: "bar",
      data: {
        labels: ["Alunos", "Coordenadores", "Admins"],
        datasets: [{
          data: [1000, 300, 150],
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
  // 🔥 SIDEBAR FUNCIONANDO
  // =========================
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");

  // só executa se existir (evita erro)
  if (sidebar && menuBtn) {

    // cria overlay
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    function toggleSidebar() {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    }

    function fecharSidebar() {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    }

    menuBtn.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", fecharSidebar);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fecharSidebar();
    });
  }

  // =========================
  // NOTIFICAÇÃO
  // =========================
  const notificacao = document.querySelector(".icon");

  if (notificacao) {
    notificacao.addEventListener("click", () => {
      alert("Você tem novas notificações 🔔");
    });
  }

});