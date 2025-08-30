// Global state management
let currentUser = null;
let isLoggedIn = false;

// DOM elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const unbanForm = document.getElementById('unbanForm');
const checkForm = document.getElementById('checkForm');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is already logged in (you can add localStorage logic here)
    showLoginPage();
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Hamburger menu
    hamburger.addEventListener('click', toggleSideMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!sideMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeSideMenu();
        }
    });
    
    // Service forms
    unbanForm.addEventListener('submit', handleUnbanSubmit);
    checkForm.addEventListener('submit', handleCheckSubmit);
}

// Page management
function showLoginPage() {
    loginPage.classList.add('active');
    dashboardPage.classList.remove('active');
    isLoggedIn = false;
}

function showDashboardPage() {
    loginPage.classList.remove('active');
    dashboardPage.classList.add('active');
    isLoggedIn = true;
    showSection('unban'); // Show unban section by default
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('Mohon isi username dan password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = username;
            showNotification('Login berhasil! Selamat datang di Joocode Service', 'success');
            setTimeout(() => {
                showDashboardPage();
            }, 1000);
        } else {
            showNotification(data.message || 'Login gagal', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Terjadi kesalahan saat login', 'error');
    }
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    closeSideMenu();
    showNotification('Logout berhasil', 'success');
    setTimeout(() => {
        showLoginPage();
        // Reset forms
        loginForm.reset();
        unbanForm.reset();
        checkForm.reset();
        hideCheckResult();
    }, 1000);
}

// Menu management
function toggleSideMenu() {
    hamburger.classList.toggle('active');
    sideMenu.classList.toggle('active');
}

function closeSideMenu() {
    hamburger.classList.remove('active');
    sideMenu.classList.remove('active');
}

// Section management
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Close side menu
    closeSideMenu();
    
    // Clear forms and results
    if (sectionName === 'check') {
        hideCheckResult();
    }
}

// Unban service
async function handleUnbanSubmit(e) {
    e.preventDefault();
    
    const number = document.getElementById('unbanNumber').value;
    const banType = document.getElementById('banType').value;
    
    if (!number || !banType) {
        showNotification('Mohon isi semua field yang diperlukan', 'error');
        return;
    }
    
    // Validate phone number format
    if (!isValidPhoneNumber(number)) {
        showNotification('Format nomor tidak valid. Gunakan format: +6281234567890', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#unbanForm button[type="submit"]');
    const btnText = document.getElementById('unbanBtnText');
    const loader = document.getElementById('unbanLoader');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/unban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ number, banType })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            unbanForm.reset();
        } else {
            showNotification(data.message || 'Gagal mengirim permintaan unban', 'error');
        }
    } catch (error) {
        console.error('Unban error:', error);
        showNotification('Terjadi kesalahan saat mengirim permintaan', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loader.classList.add('hidden');
    }
}

// Check ban service
async function handleCheckSubmit(e) {
    e.preventDefault();
    
    const number = document.getElementById('checkNumber').value;
    
    if (!number) {
        showNotification('Mohon masukkan nomor WhatsApp', 'error');
        return;
    }
    
    // Validate phone number format
    if (!isValidPhoneNumber(number)) {
        showNotification('Format nomor tidak valid. Gunakan format: +6281234567890', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#checkForm button[type="submit"]');
    const btnText = document.getElementById('checkBtnText');
    const loader = document.getElementById('checkLoader');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/check-ban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ number })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showCheckResult(data);
            showNotification('Berhasil mengecek status ban', 'success');
        } else {
            showNotification(data.message || 'Gagal mengecek status ban', 'error');
        }
    } catch (error) {
        console.error('Check ban error:', error);
        showNotification('Terjadi kesalahan saat mengecek status', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loader.classList.add('hidden');
    }
}

// Display check result
function showCheckResult(data) {
    const resultContainer = document.getElementById('checkResult');
    const statusClass = data.banType.includes('tidak') ? 'tidak-dibanned' : 
                       data.banType.includes('permanen') ? 'permanen' : 'spam';
    
    // Get ban likelihood color
    const likelihoodColor = data.likelihood && data.likelihood !== 'N/A' ? 
        (parseInt(data.likelihood) > 70 ? 'var(--error-color)' : 
         parseInt(data.likelihood) > 40 ? 'var(--warning-color)' : 'var(--success-color)') : 
        'var(--text-secondary)';
    
    resultContainer.innerHTML = `
        <div class="result-info">
            <div>
                <h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; opacity: 0.8;">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    ${data.number}
                </h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
                    ${data.message}
                </p>
                ${data.details ? `
                    <div style="margin-top: 10px; padding: 10px; background: var(--bg-primary); border-radius: 8px; border-left: 3px solid ${likelihoodColor};">
                        <p style="font-size: 13px; color: var(--text-primary); margin-bottom: 5px;">
                            <strong>Detail Analisis:</strong>
                        </p>
                        <p style="font-size: 13px; color: var(--text-secondary);">
                            ${data.details}
                        </p>
                        ${data.likelihood && data.likelihood !== 'N/A' ? `
                            <p style="font-size: 12px; color: ${likelihoodColor}; margin-top: 8px;">
                                <strong>Kemungkinan Banned: ${data.likelihood}</strong>
                            </p>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
            <span class="status-badge ${statusClass}">${data.banType}</span>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
            <p style="font-size: 13px; color: var(--text-secondary);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 6px; opacity: 0.6;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                Pengecekan dilakukan pada: ${data.lastChecked || new Date().toLocaleString('id-ID')}
            </p>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 6px; opacity: 0.6;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
                Sistem menganalisis pola nomor, riwayat laporan, dan indikator lainnya
            </p>
        </div>
    `;
    
    resultContainer.classList.remove('hidden');
}

function hideCheckResult() {
    const resultContainer = document.getElementById('checkResult');
    resultContainer.classList.add('hidden');
}

// Utility functions
function isValidPhoneNumber(number) {
    // Basic validation for phone number format
    const phoneRegex = /^\+?[1-9]\d{10,14}$/;
    return phoneRegex.test(number.replace(/\s/g, ''));
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    // Clear previous classes
    notification.className = 'notification';
    notification.classList.add(type);
    
    notification.textContent = message;
    notification.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Prevent right-click and text selection for security
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + L for logout
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (isLoggedIn) {
            logout();
        }
    }
    
    // Escape to close menu
    if (e.key === 'Escape') {
        closeSideMenu();
    }
});