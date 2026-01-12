console.log('APP.JS VERSION 4 LOADED - FINAL VERSION');
const API_URL = 'http://localhost:8080/api';

// State
let currentUser = null;
let cart = [];
let token = localStorage.getItem('jwt_token');


// DOM Elements - will be initialized in DOMContentLoaded
let adminModal, adminBtn, productForm, productGrid, authModal, cartModal;
let cartCountEl, cartItemsContainer, cartTotalEl, toast;



function setupEventListeners() {
    // Nav
    document.getElementById('login-btn').onclick = () => openModal(authModal);
    document.getElementById('logout-btn').onclick = logout;
    document.getElementById('cart-btn').onclick = () => {
        if (!currentUser) return showToast('Please login to view cart');
        fetchCart();
        openModal(cartModal);
    };
    if (adminBtn) {
        adminBtn.onclick = () => {
            document.getElementById('product-form').reset();
            document.getElementById('prod-id').value = '';
            document.getElementById('admin-modal-title').textContent = 'Add Product';
            openModal(adminModal);
        };
    }

    // ... existing listeners ...

    // Admin Form
    if (productForm) productForm.onsubmit = handleProductSave;

    document.getElementById('shop-now-btn').onclick = () => {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    };

    // Modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = () => closeModal(btn.closest('.modal'));
    });
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) closeModal(e.target);
    };

    // Auth Forms
    document.getElementById('switch-to-register').onclick = (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    };
    document.getElementById('switch-to-login').onclick = (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    };

    document.getElementById('login-form').onsubmit = handleLogin;
    document.getElementById('register-form').onsubmit = handleRegister;

    // Checkout
    document.getElementById('checkout-btn').onclick = handleCheckout;
}

// ... existing functions ...

async function handleProductSave(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const price = document.getElementById('prod-price').value;
    const stock = document.getElementById('prod-stock').value;
    const description = document.getElementById('prod-desc').value;
    const imageUrl = document.getElementById('prod-image-url').value;

    const product = { name, price, stock, description, imageUrl };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });

        if (res.ok) {
            showToast(id ? 'Product updated!' : 'Product created!');
            closeModal(adminModal);
            loadProducts();
        } else {
            showToast('Failed to save product');
        }
    } catch (err) {
        showToast('Error saving product');
    }
}

function openEditModal(product) {
    document.getElementById('prod-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-stock').value = product.stock;
    document.getElementById('prod-desc').value = product.description;
    document.getElementById('prod-image-url').value = product.imageUrl || '';

    document.getElementById('admin-modal-title').textContent = 'Edit Product';
    openModal(adminModal);
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            showToast('Product deleted successfully!');
            loadProducts();
        } else {
            showToast('Failed to delete product');
        }
    } catch (err) {
        showToast('Error deleting product');
    }
}

// ... rendering ...

