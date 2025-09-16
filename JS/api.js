// SpendBuddy API Service Layer
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.APP.TIMEOUT;
        this.maxRetries = CONFIG.APP.MAX_RETRIES;
    }

    // Get auth token from localStorage
    getAuthToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    // Set auth headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic HTTP request method with retry logic
    async makeRequest(endpoint, options = {}, retryCount = 0) {
        try {
            CONFIG.utils.log('debug', `🚀 Making request to: ${endpoint}`, {
                method: options.method || 'GET',
                headers: this.getHeaders(options.requireAuth !== false)
            });

            const url = `${this.baseURL}${endpoint}`;
            const config = {
                timeout: this.timeout,
                ...options,
                headers: {
                    ...this.getHeaders(options.requireAuth !== false),
                    ...options.headers
                }
            };

            // Log the full request details
            CONFIG.utils.log('debug', `📡 Full request:`, {
                url,
                method: config.method || 'GET',
                headers: config.headers
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            CONFIG.utils.log('debug', `📥 Response status: ${response.status} for ${endpoint}`);

            // Handle different response types
            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data = await response.json();
            CONFIG.utils.log('debug', `✅ Request successful: ${endpoint}`, data);
            return data;

        } catch (error) {
            CONFIG.utils.log('error', `❌ Request failed: ${endpoint}`, error);

            // Retry logic for network errors
            if (retryCount < this.maxRetries && this.shouldRetry(error)) {
                CONFIG.utils.log('warn', `🔄 Retrying request: ${endpoint} (${retryCount + 1}/${this.maxRetries})`);
                await this.delay(1000 * (retryCount + 1)); // Exponential backoff
                return this.makeRequest(endpoint, options, retryCount + 1);
            }

            throw this.handleError(error);
        }
    }

    // Handle error responses
    async handleErrorResponse(response) {
        const error = {
            status: response.status,
            statusText: response.statusText,
            url: response.url
        };

        try {
            const errorData = await response.json();
            error.message = errorData.message || errorData.error || CONFIG.MESSAGES.SERVER_ERROR;
            error.details = errorData;
        } catch (e) {
            error.message = response.statusText || CONFIG.MESSAGES.SERVER_ERROR;
        }

        // Handle specific status codes
        switch (response.status) {
            case 401:
                this.handleUnauthorized();
                error.message = CONFIG.MESSAGES.UNAUTHORIZED;
                break;
            case 400:
                error.message = error.message || CONFIG.MESSAGES.VALIDATION_ERROR;
                break;
            case 500:
                error.message = CONFIG.MESSAGES.SERVER_ERROR;
                break;
        }

        throw error;
    }

    // Handle unauthorized access
    handleUnauthorized() {
        CONFIG.utils.log('warn', 'Unauthorized access - clearing auth data');
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USERNAME);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        
        // Redirect to auth page if not already there
        if (!window.location.pathname.includes('../Components/auth.html')) {
            window.location.href = '../Components/auth.html';
        }
    }

    // Generic error handler
    handleError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timeout');
        }
        if (error.message === 'Failed to fetch') {
            return new Error(CONFIG.MESSAGES.NETWORK_ERROR);
        }
        return error;
    }

    // Check if should retry request
    shouldRetry(error) {
        return error.name === 'AbortError' || 
               error.message === 'Failed to fetch' ||
               (error.status >= 500 && error.status < 600);
    }

    // Delay utility for retries
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Build query parameters
    buildQueryParams(params) {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                searchParams.append(key, params[key]);
            }
        });
        return searchParams.toString();
    }

    // ================================
    // AUTHENTICATION APIs
    // ================================

    async signUp(userData) {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.SIGNUP, {
                method: 'POST',
                body: JSON.stringify(userData),
                requireAuth: false
            });
            
            CONFIG.utils.log('info', 'User signup successful');
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Signup failed' };
        }
    }

    async signIn(credentials) {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.SIGNIN, {
                method: 'POST',
                body: JSON.stringify(credentials),
                requireAuth: false
            });

            if (response.accessToken) {
                // Save JWT
                localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
                // Save username/email
                localStorage.setItem(CONFIG.STORAGE_KEYS.USERNAME, response.username);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response));
            }

            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Signin failed' };
        }
    }

    // ================================
    // CATEGORY APIs
    // ================================

    async createCategory(categoryData) {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.CATEGORIES, {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
            
            CONFIG.utils.log('info', 'Category created successfully');
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to create category' };
        }
    }

    async getCategories() {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.CATEGORIES, {
                method: 'GET'
            });
            
            // Cache categories locally
            localStorage.setItem(CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(response));
            return { success: true, data: response };
        } catch (error) {
            // Try to return cached data on failure
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.CATEGORIES);
            if (cached) {
                CONFIG.utils.log('warn', 'Using cached categories due to API error');
                return { success: true, data: JSON.parse(cached) };
            }
            return { success: false, error: error.message || 'Failed to fetch categories' };
        }
    }

    // ================================
    // SUBCATEGORY APIs
    // ================================

    async createSubCategory(subCategoryData) {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.SUBCATEGORIES, {
                method: 'POST',
                body: JSON.stringify(subCategoryData)
            });
            
            CONFIG.utils.log('info', 'Subcategory created successfully');
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to create subcategory' };
        }
    }

    // ================================
    // PAYMENT TYPE APIs
    // ================================

    async createPaymentType(paymentTypeData) {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.PAYMENT_TYPES, {
                method: 'POST',
                body: JSON.stringify(paymentTypeData)
            });
            
            CONFIG.utils.log('info', 'Payment type created successfully');
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to create payment type' };
        }
    }

    async getPaymentTypes() {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.PAYMENT_TYPES, {
                method: 'GET'
            });
            
            // Cache payment types locally
            localStorage.setItem(CONFIG.STORAGE_KEYS.PAYMENT_TYPES, JSON.stringify(response));
            return { success: true, data: response };
        } catch (error) {
            // Try to return cached data on failure
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.PAYMENT_TYPES);
            if (cached) {
                CONFIG.utils.log('warn', 'Using cached payment types due to API error');
                return { success: true, data: JSON.parse(cached) };
            }
            return { success: false, error: error.message || 'Failed to fetch payment types' };
        }
    }

    // ================================
    // EXPENSE APIs
    // ================================

    async createExpense(expenseData) {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.EXPENSES, {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });
            
            CONFIG.utils.log('info', 'Expense created successfully');
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to create expense' };
        }
    }

    async getExpenses(filters = {}) {
        try {
            let endpoint = CONFIG.API.ENDPOINTS.EXPENSES;
            
            if (Object.keys(filters).length > 0) {
                endpoint += '?' + this.buildQueryParams(filters);
            }

            const response = await this.makeRequest(endpoint, {
                method: 'GET'
            });
            
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch expenses' };
        }
    }

    async getCurrentMonthExpenses() {
        try {
            const response = await this.makeRequest(CONFIG.API.ENDPOINTS.EXPENSES_CURRENT_MONTH, {
                method: 'GET'
            });
            
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch current month expenses' };
        }
    }

    async getExpensesByCategory(categoryId, filters = {}) {
        try {
            let endpoint = `${CONFIG.API.ENDPOINTS.EXPENSES_BY_CATEGORY}/${categoryId}`;
            
            if (Object.keys(filters).length > 0) {
                endpoint += '?' + this.buildQueryParams(filters);
            }

            const response = await this.makeRequest(endpoint, {
                method: 'GET'
            });
            
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch expenses by category' };
        }
    }

    async getCurrentMonthExpensesByCategory(categoryId) {
        try {
            const endpoint = `${CONFIG.API.ENDPOINTS.EXPENSES_BY_CATEGORY_CURRENT_MONTH}/${categoryId}`;
            const response = await this.makeRequest(endpoint, {
                method: 'GET'
            });
            
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch current month expenses by category' };
        }
    }

    // ================================
    // UTILITY METHODS
    // ================================

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getAuthToken();
    }

    // Logout user
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USERNAME);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CATEGORIES);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.PAYMENT_TYPES);
        
        CONFIG.utils.log('info', 'User logged out');
        window.location.href = '../index.html';
    }

    // Get cached data
    getCachedCategories() {
        const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.CATEGORIES);
        return cached ? JSON.parse(cached) : [];
    }

    getCachedPaymentTypes() {
        const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.PAYMENT_TYPES);
        return cached ? JSON.parse(cached) : [];
    }

    // Preload essential data
    async preloadData() {
        try {
            CONFIG.utils.log('info', 'Preloading essential data');
            await Promise.all([
                this.getCategories(),
                this.getPaymentTypes()
            ]);
            CONFIG.utils.log('info', 'Essential data preloaded successfully');
        } catch (error) {
            CONFIG.utils.log('error', 'Failed to preload essential data', error);
        }
    }
}

// Create global API instance
const api = new ApiService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}

// Make available globally
window.api = api;