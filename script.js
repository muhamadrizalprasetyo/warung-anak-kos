/* ============================================================
   WARUNG ANAK KOS — script.js
   Vanilla JS | No dependencies | LocalStorage based
   ============================================================ */

'use strict';

/* ========== DATA: PRODUK ========== */
const PRODUCTS = [
  // MAKANAN INSTAN
  { id: 1,  cat: 'makanan-instan', emoji: '🍜', name: 'Indomie Goreng',      desc: 'Mie goreng klasik favoritnya anak kos.',      price: 3500  },
  { id: 2,  cat: 'makanan-instan', emoji: '🍲', name: 'Indomie Kuah',        desc: 'Hangat dan gurih di malam yang dingin.',       price: 3500  },
  { id: 3,  cat: 'makanan-instan', emoji: '🍝', name: 'Mie Sedaap Goreng',   desc: 'Tekstur kenyal, rasa mantap tenan.',           price: 4000  },
  { id: 4,  cat: 'makanan-instan', emoji: '🥘', name: 'Sarimi Soto Ayam',    desc: 'Soto kuning yang bikin kangen kampung.',       price: 2500  },
  { id: 5,  cat: 'makanan-instan', emoji: '🍱', name: 'Pop Mie Cup',         desc: 'Tinggal seduh, langsung jadi. Praktis!',       price: 5000  },
  { id: 6,  cat: 'makanan-instan', emoji: '🍛', name: 'Nasi Goreng Instan',  desc: 'Nasi goreng simpel, cocok saat males masak.',  price: 8000  },
  { id: 7,  cat: 'makanan-instan', emoji: '🍜', name: 'Mie Cup Jumbo',       desc: 'Porsi besar untuk perut yang kelaparan.',      price: 6500  },

  // MINUMAN
  { id: 8,  cat: 'minuman', emoji: '🍵', name: 'Es Teh Manis',     desc: 'Teh manis segar, es batu segaaar.',             price: 3000  },
  { id: 9,  cat: 'minuman', emoji: '🍊', name: 'Es Jeruk Peras',   desc: 'Jeruk peras asli, fresh squeeze.',               price: 4000  },
  { id: 10, cat: 'minuman', emoji: '☕', name: 'Kopi Susu Kekinian', desc: 'Creamy, manis, bikin melek malam-malam.',      price: 5000  },
  { id: 11, cat: 'minuman', emoji: '💧', name: 'Air Mineral Botol', desc: 'Kebutuhan dasar sehari-hari. Stay hydrated!',   price: 2500  },
  { id: 12, cat: 'minuman', emoji: '🍃', name: 'Teh Pucuk Harum',  desc: 'Teh botol premium, rasa teh pucuk asli.',       price: 4000  },
  { id: 13, cat: 'minuman', emoji: '🥤', name: 'Mizone Lime Mint', desc: 'Minuman vitamin, refreshing banget!',            price: 5000  },
  { id: 14, cat: 'minuman', emoji: '🧃', name: 'Good Day Cappuccino', desc: 'Kopi sachet, penyelamat begadang.',           price: 4500  },

  // SNACK
  { id: 15, cat: 'snack', emoji: '🥔', name: 'Chitato BBQ',       desc: 'Keripik kentang rasa BBQ, crunch terus!',        price: 8000  },
  { id: 16, cat: 'snack', emoji: '🍘', name: 'Qtela Singkong',    desc: 'Renyah gurih, cemilan tipis-tipis.',             price: 6000  },
  { id: 17, cat: 'snack', emoji: '🌽', name: 'Taro Net Original', desc: 'Jagung krispy yang bikin nagih.',                price: 5000  },
  { id: 18, cat: 'snack', emoji: '🌶️', name: 'Makaroni Ngehe',   desc: 'Pedas, gurih, bikin ketagihan. Waspada!',        price: 3000  },
  { id: 19, cat: 'snack', emoji: '🥜', name: 'Kacang Garuda',     desc: 'Kacang renyah buat nemenin nonton.',             price: 5000  },
  { id: 20, cat: 'snack', emoji: '🍫', name: 'Beng-Beng Share It', desc: 'Wafer coklat manis buat mood booster.',         price: 3000  },
];

