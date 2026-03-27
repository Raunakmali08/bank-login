const API_BASE = 'http://localhost:3000';

function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alert-box');
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
}

function hideAlert() {
    const alertBox = document.getElementById('alert-box');
    if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.className = 'alert';
    }
}

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw { status: response.status, data };
        }
        
        return data;
    } catch (error) {
        if (error.status === 401 && !options.skipAuthRedirect) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
        throw error;
    }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    let currentFingerprint = null;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                skipAuthRedirect: true
            });
            
            localStorage.setItem('token', data.access_token);
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            if (error.status === 403 && error.data && error.data.detail && error.data.detail.fingerprint) {
                showAlert('Unrecognized device prevented login. Please approve this device.', 'error');
                const approvalSec = document.getElementById('approval-section');
                const fpDisplay = document.getElementById('fingerprint-display');
                if (approvalSec && fpDisplay) {
                    approvalSec.style.display = 'block';
                    fpDisplay.textContent = error.data.detail.fingerprint;
                    currentFingerprint = error.data.detail.fingerprint;
                }
            } else if (error.data && error.data.detail) {
                const msg = typeof error.data.detail === 'string' ? error.data.detail : error.data.detail.message;
                showAlert(msg || 'Login failed', 'error');
            } else {
                showAlert('An unexpected error occurred.', 'error');
            }
        }
    });

    const approveBtn = document.getElementById('approve-btn');
    if (approveBtn) {
        approveBtn.addEventListener('click', async () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password || !currentFingerprint) {
                showAlert('Please enter credentials to approve device.', 'error');
                return;
            }

            try {
                await fetchAPI('/auth/devices/approve', {
                    method: 'POST',
                    body: JSON.stringify({
                        username,
                        password,
                        fingerprint: currentFingerprint
                    }),
                    skipAuthRedirect: true
                });
                
                showAlert('Device approved! Logging you in...', 'success');
                
                setTimeout(async () => {
                    loginForm.dispatchEvent(new Event('submit'));
                }, 1000);

            } catch (error) {
                const msg = error.data?.detail?.message || error.data?.detail || 'Approval failed';
                showAlert(msg, 'error');
            }
        });
    }
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm-password').value;
        
        if (password !== confirm) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        try {
            await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            showAlert('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            const msg = error.data?.detail || 'Registration failed';
            showAlert(msg, 'error');
        }
    });
}

async function initDashboard() {
    setupLogout();
    
    try {
        const user = await fetchAPI('/auth/me');
        document.getElementById('user-display-name').textContent = user.username;
        await loadDevices();
    } catch (error) {
        console.error("Failed to load dashboard data", error);
    }
    
    const refreshBtn = document.getElementById('refresh-devices');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDevices);
    }
}

async function loadDevices() {
    const list = document.getElementById('device-list');
    list.innerHTML = '<li class="device-item" style="justify-content: center;">Refreshing...</li>';
    
    try {
        const devices = await fetchAPI('/auth/devices');
        list.innerHTML = '';
        
        if (devices.length === 0) {
            list.innerHTML = '<li class="device-item" style="justify-content: center;">No devices found.</li>';
            return;
        }

        devices.forEach(device => {
            const li = document.createElement('li');
            li.className = 'device-item';
            
            const date = new Date(device.created_at).toLocaleString();
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'device-info';
            infoDiv.innerHTML = `
                <h4>Device ${device.is_trusted ? '<span class="badge">Trusted</span>' : ''}</h4>
                <p>FP: ${device.fingerprint}</p>
                <p style="color: #a0aec0; margin-top: 4px;">Added on ${date}</p>
            `;
            
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-danger';
            delBtn.textContent = 'Revoke Access';
            delBtn.onclick = () => deleteDevice(device.id);
            
            li.appendChild(infoDiv);
            li.appendChild(delBtn);
            list.appendChild(li);
        });
        
    } catch (error) {
        list.innerHTML = '<li class="device-item" style="justify-content: center; color: var(--error-color);">Failed to load devices.</li>';
    }
}

async function deleteDevice(id) {
    if (!confirm('Are you sure you want to revoke access for this device? It will be blocked on next login attempt.')) return;
    
    try {
        await fetchAPI(`/auth/devices/${id}`, { method: 'DELETE' });
        await loadDevices();
    } catch (error) {
        const msg = error.data?.detail || 'Failed to remove device';
        alert(msg);
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
}
