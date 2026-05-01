// Upload View Logic
function initUploadView() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');

    if (fileInput && dropZone) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelection(e.target.files);
            }
        });

        // Drag & Drop Event Listeners
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('border-blue-400', 'bg-blue-600/10', 'scale-[1.01]');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('border-blue-400', 'bg-blue-600/10', 'scale-[1.01]');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                fileInput.files = files;
                handleFileSelection(files);
            }
        }, false);
    }

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
}

function handleFileSelection(files) {
    if (files.length > 0) {
        const file = files[0];
        const fileInput = document.getElementById('fileInput');
        if (file.size > 20 * 1024 * 1024) {
            showAlert('Payload exceeds 20MB security limit', 'error');
            fileInput.value = '';
            document.getElementById('fileNameDisplay').textContent = 'Max File Size: 20MB';
        } else {
            document.getElementById('fileNameDisplay').textContent = file.name;
            document.getElementById('fileNameDisplay').classList.add('text-blue-200', 'border-blue-400/50', 'bg-blue-600/20');
            
            runSimulatedProgress();
        }
    }
}

function runSimulatedProgress() {
    const progressContainer = document.getElementById('inlineProgressContainer');
    const progressBar = document.getElementById('inlineProgressBar');
    const percentageText = document.getElementById('inlinePercentage');
    const statusText = document.getElementById('inlineStatusText');
    
    progressContainer.classList.remove('hidden');
    statusText.textContent = 'Scanning & Encrypting...';
    
    let progress = 0;
    progressBar.style.width = '0%';
    percentageText.textContent = '0%';
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            statusText.textContent = 'Ready for Secure Vaulting';
            progressBar.style.width = '100%';
            percentageText.textContent = '100%';
            
            setTimeout(() => {}, 1000);
        } else {
            progressBar.style.width = progress + '%';
            percentageText.textContent = Math.round(progress) + '%';
        }
    }, 100);
}

async function handleUploadSubmit(e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return showAlert('Select an asset to encrypt first', 'error');

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const password = document.getElementById('filePassword').value;
    if (password) formData.append('password', password);

    formData.append('isOneTime', document.getElementById('isOneTime').checked);
    formData.append('is24Hour', document.getElementById('is24Hour').checked);

    const btn = document.getElementById('uploadBtn');
    const originalContent = btn.innerHTML;
    
    const progressContainer = document.getElementById('inlineProgressContainer');
    const progressBar = document.getElementById('inlineProgressBar');
    const percentageText = document.getElementById('inlinePercentage');
    const statusText = document.getElementById('inlineStatusText');

    btn.innerHTML = `<svg class="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> EXECUTING ENCRYPTION...`;
    btn.disabled = true;
    
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    percentageText.textContent = '0%';
    statusText.textContent = 'Uploading to Secure Vault...';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/files/upload`, true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressBar.style.width = percentComplete + '%';
            percentageText.textContent = percentComplete + '%';

            if (percentComplete < 30) statusText.textContent = 'Encrypting...';
            else if (percentComplete < 60) statusText.textContent = 'Vaulting...';
            else if (percentComplete < 90) statusText.textContent = 'Securing...';
            else statusText.textContent = 'Finalizing...';
        }
    };

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            progressBar.style.width = '100%';
            percentageText.textContent = '100%';
            statusText.textContent = 'Completed';
            
            setTimeout(() => {
                showAlert('Data Encrypted & Vaulted Successfully!', 'success');
                document.getElementById('uploadForm').reset();
                document.getElementById('fileNameDisplay').textContent = 'Max File Size: 20MB';
                document.getElementById('fileNameDisplay').classList.remove('text-blue-200', 'border-blue-400/50', 'bg-blue-600/20');
                
                progressContainer.classList.add('hidden');
                progressBar.style.width = '0%';
                percentageText.textContent = '0%';
                btn.innerHTML = originalContent;
                btn.disabled = false;

                if(typeof loadFiles === 'function') loadFiles();
                setTimeout(() => {
                    document.querySelector('[data-target="view-my-files"]').click();
                }, 1000);
            }, 800);
        } else {
            showAlert(xhr.responseText || 'Encryption failed', 'error');
            resetUploadState();
        }
    };

    xhr.onerror = () => {
        showAlert('Network error or secure handshake failed.', 'error');
        resetUploadState();
    };

    function resetUploadState() {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        progressContainer.classList.add('hidden');
    }

    xhr.send(formData);
}
