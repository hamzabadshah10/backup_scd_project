checkAuthStatus().then(isLoggedIn => {
    if(isLoggedIn) window.location.href = 'home.html';
});

// Load remembered username
document.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('secureFile_username');
    if (savedUsername) {
        document.getElementById('loginUsername').value = savedUsername;
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe) rememberMe.checked = true;
    }
});

const toggleForms = (showRegister) => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const formTitle = document.getElementById('formTitle');
    
    if (showRegister) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        formTitle.textContent = 'Create an Account';
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        formTitle.textContent = 'Login to Your Account';
    }
    hideAlert();
};

document.getElementById('showRegisterBtn').addEventListener('click', (e) => { e.preventDefault(); toggleForms(true); });
document.getElementById('showLoginBtn').addEventListener('click', (e) => { e.preventDefault(); toggleForms(false); });

const focusLogin = () => { toggleForms(false); document.getElementById('loginUsername').focus(); };
document.getElementById('navLoginBtn').addEventListener('click', focusLogin);
document.getElementById('heroLoginBtn').addEventListener('click', focusLogin);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Authenticating...`;
    
    try {
        const res = await fetchAPI('/api/auth/login', 'POST', {
            username: document.getElementById('loginUsername').value, 
            password: document.getElementById('loginPassword').value
        });
        if(res.error) throw new Error(res.error);
        
        // Handle Remember Me
        if (document.getElementById('rememberMe') && document.getElementById('rememberMe').checked) {
            localStorage.setItem('secureFile_username', document.getElementById('loginUsername').value);
        } else {
            localStorage.removeItem('secureFile_username');
        }

        window.location.href = 'home.html';
    } catch (err) {
        showAlert(err.message, 'error');
        btn.innerHTML = `<span>Log In</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`;
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Registering...`;
    
    try {
        const res = await fetchAPI('/api/auth/register', 'POST', {
            username: document.getElementById('regUsername').value, 
            password: document.getElementById('regPassword').value
        });
        if(res.error) throw new Error(res.error);
        showAlert('Registration successful. Please log in.', 'success');
        toggleForms(false);
    } catch (err) {
        showAlert(err.message, 'error');
        btn.innerHTML = `<span>Register Account</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>`;
    }
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('.eye-icon');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`;
        } else {
            input.type = 'password';
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
        }
    });
});
