// Core Dashboard & SPA Routing Logic

// Init
checkAuthStatus().then(isLoggedIn => {
    if (!isLoggedIn) window.location.href = 'index.html';
    else {
        fetchAPI('/api/auth/me').then(res => {
            document.getElementById('userDisplay').textContent = res.username;
            // Update initial avatar letter
            document.querySelectorAll('.rounded-full.bg-blue-600').forEach(el => {
                el.textContent = res.username.charAt(0).toUpperCase();
            });
        });

        // Load default view (dashboard)
        loadView('dashboard');
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetchAPI('/api/auth/logout', 'POST');
    window.location.href = 'index.html';
});

// SPA Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const viewContainer = document.getElementById('views-container');
const pageTitle = document.getElementById('pageTitle');
const pageDesc = document.getElementById('pageDesc');
const viewCache = {};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active classes from all
        navItems.forEach(nav => {
            nav.classList.remove('active', 'bg-blue-600/10', 'border-blue-500/20', 'text-blue-400', 'shadow-[0_0_20px_rgba(37,99,235,0.1)]');
            nav.classList.add('text-gray-500', 'border-transparent');
        });

        // Add active class to clicked
        item.classList.add('active', 'bg-blue-600/10', 'border-blue-500/20', 'text-blue-400', 'shadow-[0_0_20px_rgba(37,99,235,0.1)]');
        item.classList.remove('text-gray-500', 'border-transparent');

        // Update headers
        pageTitle.textContent = item.dataset.title;
        pageDesc.textContent = item.dataset.desc;

        // Extract view name from data-target (e.g., "view-dashboard" -> "dashboard")
        const viewName = item.dataset.target.replace('view-', '');

        // Load view
        loadView(viewName);
    });
});

async function loadView(viewName) {
    const fileName = viewName;

    if (!viewCache[fileName]) {
        try {
            const response = await fetch(`views/${fileName}.html`);
            if (!response.ok) throw new Error('View not found');
            viewCache[fileName] = await response.text();
        } catch (error) {
            viewContainer.innerHTML = `<div class="p-8 text-center text-red-500 font-bold">Error loading view: ${fileName}</div>`;
            return;
        }
    }

    // Inject HTML
    viewContainer.innerHTML = viewCache[fileName];

    // Initialize specific view logic based on viewName
    if (viewName === 'dashboard') {
        if (typeof loadFiles === 'function') loadFiles(true); // update overview stats
    } else if (viewName === 'upload-file') {
        if (typeof initUploadView === 'function') initUploadView();
    } else if (viewName === 'my-files') {
        if (typeof initFilesView === 'function') initFilesView();
    } else if (viewName === 'settings') {
        if (typeof initSettingsView === 'function') initSettingsView();
    }
}
