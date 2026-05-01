// Settings View Logic
function initSettingsView() {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                return showAlert('New passwords do not match!', 'error');
            }

            if (newPassword.length < 6) {
                return showAlert('New password must be at least 6 characters.', 'error');
            }

            const btn = document.getElementById('settingsSubmitBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Updating Credentials...';
            btn.disabled = true;

            try {
                const res = await fetchAPI('/api/auth/change-password', 'POST', {
                    currentPassword,
                    newPassword
                });
                showAlert(res.message || 'Vault credentials updated securely!', 'success');
                document.getElementById('settingsForm').reset();
            } catch (err) {
                showAlert(err.message || 'Failed to update credentials', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Populate username from app context
    fetchAPI('/api/auth/me').then(res => {
        const settingsUsername = document.getElementById('settingsUsername');
        if (settingsUsername) settingsUsername.textContent = res.username;
        // The main dashboard.js already sets the top userDisplay
    }).catch(console.error);
}