function filterPromo(type) {
  if (type === "hemat") {
    showToast("Mode hemat aktif 🥲");
    // nanti bisa filter produk murah
  } else {
    showToast("Mode sultan aktif 🤑");
    // nanti bisa filter produk premium
  }

  // scroll ke katalog
  document.getElementById("catalog").scrollIntoView({
    behavior: "smooth"
  });
}

/* ========== STATE ========== */
let currentUser = null;       // { name, room }
let cart        = [];         // [{ id, qty }]
let activeFilter = 'semua';
let searchQuery  = '';
let activeOrder  = null;      // last placed order snapshot
let orderStatusTimer = null;

const STORAGE_KEYS = {
  user:  'wak_user',
  cart:  'wak_cart',
  order: 'wak_order',
};

/* ========== UTILS ========== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt = (n) => 'Rp ' + n.toLocaleString('id-ID');
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const load = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };

/* ---------- Toast ---------- */
let _toastTimer;
function showToast(msg, duration = 2400) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ========== SCREENS ========== */
function showApp() {
  $('#login-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');
}
function showLogin() {
  $('#login-screen').classList.remove('hidden');
  $('#app').classList.add('hidden');
}

/* ---------- Section visibility ---------- */
function showSection(id) {
  ['cart-section', 'checkout-section', 'order-section'].forEach(sec => {
    $(` #${sec}`).classList.add('hidden');
  });
  if (id) $(`#${id}`).classList.remove('hidden');
  if (id) $(`#${id}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function hideAllSections() {
  ['cart-section', 'checkout-section', 'order-section'].forEach(sec => {
    $(`#${sec}`).classList.add('hidden');
  });
}

/* ========== AUTH ========== */
function initAuth() {
  const saved = load(STORAGE_KEYS.user);
  if (saved && saved.name && saved.room) {
    currentUser = saved;
    showApp();
    initMain();
  }

  $('#btn-login').addEventListener('click', handleLogin);
  $('#input-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('#input-room').focus(); });
  $('#input-room').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  $('#btn-logout').addEventListener('click', handleLogout);
}

function handleLogin() {
  const name = $('#input-name').value.trim();
  const room = $('#input-room').value.trim().toUpperCase();
  if (!name) { showToast('⚠️ Masukkan nama kamu dulu!'); $('#input-name').focus(); return; }
  if (!room) { showToast('⚠️ Masukkan nomor kamar dulu!'); $('#input-room').focus(); return; }
  currentUser = { name, room };
  save(STORAGE_KEYS.user, currentUser);
  showApp();
  initMain();
}

function handleLogout() {
  if (!confirm('Yakin mau keluar?')) return;
  currentUser = null;
  cart = [];
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.cart);
  clearTimeout(orderStatusTimer);
  showLogin();
  hideAllSections();
  // Reset inputs
  $('#input-name').value = '';
  $('#input-room').value = '';
}

/* ========== MAIN APP INIT ========== */
function initMain() {
  // Show user info in navbar
  $('#nav-user-info').textContent = `${currentUser.name} · Kamar ${currentUser.room}`;

  // Load cart from storage
  cart = load(STORAGE_KEYS.cart) || [];

  // Check for saved order (in-progress)
  const savedOrder = load(STORAGE_KEYS.order);
  if (savedOrder && savedOrder.status !== 'selesai') {
    activeOrder = savedOrder;
  }

  renderProducts();
  renderCart();
  updateCartBadge();
  initCatalogControls();
  initCartEvents();
  initCheckoutEvents();

  // Restore order status if in-progress
  if (activeOrder && activeOrder.status !== 'selesai') {
    populateOrderSection(activeOrder);
    showSection('order-section');
  }
}