function renderProducts(products) {
    const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('ROLE_ADMIN');

    productGrid.innerHTML = products.map(p => `
        <div class="glass-card product-card">
            <div class="product-image">
                ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">` : `<i class="fa-solid fa-laptop"></i>`}
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="product-description">${p.description || 'No description'}</p>
                <div class="product-footer">
                    <span class="price">$${p.price.toFixed(2)}</span>
                    <button class="primary-btn" onclick="addToCart(${p.id})">Add to Cart</button>
                    ${isAdmin ? `
                        <button class="secondary-btn" onclick='openEditModal(${JSON.stringify(p)})'><i class="fa-solid fa-pen"></i></button>
                        <button class="secondary-btn" onclick="deleteProduct(${p.id})" style="background: #ff4444;"><i class="fa-solid fa-trash"></i></button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateUIAuth() {
    console.log('[updateUIAuth] === FUNCTION CALLED ===');
    console.log('[updateUIAuth] currentUser:', currentUser);
    console.log('[updateUIAuth] adminBtn:', adminBtn);

    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const greeting = document.getElementById('user-greeting');

    if (currentUser) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        greeting.classList.remove('hidden');
        greeting.textContent = `Hi, ${currentUser.username || 'User'}`;

        const roles = currentUser.roles || [];
        console.log('[updateUIAuth] Roles array:', roles);
        console.log('[updateUIAuth] Checking for ROLE_ADMIN in:', JSON.stringify(roles));

        // Check if admin - handle both array and string cases
        const isAdmin = Array.isArray(roles) ? roles.includes('ROLE_ADMIN') : false;
        console.log('[updateUIAuth] isAdmin:', isAdmin);
        console.log('[updateUIAuth] adminBtn exists:', !!adminBtn);

        if (isAdmin && adminBtn) {
            console.log('[updateUIAuth] ✓ Showing admin button!');
            adminBtn.classList.remove('hidden');
            adminBtn.style.display = ''; // Force display
        } else {
            console.log('[updateUIAuth] ✗ Hiding admin button');
            if (adminBtn) {
                adminBtn.classList.add('hidden');
            }
        }
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        greeting.classList.add('hidden');
        if (adminBtn) adminBtn.classList.add('hidden');
    }
}


// --- API Interactions ---

async function checkAuth() {
    if (token) {
        // In a real app, we'd validate the token with an endpoint like /api/auth/me
        // For now, we'll decode it or just assume valid if exists (User session persistence)
        currentUser = parseJwt(token);
        updateUIAuth();
        fetchCart();
    }
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        renderProducts(products);
    } catch (err) {
        productGrid.innerHTML = '<p class="error">Failed to load products.</p>';
    }
}

async function fetchCart() {
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            cart = data.items || [];
            updateCartUI();
        }
    } catch (err) {
        console.error('Cart fetch error', err);
    }
}

async function addToCart(productId) {
    if (!currentUser) return openModal(authModal);

    try {
        const res = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (res.ok) {
            showToast('Item added to cart!');
            fetchCart();
        }
    } catch (err) {
        showToast('Failed to add item');
    }
}

async function removeFromCart(itemId) {
    try {
        await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchCart();
    } catch (err) {
        console.error(err);
    }
}

async function handleCheckout() {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showToast('Order placed successfully! 🎉');
            closeModal(cartModal);
            fetchCart(); // Clear cart
        } else {
            const msg = await res.text();
            showToast('Checkout failed: ' + msg); // e.g. Stock issues
        }
    } catch (err) {
        showToast('Checkout error');
    }
}

// --- Auth Handlers ---

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('[handleLogin] Login successful! Response:', data);
            token = data.token;
            localStorage.setItem('jwt_token', token);
            currentUser = parseJwt(token);
            console.log('[handleLogin] currentUser after parse:', currentUser);
            console.log('[handleLogin] Calling updateUIAuth...');
            updateUIAuth();
            console.log('[handleLogin] Calling loadProducts...');
            loadProducts(); // Refresh products to show edit buttons for admins
            closeModal(authModal);
            fetchCart();
            showToast(`Welcome, ${data.username}!`);
        } else {
            showToast('Invalid credentials');
        }
    } catch (err) {
        showToast('Login failed');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role: ['customer'] })
        });

        if (res.ok) {
            showToast('Registration successful! Please login.');
            document.getElementById('switch-to-login').click();
        } else {
            const msg = await res.text();
            showToast(msg);
        }
    } catch (err) {
        showToast('Registration failed');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('jwt_token');
    cart = [];
    updateUIAuth();
    updateCartUI();
    showToast('Logged out');
}

// --- UI Rendering ---

function updateCartUI() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.textContent = totalItems;

    let totalAmount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        document.getElementById('checkout-btn').disabled = true;
    } else {
        document.getElementById('checkout-btn').disabled = false;
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.quantity * item.product.price;
            totalAmount += itemTotal;
            return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.product.name}</h4>
                    <span class="cart-item-price">$${item.product.price} x ${item.quantity}</span>
                </div>
                <button class="close-btn" onclick="removeFromCart(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            `;
        }).join('');
    }

    cartTotalEl.textContent = totalAmount.toFixed(2);
}

// --- Helpers ---

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function parseJwt(token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const data = JSON.parse(jsonPayload);
        const result = { username: data.sub, ...data };
        console.log('[parseJwt] Parsed token data:', result);
        return result;
    } catch (e) {
        console.error('[parseJwt] Error parsing token:', e);
        return null;
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM Element References
    productGrid = document.getElementById('product-grid');
    authModal = document.getElementById('auth-modal');
    cartModal = document.getElementById('cart-modal');
    cartCountEl = document.getElementById('cart-count');
    cartItemsContainer = document.getElementById('cart-items');
    cartTotalEl = document.getElementById('cart-total-amount');
    toast = document.getElementById('toast');
    adminModal = document.getElementById('admin-modal');
    adminBtn = document.getElementById('admin-btn');
    productForm = document.getElementById('product-form');

    setupEventListeners();
    checkAuth();
    loadProducts();
});

