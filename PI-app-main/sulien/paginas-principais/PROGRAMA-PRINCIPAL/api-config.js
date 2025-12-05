/* ======================================================================
   CONFIGURAÇÃO DA API - SISTEMA LEANDIX/SULIEN (PHP Backend)
   ====================================================================== */

// URL base da API PHP
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';

// ======================================================================
// GERENCIAMENTO DE AUTENTICAÇÃO
// ======================================================================

/**
 * Salva os dados do usuário logado no localStorage
 * @param {Object} userData - Dados do usuário retornados pela API
 */
function saveUserData(userData) {
  localStorage.setItem('sulien_user', JSON.stringify(userData));
}

/**
 * Recupera os dados do usuário logado
 * @returns {Object|null} Dados do usuário ou null se não estiver logado
 */
function getUserData() {
  const userData = localStorage.getItem('sulien_user');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Verifica se o usuário está logado
 * @returns {boolean}
 */
function isUserLoggedIn() {
  return getUserData() !== null;
}

/**
 * Remove os dados do usuário (logout)
 */
function clearUserData() {
  localStorage.removeItem('sulien_user');
}

// ======================================================================
// FUNÇÕES HELPER PARA REQUISIÇÕES HTTP
// ======================================================================

/**
 * Faz uma requisição HTTP para a API PHP
 * @param {string} endpoint - Endpoint da API (ex: '/api/auth.php?action=login')
 * @param {Object} options - Opções da requisição (method, body, etc)
 * @returns {Promise<Object>} Resposta da API
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Importante para enviar cookies de sessão
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // A API PHP retorna { success: true/false, ... }
    if (data && data.success === false) {
      throw new Error(data.message || 'Erro na requisição');
    }

    if (!response.ok && (!data || data.success === undefined)) {
      throw new Error(typeof data === 'string' ? data : 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

/**
 * Requisição GET
 * @param {string} endpoint - Endpoint da API
 * @returns {Promise<Object>}
 */
async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Requisição POST
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a serem enviados
 * @returns {Promise<Object>}
 */
async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Requisição PUT
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a serem enviados
 * @returns {Promise<Object>}
 */
async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Requisição DELETE
 * @param {string} endpoint - Endpoint da API
 * @returns {Promise<Object>}
 */
async function apiDelete(endpoint) {
  return apiRequest(endpoint, {
    method: 'DELETE',
  });
}

// ======================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ======================================================================

/**
 * Fazer login
 * @param {string} ra - RA do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário
 */
async function login(ra, senha) {
  const response = await apiPost('/api/auth.php?action=login', { ra, senha });

  if (response.success && response.user) {
    saveUserData(response.user);
    return response.user;
  }

  throw new Error(response.message || 'Erro ao fazer login');
}

/**
 * Fazer logout
 */
async function logout() {
  try {
    await apiPost('/api/auth.php?action=logout');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    clearUserData();
    window.location.href = '../index-usuario.html';
  }
}

/**
 * Verificar se está autenticado
 */
async function checkAuth() {
  try {
    const response = await apiGet('/api/auth.php?action=check');
    if (response.success && response.user) {
      saveUserData(response.user);
      return response.user;
    }
  } catch (error) {
    clearUserData();
    return null;
  }
}

// ======================================================================
// PROTEÇÃO DE ROTAS
// ======================================================================

/**
 * Redireciona para login se o usuário não estiver autenticado
 * Chame esta função no início das páginas protegidas
 */
function requireAuth() {
  if (!isUserLoggedIn()) {
    window.location.href = '../index-usuario.html';
  }
}

/**
 * Verifica se o usuário é administrador
 */
function isAdmin() {
  const user = getUserData();
  return user && user.tipo === 'administrador';
}

/**
 * Redireciona se não for administrador
 */
function requireAdmin() {
  requireAuth();
  if (!isAdmin()) {
    alert('Acesso negado. Apenas administradores.');
    window.location.href = '../index-usuario.html';
  }
}

// ======================================================================
// FUNÇÕES DE API - USUÁRIOS
// ======================================================================

async function createUser(userData) {
  return await apiPost('/api/users.php?action=create', userData);
}

async function listUsers() {
  const response = await apiGet('/api/users.php?action=list');
  return response.users || [];
}

async function getUser(id) {
  const response = await apiGet(`/api/users.php?action=get&id=${id}`);
  return response.user;
}

async function updateUser(id, userData) {
  return await apiPut(`/api/users.php?action=update&id=${id}`, userData);
}

async function deleteUser(id) {
  return await apiDelete(`/api/users.php?action=delete&id=${id}`);
}

// ======================================================================
// FUNÇÕES DE API - EQUIPAMENTOS
// ======================================================================

async function createEquipment(equipmentData) {
  return await apiPost('/api/equipment.php?action=create', equipmentData);
}

async function listEquipment(status = null) {
  const url = status
    ? `/api/equipment.php?action=list&status=${status}`
    : '/api/equipment.php?action=list';
  const response = await apiGet(url);
  return response.equipments || [];
}

async function getEquipment(id) {
  const response = await apiGet(`/api/equipment.php?action=get&id=${id}`);
  return response.equipment;
}

async function updateEquipment(id, equipmentData) {
  return await apiPut(`/api/equipment.php?action=update&id=${id}`, equipmentData);
}

async function deleteEquipment(id) {
  return await apiDelete(`/api/equipment.php?action=delete&id=${id}`);
}

// ======================================================================
// FUNÇÕES DE API - SALAS
// ======================================================================

async function createRoom(roomData) {
  return await apiPost('/api/rooms.php?action=create', roomData);
}

async function listRooms(status = null) {
  const url = status
    ? `/api/rooms.php?action=list&status=${status}`
    : '/api/rooms.php?action=list';
  const response = await apiGet(url);
  return response.rooms || [];
}

async function getRoom(id) {
  const response = await apiGet(`/api/rooms.php?action=get&id=${id}`);
  return response.room;
}

async function updateRoom(id, roomData) {
  return await apiPut(`/api/rooms.php?action=update&id=${id}`, roomData);
}

async function deleteRoom(id) {
  return await apiDelete(`/api/rooms.php?action=delete&id=${id}`);
}

// ======================================================================
// FUNÇÕES DE API - RESERVAS
// ======================================================================

async function createReservation(reservationData) {
  return await apiPost('/api/reservations.php?action=create', reservationData);
}

async function listReservations() {
  const response = await apiGet('/api/reservations.php?action=list');
  return response.reservations || [];
}

async function listMyReservations() {
  const response = await apiGet('/api/reservations.php?action=my-reservations');
  return response.reservations || [];
}

async function cancelReservation(id) {
  return await apiDelete(`/api/reservations.php?action=cancel&id=${id}`);
}

// ======================================================================
// FUNÇÕES DE API - PERFIL
// ======================================================================

async function getProfile() {
  const response = await apiGet('/api/profile.php?action=get');
  return response.user;
}

async function updatePassword(senhaAtual, senhaNova) {
  return await apiPut('/api/profile.php?action=update-password', {
    senha_atual: senhaAtual,
    senha_nova: senhaNova
  });
}

async function updatePhoto(fotoBase64) {
  const response = await apiPut('/api/profile.php?action=update-photo', {
    foto: fotoBase64
  });

  // Atualizar dados do usuário no localStorage
  if (response.success) {
    const user = getUserData();
    if (user) {
      user.foto = response.foto;
      saveUserData(user);
    }
  }

  return response;
}

// ======================================================================
// UTILITÁRIOS
// ======================================================================

/**
 * Converte arquivo para Base64
 * @param {File} file - Arquivo a ser convertido
 * @returns {Promise<string>} String Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Formata data para exibição
 * @param {string} dateString - Data em formato ISO
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
