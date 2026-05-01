// Files View Logic
function initFilesView() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadFiles);
    }
    loadFiles();
}

async function loadFiles(updateStatsOnly = false) {
    try {
        const files = await fetchAPI('/api/files');
        const container = document.getElementById('filesContainer');

        if (!files || files.length === 0) {
            if (container) {
                container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-32 text-gray-600">
                    <div class="w-20 h-20 rounded-3xl bg-slate-800/50 border border-white/5 flex items-center justify-center mb-6">
                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4"></path></svg>
                    </div>
                    <p class="font-space text-lg font-bold">No assets found in vault.</p>
                    <p class="text-sm">Start by uploading your first secure file.</p>
                </div>`;
            }
            updateStats(0, 0, 0);
            return;
        }

        let totalSize = 0;

        if (container && !updateStatsOnly) {
            container.innerHTML = files.map(f => {
                const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
                totalSize += f.size;
                const dateObj = new Date(f.uploadDate);
                const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const baseUrl = window.location.origin + window.location.pathname.replace('home.html', '');
                const url = `${baseUrl}download.html?link=${f.shareLink}`;

                let iconColor = f.passwordHash ? 'text-purple-400 bg-purple-600/10 border-purple-500/20' : 'text-blue-400 bg-blue-600/10 border-blue-500/20';
                let badges = '';
                if (f.oneTime) badges += `<span class="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase mr-2 font-fira tracking-wider" title="Self-Destruct">1X-Only</span>`;
                if (f.expiresAt) badges += `<span class="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase mr-2 font-fira tracking-wider" title="24-Hour Expiry">24H-TTL</span>`;

                return `
                <div class="grid grid-cols-12 gap-6 px-6 py-5 items-center rounded-2xl bg-slate-900/30 border border-white/5 hover:border-blue-500/30 hover:bg-slate-900/60 transition-all group">
                    <div class="col-span-5 flex items-center gap-4 overflow-hidden">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center border ${iconColor} shadow-inner transition-all group-hover:scale-110">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div class="truncate">
                            <p class="text-sm text-gray-100 font-bold truncate group-hover:text-blue-400 transition-colors" title="${f.originalName}">${f.originalName}</p>
                            <div class="mt-1.5 flex items-center">${badges}</div>
                        </div>
                    </div>
                    <div class="col-span-2 text-sm text-gray-500 font-fira">${sizeMB} MB</div>
                    <div class="col-span-2 text-sm text-gray-500 font-fira">${dateStr}</div>
                    <div class="col-span-3 flex items-center justify-end gap-3 transition-all">
                        <button onclick="copyLink('${url}')" class="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            <span class="hidden xl:inline">Copy Link</span>
                        </button>
                        <button onclick="revokeAccess(${f.id})" class="flex items-center justify-center w-11 h-11 text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="Purge Asset">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>`;
            }).join('');
        } else {
            files.forEach(f => { totalSize += f.size; });
        }

        updateStats(files.length, totalSize, files.length);

    } catch (err) {
        showAlert('Failed to synchronize vault: ' + err.message, 'error');
    }
}

function updateStats(totalFiles, totalSizeBytes, activeLinks) {
    const totalFilesEl = document.getElementById('statTotalFiles');
    if (totalFilesEl) totalFilesEl.textContent = totalFiles;
    
    const activeLinksEl = document.getElementById('statActiveLinks');
    if (activeLinksEl) activeLinksEl.textContent = activeLinks;
    
    const storageUsedEl = document.getElementById('statStorageUsed');
    if (storageUsedEl) {
        const sizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
        storageUsedEl.textContent = sizeMB;
    }
}

async function revokeAccess(id) {
    if (!confirm('Permanent Purge Request: Are you sure you want to delete this asset?')) return;
    try {
        await fetchAPI(`/api/files/${id}`, 'DELETE');
        showAlert('Asset purged from vault successfully', 'success');
        loadFiles();
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

async function copyLink(text) {
    try {
        await navigator.clipboard.writeText(text);
        showAlert('Secure link copied to clipboard!', 'success');
    } catch (err) {
        showAlert('Handshake failed: Could not copy', 'error');
    }
}
