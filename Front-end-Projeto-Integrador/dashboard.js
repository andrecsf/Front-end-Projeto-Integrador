document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // DADOS DAS CATEGORIAS
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
  //  GRÁFICO
  // =========================
  const ctx = document.getElementById("categoriaChart");

  if (ctx) {
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: dados.map(item => item.nome),
        datasets: [{
          data: dados.map(item => item.valor),
          backgroundColor: dados.map(item => item.cor),
          borderWidth: 0
        }]
      },
      options: {
        cutout: "65%",
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // =========================
  //  LEGENDA
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
          <strong>${porcentagem}%</strong>
        </div>
      `;
    });
  }

  // =========================
  //  MENU
  // =========================
  window.toggleMenu = function () {
    alert("Abrir menu lateral (tu pode implementar depois 😄)");
  };

  // =========================
  //  NOTIFICAÇÃO
  // =========================
  const notificacao = document.querySelector(".icon");

  if (notificacao) {
    notificacao.addEventListener("click", () => {
      alert("Você tem novas notificações 🔔");
    });
  }

  // =========================
  //  CLICK NOS CARDS (extra)
  // =========================
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const titulo = card.querySelector(".card-label").innerText;
      alert(`Você clicou em: ${titulo}`);
    });
  });

});