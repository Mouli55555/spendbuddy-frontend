// Tab switching functionality
function switchTab(tabName) {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tabName + 'Form').classList.add('active');

    hideAlert();
}

// Alert functionality
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.style.display = 'block';
    
    // Auto hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(hideAlert, 3000);
    }
}

function hideAlert() {
    const alert = document.getElementById('alert');
    alert.style.display = 'none';
}

// Loading state management
function setButtonLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.textContent = button.textContent.includes('Sign In') ? 'Signing In...' : 'Creating Account...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Form validation
function validateSignupForm(formData) {
    const errors = [];
    
    if (!formData.username || formData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.password || formData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
}

function validateSigninForm(formData) {
    const errors = [];
    
    if (!formData.username) {
        errors.push('Username is required');
    }
    
    if (!formData.password) {
        errors.push('Password is required');
    }
    
    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sign In Form Handler
document.getElementById('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('.submit-btn');
    const originalText = btn.textContent;
    
    try {
        // Get form data
        const formData = new FormData(e.target);
        const credentials = {
            username: formData.get('username').trim(),
            password: formData.get('password')
        };

        // Validate form
        const validationErrors = validateSigninForm(credentials);
        if (validationErrors.length > 0) {
            showAlert(validationErrors.join('. '), 'error');
            return;
        }

        // Set loading state
        setButtonLoading(btn, true, originalText);
        hideAlert();

        // Call API using the new service layer
        const result = await api.signIn(credentials);

        if (result.success) {
            // Success - show message and redirect
            showAlert(CONFIG.MESSAGES.SUCCESS_SIGNIN, 'success');
            
            // Log the successful signin
            CONFIG.utils.log('info', `User ${credentials.username} signed in successfully`);
            
            // Preload essential data for dashboard
            await api.preloadData();
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '../Components/dashboard.html';
            }, 1500);


            
        } else {
            // Show error message
            showAlert(result.error, 'error');
            CONFIG.utils.log('error', 'Signin failed', result.error);
        }

    } catch (error) {
        // Handle unexpected errors
        CONFIG.utils.log('error', 'Signin error', error);
        showAlert(CONFIG.MESSAGES.NETWORK_ERROR, 'error');
    } finally {
        // Reset loading state
        setButtonLoading(btn, false, originalText);
    }
});

// Sign Up Form Handler
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('.submit-btn');
    const originalText = btn.textContent;
    
    try {
        // Get form data
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password')
        };

        // Validate form
        const validationErrors = validateSignupForm(userData);
        if (validationErrors.length > 0) {
            showAlert(validationErrors.join('. '), 'error');
            return;
        }

        // Set loading state
        setButtonLoading(btn, true, originalText);
        hideAlert();

        // Call API using the new service layer
        const result = await api.signUp(userData);

        if (result.success) {
            // Success - show message and switch to signin
            showAlert(CONFIG.MESSAGES.SUCCESS_SIGNUP, 'success');
            
            // Log the successful signup
            CONFIG.utils.log('info', `New user ${userData.username} signed up successfully`);
            
            // Reset form and switch to signin after delay
            setTimeout(() => {
                e.target.reset();
                switchTabProgrammatically('signin');
            }, 2000);
            
        } else {
            // Show error message
            showAlert(result.error, 'error');
            CONFIG.utils.log('error', 'Signup failed', result.error);
        }

    } catch (error) {
        // Handle unexpected errors
        CONFIG.utils.log('error', 'Signup error', error);
        showAlert(CONFIG.MESSAGES.NETWORK_ERROR, 'error');
    } finally {
        // Reset loading state
        setButtonLoading(btn, false, originalText);
    }
});

// Programmatic tab switching (without event)
function switchTabProgrammatically(tabName) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to target tab and form
    const targetTab = Array.from(document.querySelectorAll('.auth-tab')).find(tab => 
        tab.textContent.toLowerCase().includes(tabName.toLowerCase())
    );
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    document.getElementById(tabName + 'Form').classList.add('active');
    hideAlert();
}

// Input animations and enhancements
document.querySelectorAll('input').forEach(input => {
    // Focus animations
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
    
    // Real-time validation feedback
    input.addEventListener('input', () => {
        // Remove any previous error styling
        input.style.borderColor = '';
        
        // Hide alert on input change
        if (document.getElementById('alert').style.display === 'block') {
            setTimeout(hideAlert, 100);
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + S for signup tab
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        switchTabProgrammatically('signup');
    }
    
    // Alt + I for signin tab
    if (e.altKey && e.key === 'i') {
        e.preventDefault();
        switchTabProgrammatically('signin');
    }
    
    // ESC to hide alerts
    if (e.key === 'Escape') {
        hideAlert();
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    CONFIG.utils.log('info', 'Auth page initialized');
    
    // Check if user is already logged in
    if (api.isAuthenticated()) {
        CONFIG.utils.log('info', 'User already authenticated, redirecting to dashboard');
        window.location.href = '../Components/dashboard.html';
        return;
    }
    
    // Focus first input field
    const firstInput = document.querySelector('#signinForm input[type="text"]');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 500);
    }
    
    // Add some visual feedback
    console.log(`%c🚀 ${CONFIG.APP.NAME} v${CONFIG.APP.VERSION} - Authentication Ready`, 
                'color: #667eea; font-size: 14px; font-weight: bold;');
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateSigninForm,
        validateSignupForm,
        isValidEmail,
        switchTabProgrammatically
    };
}