/* ========== CATALOG ========== */
function initCatalogControls() {
  // Filter tabs
  $$('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.cat;
      renderProducts();
    });
  });

  // Search input
  const searchInput = $('#search-input');
  const clearBtn    = $('#search-clear');

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    clearBtn.classList.toggle('hidden', !searchQuery);
    renderProducts();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.classList.add('hidden');
    searchInput.focus();
    renderProducts();
  });

  $('#reset-search').addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.classList.add('hidden');
    activeFilter = 'semua';
    $$('.filter-tab').forEach(t => t.classList.remove('active'));
    $('.filter-tab[data-cat="semua"]').classList.add('active');
    renderProducts();
  });
}

function getFilteredProducts() {
  return PRODUCTS.filter(p => {
    const matchCat  = activeFilter === 'semua' || p.cat === activeFilter;
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      p.desc.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });
}

function getCartQty(id) {
  const item = cart.find(c => c.id === id);
  return item ? item.qty : 0;
}

function renderProducts() {
  const grid    = $('#product-grid');
  const noResult = $('#empty-search');
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResult.classList.remove('hidden');
    $('#empty-keyword').textContent = searchQuery || activeFilter;
    return;
  }
  noResult.classList.add('hidden');

  grid.innerHTML = filtered.map((p, i) => {
    const qty = getCartQty(p.id);
    const badgeClass = `badge-${p.cat}`;
    const catLabel = { 'makanan-instan': 'Makanan', minuman: 'Minuman', snack: 'Snack' }[p.cat];
    const actionHTML = qty > 0
      ? `<div class="qty-controls">
           <button class="qty-btn" data-id="${p.id}" data-action="dec">−</button>
           <span class="qty-val">${qty}</span>
           <button class="qty-btn" data-id="${p.id}" data-action="inc">+</button>
         </div>`
      : `<button class="btn-add" data-id="${p.id}" data-action="add">+ Tambah</button>`;

    return `
      <div class="product-card" style="animation-delay:${i * 0.05}s">
        <div class="card-thumb">
          <span>${p.emoji}</span>
          <span class="card-badge ${badgeClass}">${catLabel}</span>
        </div>
        <div class="card-body">
          <div class="card-name">${p.name}</div>
          <div class="card-desc">${p.desc}</div>
          <div class="card-price">${fmt(p.price)}</div>
          <div class="card-actions">${actionHTML}</div>
        </div>
      </div>`;
  }).join('');

  // Bind card events
  grid.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleProductAction(btn.dataset.id, btn.dataset.action));
  });
}

function handleProductAction(id, action) {
  id = Number(id);
  if (action === 'add' || action === 'inc') {
    addToCart(id);
  } else if (action === 'dec') {
    decFromCart(id);
  }
}

/* ========== CART LOGIC ========== */
function addToCart(id) {
  const existing = cart.find(c => c.id === id);
  const product  = PRODUCTS.find(p => p.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
    showToast(`✅ ${product.name} ditambahkan!`);
  }
  saveCart();
  renderProducts();
  renderCart();
  updateCartBadge();
}

