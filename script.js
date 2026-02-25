const currentPage = window.location.pathname.split("/").pop();


function getUsers() {
  const data = JSON.parse(localStorage.getItem("users"));
  return Array.isArray(data) ? data : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

if (currentPage === "index.html" || currentPage === "") {

  const formLogin = document.getElementById("form-login");
  const formSignupContainer = document.getElementById("form-signup");

  const goSignup = document.getElementById("go-signup");
  const goLogin = document.getElementById("go-login");
  const signupBtn = document.getElementById("signup-btn");


  goSignup.addEventListener("click", (e) => {
    e.preventDefault();
    formLogin.classList.add("hidden");
    formSignupContainer.classList.remove("hidden");
  });

  goLogin.addEventListener("click", (e) => {
    e.preventDefault();
    formSignupContainer.classList.add("hidden");
    formLogin.classList.remove("hidden");
  });

  signupBtn.addEventListener("click", () => {

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!name || !email || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    let users = getUsers();

    if (users.some(u => u.email === email)) {
      alert("Email já cadastrado.");
      return;
    }

    users.push({
      name,
      email,
      password,
      schedules: []
    });

    saveUsers(users);

    alert("Conta criada com sucesso!");

    formSignupContainer.classList.add("hidden");
    formLogin.classList.remove("hidden");
  });


  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const users = getUsers();

    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      alert("Usuário ou senha incorretos.");
      return;
    }

    localStorage.setItem("loggedUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
  });
}

if (currentPage === "dashboard.html") {

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  if (!loggedUser) {
    window.location.href = "index.html";
  }

  let users = getUsers();
  let userIndex = users.findIndex(u => u.email === loggedUser.email);

  if (userIndex === -1) {
    localStorage.removeItem("loggedUser");
    window.location.href = "index.html";
  }

  let currentUser = users[userIndex];

  const userEmail = document.getElementById("user-email");
  const logoutBtn = document.getElementById("logoutBtn");

  const form = document.getElementById("form-agendamento");
  const tableBody = document.getElementById("lista-agendamentos");
  const filtro = document.getElementById("filtro");

  const totalAppointmentsEl = document.getElementById("totalAppointments");
  const todaysAppointmentsEl = document.getElementById("todaysAppointments");

  userEmail.textContent = currentUser.email;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "index.html";
  });


  function render() {

    tableBody.innerHTML = "";

    const search = filtro.value.toLowerCase();

    const filtered = (currentUser.schedules || []).filter(a =>
      a.cliente.toLowerCase().includes(search)
    );

    filtered.forEach(a => {

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${a.cliente}</td>
        <td>${new Date(a.dataHora).toLocaleString("pt-BR")}</td>
        <td>${a.telefone || "-"}</td>
        <td>${a.endereco}</td>
        <td>${a.observacoes || "-"}</td>
      `;

      tableBody.appendChild(tr);
    });

    totalAppointmentsEl.textContent = currentUser.schedules.length;

    const today = new Date().toDateString();

    const todays = currentUser.schedules.filter(a =>
      new Date(a.dataHora).toDateString() === today
    ).length;

    todaysAppointmentsEl.textContent = todays;

    updateChart();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cliente = document.getElementById("cliente").value.trim();
    const dataHora = document.getElementById("dataHora").value;
    const telefone = document.getElementById("telefone").value;
    const emailCliente = document.getElementById("emailCliente").value;
    const endereco = document.getElementById("endereco").value.trim();
    const observacoes = document.getElementById("observacoes").value;

    if (!cliente || !dataHora || !endereco) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const novo = {
      cliente,
      dataHora,
      telefone,
      emailCliente,
      endereco,
      observacoes
    };

    currentUser.schedules.push(novo);

    users[userIndex] = currentUser;
    saveUsers(users);

    localStorage.setItem("loggedUser", JSON.stringify(currentUser));

    form.reset();
    render();
  });

  filtro.addEventListener("input", render);

  let chart;

function updateChart() {

  const ctx = document.getElementById("mainChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Agendamentos"],
      datasets: [{
        label: "Total",
        data: [currentUser.schedules.length],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

render();
}