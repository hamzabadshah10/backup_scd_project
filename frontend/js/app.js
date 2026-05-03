// Base API URL (assuming backend runs on 8080)
const API_BASE = 'http://localhost:8080';

// Global Fetch wrapper for JSON
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const config = {
        method,
        headers: {},
        credentials: 'include' // VERY IMPORTANT FOR SESSIONS
    };

    if (body) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        // Handle 401 Unauthorized globally
        if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/me')) {
            window.location.href = 'index.html';
            return null;
        }

        const data = await response.json().catch(() => null);
        
        if (!response.ok) {
            return { error: data?.error || 'An error occurred' };
        }
        
        return data;
    } catch (error) {
        return { error: 'Network error or CORS issue. Ensure backend is running.' };
    }
}

// Alert utility with premium styling
function showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alertBox');
    if(!alertBox) return;
    
    let icon = '';
    let classes = '';
    
    if(type === 'error') {
        icon = `<svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
        classes = 'border-red-500/50 text-red-400 bg-red-950/30';
    } else if(type === 'success') {
        icon = `<svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        classes = 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30';
    } else {
        icon = `<svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        classes = 'border-blue-500/50 text-blue-400 bg-blue-950/30';
    }

    alertBox.innerHTML = `
        <div class="flex items-start">
            ${icon}
            <div class="flex-1">${message}</div>
        </div>
    `;
    
    alertBox.className = `mb-8 p-5 rounded-[1.5rem] text-sm border font-fira relative z-10 backdrop-blur-md transition-all duration-300 ${classes}`;
    alertBox.classList.remove('hidden');
    
    // Auto-scroll to top if alert is triggered
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAlert() {
    const alertBox = document.getElementById('alertBox');
    if(alertBox) alertBox.classList.add('hidden');
}

// Check session
async function checkAuthStatus() {
    const res = await fetchAPI('/api/auth/me');
    return !res?.error && res?.username;
}
