// URL base del backend (ajusta si cambias puerto o deploy)
const API_BASE = 'http://localhost:3000/api/auth';

// --- Elementos DOM
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');

const btnShowLogin = document.getElementById('btn-show-login');
const btnShowRegister = document.getElementById('btn-show-register');
const btnLogout = document.getElementById('btn-logout');

const messagesEl = document.getElementById('messages');

const loginForm = document.getElementById('login-form');
const regForm = document.getElementById('register-form');

const userNameEl = document.getElementById('user-name');
const userTokenEl = document.getElementById('user-token');
const protectedDataEl = document.getElementById('protected-data');
const btnRefresh = document.getElementById('btn-refresh');

// --- Navegación simple
btnShowLogin.addEventListener('click', () => showSection('login'));
btnShowRegister.addEventListener('click', () => showSection('register'));

// Logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  showMessage('Sesión cerrada', 'info');
  renderUI();
  showSection('login');
});

// Manejo de formularios
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();
  const usuario = document.getElementById('login-usuario').value.trim();
  const contraseña = document.getElementById('login-contraseña').value;

  if (!usuario || !contraseña) {
    showMessage('Usuario y contraseña son requeridos', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contraseña })
    });

    const data = await res.json();

    if (!res.ok) {
      const err = data.error || 'Error en autenticación';
      showMessage(err, 'error');
      return;
    }

    // Guardar token y usuario
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', data.usuario);
    showMessage(data.mensaje || 'Autenticación satisfactoria', 'success');
    renderUI();
    showSection('dashboard');
  } catch (error) {
    console.error(error);
    showMessage('No se pudo conectar con el servidor', 'error');
  }
});

regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const usuario = document.getElementById('reg-usuario').value.trim();
  const contraseña = document.getElementById('reg-contraseña').value;
  const contraseña2 = document.getElementById('reg-contraseña2').value;

  if (!usuario || !contraseña || !contraseña2) {
    showMessage('Todos los campos son requeridos', 'error');
    return;
  }

  if (contraseña.length < 6) {
    showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  if (contraseña !== contraseña2) {
    showMessage('Las contraseñas no coinciden', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contraseña })
    });

    const data = await res.json();

    if (!res.ok) {
      const err = data.error || 'Error al registrar usuario';
      showMessage(err, 'error');
      return;
    }

    showMessage(data.mensaje || 'Usuario registrado correctamente', 'success');
    // Autocompletar el login con el usuario creado (opcional)
    document.getElementById('login-usuario').value = usuario;
    document.getElementById('login-contraseña').value = contraseña;
    // Mostrar formulario de login
    showSection('login');
  } catch (error) {
    console.error(error);
    showMessage('No se pudo conectar con el servidor', 'error');
  }
});

// Refrescar datos protegidos (ejemplo de cómo consumir un endpoint protegido)
btnRefresh.addEventListener('click', async () => {
  clearMessages();
  const token = localStorage.getItem('auth_token');
  if (!token) {
    showMessage('No hay token válido', 'error');
    return;
  }

  try {
    // Ejemplo: si tu backend tuviera una ruta protegida, la consumirías así:
    // const res = await fetch('http://localhost:3000/api/protected', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });

    // Aquí solo simulamos una petición protegida con la info del token
    protectedDataEl.textContent = `Simulación: con este token podrías solicitar rutas protegidas. Token válido: ${token.slice(0, 40)}...`;
    showMessage('Datos protegidos actualizados (simulado)', 'info');
  } catch (err) {
    console.error(err);
    showMessage('Error al obtener datos protegidos', 'error');
  }
});

// --- Utilidades de UI
function showSection(name) {
  loginSection.classList.add('hidden');
  registerSection.classList.add('hidden');
  dashboardSection.classList.add('hidden');

  if (name === 'login') loginSection.classList.remove('hidden');
  if (name === 'register') registerSection.classList.remove('hidden');
  if (name === 'dashboard') dashboardSection.classList.remove('hidden');
}

function showMessage(text, type = 'info', timeout = 4500) {
  const div = document.createElement('div');
  div.className = `message ${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  if (timeout) setTimeout(() => div.remove(), timeout);
}

function clearMessages() { messagesEl.innerHTML = ''; }

function renderUI() {
  const token = localStorage.getItem('auth_token');
  const usuario = localStorage.getItem('auth_user');

  if (token && usuario) {
    // Mostrar dashboard
    userNameEl.textContent = usuario;
    userTokenEl.textContent = token;
    btnLogout.classList.remove('hidden');
    btnShowLogin.classList.add('hidden');
    btnShowRegister.classList.add('hidden');
    showSection('dashboard');
  } else {
    // Mostrar login por defecto
    btnLogout.classList.add('hidden');
    btnShowLogin.classList.remove('hidden');
    btnShowRegister.classList.remove('hidden');
    showSection('login');
  }
}

// Ejecutar al cargar
renderUI();
