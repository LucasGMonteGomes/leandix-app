/* ======================================================================
   CONFIGURAÇÃO DA API - SISTEMA LEANDIX/SULIEN
   ====================================================================== */

// URL base da API (ajuste conforme necessário)
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
    // Also save token separately for easier access if needed, though helper uses sulien_user
    if (userData.token) {
        localStorage.setItem('token', userData.token);
    }
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
    localStorage.removeItem('token');
}

/**
 * Realiza logout e redireciona para a página de login
 */
function logout() {
    clearUserData();
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/adm/')) {
        window.location.href = '../index-adm.html';
    } else {
        window.location.href = '../index-usuario.html';
    }
}

// ======================================================================
// FUNÇÕES HELPER PARA REQUISIÇÕES HTTP
// ======================================================================

/**
 * Faz uma requisição HTTP para da API
 * @param {string} endpoint - Endpoint da API (ex: '/auth/login')
 * @param {Object} options - Opções da requisição (method, body, etc)
 * @returns {Promise<Object>} Resposta da API
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const userData = getUserData();
    // Tenta pegar o token do objeto userData ou do localStorage direto
    const token = (userData && (userData.token || userData.accessToken)) || localStorage.getItem('token');

    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);

        // Se a resposta não for JSON (ex: string de erro), trata diferente
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            // Se for 401/403, pode ser token expirado
            if (response.status === 401 || response.status === 403) {
                console.warn('Unauthorized access, redirecting to login...');
                // Optional: Auto logout
                // clearUserData();
                // window.location.href = '/index.html';
            }
            throw new Error(typeof data === 'string' ? data : data.message || 'Erro na requisição');
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
// PROTEÇÃO DE ROTAS
// ======================================================================

/**
 * Redireciona para login se o usuário não estiver autenticado
 * Chame esta função no início das páginas protegidas
 */
function requireAuth() {
    if (!isUserLoggedIn()) {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('/adm/')) {
            window.location.href = '../index-adm.html';
        } else {
            window.location.href = '../index-usuario.html';
        }
    }
}
