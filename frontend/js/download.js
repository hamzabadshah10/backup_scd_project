const urlParams = new URLSearchParams(window.location.search);
const link = urlParams.get('link');

if (!link) {
    showAlert('Missing secure share link. Operation aborted.', 'error');
    document.getElementById('downloadBtn').disabled = true;
    document.getElementById('downloadBtn').classList.add('opacity-50', 'cursor-not-allowed');
} else {
    initDownloadPage();
}

async function initDownloadPage() {
    try {
        const res = await fetch(`${API_BASE}/api/files/info/${link}`);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Secure link expired or invalid.');
        }
        const info = await res.json();
        
        document.getElementById('fileInfo').classList.remove('hidden');
        document.getElementById('fileName').textContent = info.originalName;
        document.getElementById('fileSize').textContent = (info.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        if (info.isPasswordProtected) {
            document.getElementById('passwordField').classList.remove('hidden');
        }
    } catch (err) {
        showAlert(err.message, 'error');
        document.getElementById('fileInfo').classList.add('hidden');
        document.getElementById('downloadForm').classList.add('hidden');
    }
}

document.getElementById('downloadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('accessPassword').value;
    const btn = document.getElementById('downloadBtn');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = `<svg class="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> DECRYPTING PAYLOAD...`;
    btn.disabled = true;

    try {
        const downloadUrl = `${API_BASE}/api/files/download/${link}${password ? '?password=' + encodeURIComponent(password) : ''}`;
        
        const res = await fetch(downloadUrl);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Decryption failed. Verify your access key.');
        }

        // Check content disposition to get original filename
        const disposition = res.headers.get('Content-Disposition');
        let filename = 'secure_asset_decrypted';
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        showAlert('Decryption successful. Asset downloaded.', 'success');
    } catch (err) {
        showAlert(err.message, 'error');
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
});
