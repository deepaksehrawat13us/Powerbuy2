/**
 * API Configuration for PowerBuy Application
 * Central configuration for API endpoints and authentication
 */

const API_CONFIG = {
    // Base URL for the PowerBuy API
    baseURL: 'https://anazmandi.com/api/v1',
    
    // Endpoints
    endpoints: {
        // Authentication
        register: '/users/register',
        sendLoginOTP: '/users/send-login-otp',
        authenticate: '/users/authenticate',
        refreshToken: '/users/refresh-token',
        logout: '/users/logout',
        getCurrentUser: '/users/me',
        
        // Users
        getUserById: '/users',
        getUserProfile: '/users',
        updateUser: '/users',
        
        // Pools (PowerBuys)
        getAllPools: '/pools',
        getActivePools: '/pools/active',
        getPoolById: '/pools',
        getPoolStats: '/pools',
        
        // Participants
        joinPool: '/participants/join',
        getUserParticipations: '/participants/user',
        getUserParticipationStats: '/participants/user',
        leavePool: '/participants',
        checkParticipation: '/participants/check',
        
        // Brands & Categories (for future use)
        brands: '/brands',
        categories: '/categories',
        phones: '/phones',
        cars: '/cars',
        
        // Contact
        contact: '/contact-us'
    }
};

/**
 * Helper function to get the full API URL
 * @param {string} endpoint - The endpoint path
 * @returns {string} Full URL
 */
function getApiUrl(endpoint) {
    return `${API_CONFIG.baseURL}${endpoint}`;
}

/**
 * Helper function to get auth headers
 * @returns {object} Headers object with Authorization
 */
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

/**
 * Helper function to make authenticated API calls
 * @param {string} url - The API URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function apiCall(url, options = {}) {
    console.log('🔵 apiCall() called');
    console.log('  URL:', url);
    console.log('  Options:', options);
    console.log('  Current localStorage:', {
        hasUser: !!localStorage.getItem('powerbuyUser'),
        hasAccessToken: !!localStorage.getItem('accessToken'),
        hasRefreshToken: !!localStorage.getItem('refreshToken'),
        accessToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...'
    });
    
    // Properly merge headers - don't let options.headers overwrite Authorization
    const authHeaders = getAuthHeaders();
    const defaultOptions = {
        ...options,
        headers: {
            ...authHeaders,
            ...(options.headers || {})
        }
    };
    
    console.log('  Auth headers:', authHeaders);
    console.log('  Options headers:', options.headers);
    console.log('  Final merged headers:', defaultOptions.headers);
    
    try {
        const response = await fetch(url, defaultOptions);
        console.log('  Response status:', response.status);
        
        // Handle token expiration (401)
        if (response.status === 401) {
            console.log('⚠️ Got 401 Unauthorized, attempting token refresh...');
            // Try to refresh token
            const refreshed = await refreshAuthToken();
            if (refreshed) {
                console.log('✅ Token refreshed successfully, retrying request...');
                // Retry the original request with new token
                defaultOptions.headers = getAuthHeaders();
                return await fetch(url, defaultOptions);
            } else {
                console.error('❌ Token refresh failed, logging out user');
                // Refresh failed, logout user
                clearUserSession();
                window.location.href = '/signin.html';
                throw new Error('Session expired. Please login again.');
            }
        }
        
        return response;
    } catch (error) {
        console.error('❌ API call error in config.js:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw error;
    }
}

/**
 * Refresh the access token using refresh token
 * @returns {Promise<boolean>} True if refresh successful
 */
async function refreshAuthToken() {
    console.log('🔄 refreshAuthToken() called');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.error('❌ No refresh token found in localStorage');
        return false;
    }
    
    console.log('  Refresh token exists:', refreshToken.substring(0, 20) + '...');
    
    try {
        const refreshUrl = getApiUrl(API_CONFIG.endpoints.refreshToken);
        console.log('  Calling refresh endpoint:', refreshUrl);
        
        const response = await fetch(refreshUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        console.log('  Refresh response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('  Refresh result:', result);
            if (result.data && result.data.access_token) {
                localStorage.setItem('accessToken', result.data.access_token);
                console.log('✅ New access token saved');
                return true;
            }
        }
        console.error('❌ Refresh failed - response not ok or no access_token in response');
        return false;
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        return false;
    }
}

/**
 * Save authentication tokens
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
function saveAuthTokens(accessToken, refreshToken) {
    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }
}

/**
 * Get current access token
 * @returns {string|null}
 */
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

/**
 * Clear all authentication data
 */
function clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('powerbuyUser');
    localStorage.removeItem('userId');
}

console.log('config.js loaded successfully');