function decFromCart(id) {
  const existing = cart.find(c => c.id === id);
  if (!existing) return;
  existing.qty--;
  if (existing.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
  saveCart();
  renderProducts();
  renderCart();
  updateCartBadge();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  renderProducts();
  renderCart();
  updateCartBadge();
}

function saveCart() { save(STORAGE_KEYS.cart, cart); }

function getCartTotal() {
  return cart.reduce((sum, c) => {
    const p = PRODUCTS.find(p => p.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);
}

function getTotalItems() {
  return cart.reduce((sum, c) => sum + c.qty, 0);
}

function updateCartBadge() {
  const badge = $('#cart-count');
  const total = getTotalItems();
  if (total > 0) {
    badge.textContent = total;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

/* ========== CART RENDER ========== */
function renderCart() {
  const content   = $('#cart-content');
  const emptyEl   = $('#cart-empty');
  const footerEl  = $('#cart-footer');
  const checkoutBtn = $('#btn-checkout');

  if (cart.length === 0) {
    content.innerHTML = '';
    emptyEl.classList.remove('hidden');
    footerEl.classList.add('hidden');
  } else {
    emptyEl.classList.add('hidden');
    footerEl.classList.remove('hidden');

    content.innerHTML = `<div class="cart-items">
      ${cart.map(c => {
        const p = PRODUCTS.find(p => p.id === c.id);
        if (!p) return '';
        return `
          <div class="cart-item" data-cart-id="${c.id}">
            <div class="cart-item-emoji">${p.emoji}</div>
            <div class="cart-item-info">
              <div class="cart-item-name">${p.name}</div>
              <div class="cart-item-price">${fmt(p.price)} / pcs</div>
            </div>
            <div class="cart-item-qty">
              <button class="cart-qty-btn" data-cart-action="dec" data-cart-id="${c.id}">−</button>
              <span class="cart-qty-val">${c.qty}</span>
              <button class="cart-qty-btn" data-cart-action="inc" data-cart-id="${c.id}">+</button>
            </div>
            <div class="cart-item-subtotal">${fmt(p.price * c.qty)}</div>
          </div>`;
      }).join('')}
    </div>`;

    // Bind cart item events
    content.querySelectorAll('[data-cart-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = Number(btn.dataset.cartId);
        const act = btn.dataset.cartAction;
        if (act === 'inc') addToCart(id);
        else if (act === 'dec') decFromCart(id);
      });
    });
  }

  $('#cart-total-price').textContent = fmt(getCartTotal());
  checkoutBtn.disabled = cart.length === 0;
}

/* ========== CART & CHECKOUT EVENTS ========== */
function initCartEvents() {
  // Toggle cart from navbar
  $('#btn-cart-toggle').addEventListener('click', () => {
    const cartSec = $('#cart-section');
    const isOpen  = !cartSec.classList.contains('hidden');
    if (isOpen) {
      hideAllSections();
    } else {
      renderCart();
      showSection('cart-section');
    }
  });

  // Close cart
  $('#btn-close-cart').addEventListener('click', () => hideAllSections());

  // Empty cart → go to menu
  $('#btn-shop-now').addEventListener('click', () => {
    hideAllSections();
    $('#catalog').scrollIntoView({ behavior: 'smooth' });
  });

  // Checkout button
  $('#btn-checkout').addEventListener('click', () => {
    if (cart.length === 0) { showToast('⚠️ Keranjang masih kosong!'); return; }
    populateCheckout();
    showSection('checkout-section');
  });
}

function initCheckoutEvents() {
  // Back to cart
  $('#btn-back-cart').addEventListener('click', () => {
    showSection('cart-section');
  });

  // Place order
  $('#btn-place-order').addEventListener('click', placeOrder);

  // Repeat order
  $('#btn-repeat-order').addEventListener('click', () => {
    if (!activeOrder) return;
    // Restore items to cart
    cart = activeOrder.items.map(item => ({ id: item.id, qty: item.qty }));
    saveCart();
    activeOrder = null;
    localStorage.removeItem(STORAGE_KEYS.order);
    renderCart();
    updateCartBadge();
    showToast('🔁 Pesanan sebelumnya sudah masuk keranjang!');
    showSection('cart-section');
  });

  // New order
  $('#btn-new-order').addEventListener('click', () => {
    activeOrder = null;
    localStorage.removeItem(STORAGE_KEYS.order);
    hideAllSections();
    $('#catalog').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ========== CHECKOUT ========== */
function populateCheckout() {
  $('#co-name').textContent = currentUser.name;
  $('#co-room').textContent = `Kamar ${currentUser.room}`;

  const items = $('#co-items');
  items.innerHTML = cart.map(c => {
    const p = PRODUCTS.find(p => p.id === c.id);
    if (!p) return '';
    return `
      <div class="co-item">
        <div class="co-item-left">
          <span>${p.emoji}</span>
          <div>
            <div class="co-item-name">${p.name}</div>
            <div class="co-item-qty">× ${c.qty}</div>
          </div>
        </div>
        <div class="co-item-price">${fmt(p.price * c.qty)}</div>
      </div>`;
  }).join('');

  $('#co-total').textContent = fmt(getCartTotal());
}

/* ========== PLACE ORDER ========== */
function placeOrder() {
  const orderItems = cart.map(c => {
    const p = PRODUCTS.find(p => p.id === c.id);
    return { id: c.id, name: p.name, emoji: p.emoji, qty: c.qty, price: p.price };
  });

  activeOrder = {
    id:     Date.now(),
    user:   currentUser,
    items:  orderItems,
    total:  getCartTotal(),
    status: 'diproses',
    time:   new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };

  save(STORAGE_KEYS.order, activeOrder);

  // Clear cart
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  renderProducts();

  showToast('🎉 Pesanan berhasil dikonfirmasi! Sedang diproses...', 3000);
  populateOrderSection(activeOrder);
  showSection('order-section');
  simulateOrderStatus();
}

/* ========== ORDER STATUS ========== */
function populateOrderSection(order) {
  $('#ord-name').textContent  = order.user.name;
  $('#ord-room').textContent  = `Kamar ${order.user.room}`;
  $('#ord-total').textContent = fmt(order.total);

  $('#order-items-list').innerHTML = order.items.map(item => `
    <div class="order-item-row">
      <span>${item.emoji} ${item.name} ×${item.qty}</span>
      <span>${fmt(item.price * item.qty)}</span>
    </div>`).join('');

  setStatusUI(order.status);
}

function setStatusUI(status) {
  const steps    = { diproses: 0, diantar: 1, selesai: 2 };
  const stepEls  = ['step-diproses', 'step-diantar', 'step-selesai'];
  const messages = {
    diproses: '🍳 Pesanan kamu sedang diproses di dapur...',
    diantar:  '🛵 Pesanan sedang dalam perjalanan ke kamarmu!',
    selesai:  '✅ Pesanan sudah sampai! Selamat menikmati!',
  };

  const current = steps[status] ?? 0;

  stepEls.forEach((id, i) => {
    const el = $(`#${id}`);
    el.classList.remove('active', 'done');
    if (i < current) el.classList.add('done');
    else if (i === current) el.classList.add('active');
  });

  $('#status-message').textContent = messages[status] || '';

  const doneActions = $('#order-done-actions');
  if (status === 'selesai') {
    doneActions.classList.remove('hidden');
  } else {
    doneActions.classList.add('hidden');
  }
}

function simulateOrderStatus() {
  clearTimeout(orderStatusTimer);

  // After 4s → Diantar
  orderStatusTimer = setTimeout(() => {
    if (!activeOrder) return;
    activeOrder.status = 'diantar';
    save(STORAGE_KEYS.order, activeOrder);
    setStatusUI('diantar');
    showToast('🛵 Pesanan sedang diantar ke kamarmu!', 3000);

    // After 6s more → Selesai
    orderStatusTimer = setTimeout(() => {
      if (!activeOrder) return;
      activeOrder.status = 'selesai';
      save(STORAGE_KEYS.order, activeOrder);
      setStatusUI('selesai');
      showToast('🎉 Pesanan sudah sampai! Selamat makan!', 3000);
    }, 6000);

  }, 4000);
}

/* ========== GLOBAL NAV / HERO LINKS ========== */
function initGlobalLinks() {
  // Hero CTA & promo button → scroll to catalog
  $$('a[href="#catalog"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      hideAllSections();
      $('#catalog').scrollIntoView({ behavior: 'smooth' });
    });
  });
  // Brand click → top
  $('.nav-brand')?.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    hideAllSections();
  });
}

/* ========== BOOT ========== */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initGlobalLinks();
});
