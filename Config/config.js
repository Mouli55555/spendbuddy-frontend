// Configuration file for SpendBuddy application
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:9001',
        ENDPOINTS: {
            // Authentication
            SIGNUP: '/api/auth/signup',
            SIGNIN: '/api/auth/signin',
            
            // Categories
            CATEGORIES: '/api/category',
            
            // Subcategories
            SUBCATEGORIES: '/api/subcategory',
            
            // Payment Types
            PAYMENT_TYPES: '/api/paymenttype',
            
            // Expenses
            EXPENSES: '/api/expense',
            EXPENSES_CURRENT_MONTH: '/api/expense/currentmonth',
            EXPENSES_BY_CATEGORY: '/api/expense/category',
            EXPENSES_BY_CATEGORY_CURRENT_MONTH: '/api/expense/currentmonth/category'
        }
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USERNAME: 'username',
        USER_DATA: 'userData',
        CATEGORIES: 'categories',
        PAYMENT_TYPES: 'paymentTypes'
    },

    // App Configuration
    APP: {
        NAME: 'SpendBuddy',
        VERSION: '1.0.0',
        TIMEOUT: 30000, // 30 seconds
        MAX_RETRIES: 3
    },

    // UI Configuration
    UI: {
        ITEMS_PER_PAGE: 10,
        CHART_COLORS: [
            '#667eea', '#764ba2', '#4ade80', '#22d3ee', 
            '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
        ],
        DATE_FORMAT: 'YYYY-MM-DD',
        CURRENCY_SYMBOL: '₹'
    },

    // Error Messages
    MESSAGES: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        UNAUTHORIZED: 'Session expired. Please login again.',
        SERVER_ERROR: 'Server error. Please try again later.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        SUCCESS_SIGNUP: 'Account created successfully!',
        SUCCESS_SIGNIN: 'Welcome back!',
        SUCCESS_EXPENSE_ADDED: 'Expense added successfully!',
        SUCCESS_CATEGORY_ADDED: 'Category added successfully!'
    }
};

// Environment-specific configurations
const ENVIRONMENTS = {
    development: {
        API_BASE_URL: 'http://localhost:9001',
        DEBUG: true,
        LOG_LEVEL: 'debug'
    },
    production: {
        API_BASE_URL: 'https://spendbuddy-backend-api.onrender.com',
        DEBUG: false,
        LOG_LEVEL: 'error'
    }
};

// Get current environment (defaults to development)
const getCurrentEnvironment = () => {
    // Check for manual environment override (useful for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const envOverride = urlParams.get('env') || localStorage.getItem('forceEnv');
    if (envOverride && (envOverride === 'development' || envOverride === 'production')) {
        console.log('🔧 Environment override detected:', envOverride);
        return envOverride;
    }
    
    const hostname = window.location.hostname;
    const port = window.location.port;
    console.log('🌐 Current hostname:', hostname, 'Port:', port); // Debug log
    
    // More comprehensive localhost detection
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.endsWith('.local') ||
        port !== '') {
        console.log('🏠 Detected as DEVELOPMENT environment');
        return 'development';
    }
    console.log('🌍 Detected as PRODUCTION environment');
    return 'production';
};

// Merge environment-specific config
const currentEnv = getCurrentEnvironment();
console.log('🔍 Detected environment:', currentEnv); // Debug log

// TEMPORARY: Force production for testing
const forceProduction = true; // Set to false to use auto-detection
const finalEnv = forceProduction ? 'production' : currentEnv;

CONFIG.ENV = ENVIRONMENTS[finalEnv];
CONFIG.API.BASE_URL = CONFIG.ENV.API_BASE_URL;
console.log('🚀 Final environment:', finalEnv);
console.log('🌐 Using API Base URL:', CONFIG.API.BASE_URL); // Debug log

// Utility functions
CONFIG.utils = {
    // Format currency
    formatCurrency: (amount) => {
        return `${CONFIG.UI.CURRENCY_SYMBOL}${parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },
    
    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-IN');
    },
    
    // Get current date in API format
    getCurrentDate: () => {
        return new Date().toISOString().split('T')[0];
    },
    
    // Get start of current month
    getCurrentMonthStart: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    },
    
    // Get end of current month
    getCurrentMonthEnd: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    },
    
    // Log function with environment awareness
    log: (level, message, data = null) => {
        if (!CONFIG.ENV.DEBUG && level === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch (level) {
            case 'error':
                console.error(logMessage, data);
                break;
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'debug':
                console.debug(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;