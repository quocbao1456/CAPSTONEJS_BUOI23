/* Data storage */
const PRODUCTS_KEY = 'shop3_products_v1';
const CART_KEY = 'shop3_cart_v1';

const sampleProducts = [
  { id: 'p1', title: 'Headphone Nova', category: 'Audio', price: 1290000, qty: 20, image: 'https://images.unsplash.com/photo-1516707570266-2f0f6e2f2b22?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
  { id: 'p2', title: 'Sneakers Aero', category: 'Fashion', price: 890000, qty: 15, image: 'https://images.unsplash.com/photo-1528701800484-3c3b3d1b6ba1?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
  { id: 'p3', title: 'Smartwatch Vibe', category: 'Gadgets', price: 2250000, qty: 10, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
  { id: 'p4', title: 'Backpack Trail', category: 'Travel', price: 420000, qty: 30, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
  { id: 'p5', title: 'Sunglasses Sol', category: 'Fashion', price: 210000, qty: 25, image: 'https://images.unsplash.com/photo-1505238680356-667803448bb6?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
  { id: 'p6', title: 'Bluetooth Speaker', category: 'Audio', price: 740000, qty: 18, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
  { id: 'p7', title: 'Travel Mug', category: 'Home', price: 99000, qty: 40, image: 'https://images.unsplash.com/photo-1517686469429-8bdb06d1c0b1?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
  { id: 'p8', title: 'Gaming Mouse', category: 'Gadgets', price: 540000, qty: 12, image: 'https://images.unsplash.com/photo-1587825140708-1eab3b9d87c0?q=80&w=1200&auto=format&fit=crop&crop=entropy' }
];

function readProducts() {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(sampleProducts));
    return sampleProducts.slice();
  }
  return JSON.parse(raw);
}
function saveProducts(list) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

function readCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : {};
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* Utilities */
function formatVnd(n) {
  return n.toLocaleString('vi-VN') + '₫';
}

function toast(message, timeout = 1800) {
  const root = document.getElementById('toastRoot');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  root.appendChild(el);
  setTimeout(()=> el.remove(), timeout);
}

/* Render products with interactive tilt */
let products = readProducts();
let filtered = products.slice();

const productGrid = document.getElementById('productGrid');
const filterCategory = document.getElementById('filterCategory');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('search');

function buildCategoryOptions() {
  const cats = ['all', ...new Set(products.map(p => p.category))];
  filterCategory.innerHTML = '';
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c === 'all' ? 'Tất cả danh mục' : c;
    filterCategory.appendChild(opt);
  });
}

function createProductCard(p) {
  const el = document.createElement('div');
  el.className = 'product-card card-3d';
  el.innerHTML = `
    <div class="media">
      <img loading="lazy" src="${p.image}" alt="${p.title}">
    </div>
    <div class="badge-ribbon">${p.price > 1000000 ? 'Premium' : 'Best'}</div>
    <div class="body">
      <div class="title">${p.title}</div>
      <div class="meta hint">${p.category}</div>
      <div class="price-row">
        <div class="price">${formatVnd(p.price)}</div>
        <div class="hint">Còn: ${p.qty}</div>
      </div>
      <div class="actions">
        <button class="btn addBtn" data-id="${p.id}">Mua</button>
        <button class="btn addBtn" data-id="${p.id}">Thêm</button>
        <button class="btn ghost detailBtn" data-id="${p.id}">Chi tiết</button>
      </div>
    </div>
  `;

  // tilt effect on mousemove
  const media = el.querySelector('.media');
  el.addEventListener('mousemove', (ev) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (ev.clientX - cx) / rect.width;
    const dy = (ev.clientY - cy) / rect.height;
    const rx = (-dy * 10).toFixed(2);
    const ry = (dx * 12).toFixed(2);
    el.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    media.style.transform = `translateZ(40px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
    media.style.transform = '';
  });

  return el;
}

function renderProducts(list) {
  productGrid.innerHTML = '';
  list.forEach((p, i) => {
    const card = createProductCard(p);
    productGrid.appendChild(card);
    setTimeout(() => {
      card.classList.add('pop');
    }, i * 80);
  });
}

/* Filter / sort / search */
function applyFilters() {
  const cat = filterCategory.value;
  const q = searchInput.value.trim().toLowerCase();
  const sort = sortSelect.value;

  filtered = products.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (q && !p.title.toLowerCase().includes(q)) return false;
    return true;
  });

  if (sort === 'price-asc') filtered.sort((a,b)=>a.price-b.price);
  if (sort === 'price-desc') filtered.sort((a,b)=>b.price-a.price);

  renderProducts(filtered);
}

/* Cart mechanics */
let cart = readCart();

function updateCartUI() {
  const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent = count;
}

function renderCartDrawer() {
  const itemsEl = document.getElementById('cartItems');
  itemsEl.innerHTML = '';
  const arr = Object.values(cart);
  if (arr.length === 0) {
    itemsEl.innerHTML = '<div class="hint">Giỏ hàng trống</div>';
  } else {
    arr.forEach(item => {
      const p = products.find(x => x.id === item.id) || {};
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.gap = '10px';
      div.style.alignItems = 'center';
      div.innerHTML = `
        <img src="${p.image}" style="width:56px;height:56px;object-fit:cover;border-radius:8px" />
        <div style="flex:1">
          <div style="font-weight:700">${p.title}</div>
          <div class="hint">${formatVnd(p.price)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div class="qty">
            <button class="btn" data-action="dec" data-id="${item.id}">-</button>
            <div class="count">${item.qty}</div>
            <button class="btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
          <button class="btn ghost" data-action="remove" data-id="${item.id}">Xóa</button>
        </div>
      `;
      itemsEl.appendChild(div);
    });
  }
  const total = arr.reduce((s,i)=>s + ((products.find(p=>p.id===i.id)?.price||0) * i.qty), 0);
  document.getElementById('cartTotal').textContent = formatVnd(total);
  document.getElementById('cartSummary').textContent = `${arr.length} sản phẩm`;
}

/* Flying image animation */
function flyImageToCart(imgEl, targetSelector = '#cartBtn') {
  const rect = imgEl.getBoundingClientRect();
  const cartBtn = document.querySelector(targetSelector);
  if (!cartBtn) return;
  const cartRect = cartBtn.getBoundingClientRect();

  const clone = imgEl.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.borderRadius = window.getComputedStyle(imgEl).borderRadius || '8px';
  clone.style.transition = 'transform 700ms cubic-bezier(.2,.9,.2,1), opacity 700ms';
  clone.style.willChange = 'transform,opacity';
  clone.style.zIndex = 9999;
  document.getElementById('flyingRoot').appendChild(clone);

  const tx = cartRect.left + cartRect.width/2 - (rect.left + rect.width/2);
  const ty = cartRect.top + cartRect.height/2 - (rect.top + rect.height/2);

  clone.animate([
    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
    { transform: `translate3d(${tx*0.6}px, ${ty*0.6 - 20}px, -40px) scale(.7)`, opacity: .9 },
    { transform: `translate3d(${tx}px, ${ty}px, -120px) scale(.28)`, opacity: 0 }
  ], { duration: 700, easing: 'cubic-bezier(.2,.9,.2,1)'} );

  setTimeout(()=> clone.remove(), 720);
}

/* Event delegation */
document.addEventListener('click', (e) => {
  // nút thêm vào giỏ
  const add = e.target.closest('.addBtn');
  if (add) {
    const id = add.dataset.id;
    const card = add.closest('.product-card');
    const img = card && card.querySelector('img');
    if (img) flyImageToCart(img);
    addToCart(id);
    add.classList.add('pop');
    setTimeout(()=> add.classList.remove('pop'), 300);
  }

  // mở/đóng giỏ
  const cartBtn = e.target.closest('#cartBtn');
  if (cartBtn) {
    const isOpen = document.getElementById('cartDrawer').classList.contains('open');
    toggleCart(!isOpen);
  }

  // checkout
  const cartClose = e.target.closest('#checkoutBtn');
  if (cartClose) {
    alert('Thanh toán demo — Cảm ơn bạn!');
    clearCart();
    toggleCart(false);
  }

  // clear cart
  const clearCartBtn = e.target.closest('#clearCart');
  if (clearCartBtn) clearCart();

  // các action trong giỏ
  const drawer = e.target.closest('#cartDrawer');
  if (drawer) {
    const act = e.target.dataset.action;
    const id = e.target.dataset.id;
    if (act) {
      if (act === 'inc') updateQty(id, 1);
      if (act === 'dec') updateQty(id, -1);
      if (act === 'remove') removeItem(id);
    }
  }

  //  xử lý nút Chi tiết sản phẩm
  const detailBtn = e.target.closest('.detailBtn');
  if (detailBtn) {
    const id = detailBtn.dataset.id;
    viewDetails(id);
  }
});

/* Cart handlers */
function addToCart(id, qty = 1) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!cart[id]) cart[id] = { id, qty:0 };
  cart[id].qty += qty;
  if (cart[id].qty > p.qty) cart[id].qty = p.qty;
  saveCart(cart);
  updateCartUI();
  renderCartDrawer();
  toggleCart(true);
  toast('Đã thêm vào giỏ hàng');
}

function updateQty(id, diff) {
  if (!cart[id]) return;
  cart[id].qty += diff;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  updateCartUI();
  renderCartDrawer();
}

function removeItem(id) {
  delete cart[id];
  saveCart(cart);
  updateCartUI();
  renderCartDrawer();
}

function clearCart() {
  cart = {};
  saveCart(cart);
  updateCartUI();
  renderCartDrawer();
  toast('Giỏ hàng đã được làm mới');
}

function toggleCart(open) {
  const d = document.getElementById('cartDrawer');
  const cartBtn = document.getElementById('cartBtn');
  if (open) {
    d.classList.add('open');
    d.setAttribute('aria-hidden','false');
    cartBtn.setAttribute('aria-expanded','true');
  } else {
    d.classList.remove('open');
    d.setAttribute('aria-hidden','true');
    cartBtn.setAttribute('aria-expanded','false');
  }
}

/* Product detail modal */
function viewDetails(id) {
  const p = products.find(x => x.id === id);
  if (!p) return alert('Không tìm thấy sản phẩm');

  document.getElementById("modal-title").innerText = p.title;
  document.getElementById("modal-category").innerText = p.category;
  document.getElementById("modal-price").innerText = formatVnd(p.price);
  document.getElementById("modal-qty").innerText = p.qty;
  document.getElementById("modal-img").src = p.image;

  document.getElementById("productModal").style.display = "block";
}

// Đóng modal
document.querySelector(".close").onclick = function() {
  document.getElementById("productModal").style.display = "none";
};
window.onclick = function(event) {
  const modal = document.getElementById("productModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

/* Bind UI */
document.getElementById('filterCategory').addEventListener('change', applyFilters);
document.getElementById('sort').addEventListener('change', applyFilters);
document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('search').value = '';
  document.getElementById('filterCategory').value = 'all';
  document.getElementById('sort').value = 'default';
  applyFilters();
});

/* init */
(function init() {
  products = readProducts();
  buildCategoryOptions();
  applyFilters();
  cart = readCart();
  updateCartUI();
  renderCartDrawer();
})();

/* carousel */
const track = document.querySelector(".carousel__track");
const slides = Array.from(track.children);
const nextBtn = document.querySelector(".carousel__btn.next");
const prevBtn = document.querySelector(".carousel__btn.prev");

let currentIndex = 0;
function updateSlide(index) {
  track.style.transform = `translateX(-${index * 100}%)`;
  slides.forEach((s, i) => s.classList.toggle("active", i === index));
}

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlide(currentIndex);
});
prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateSlide(currentIndex);
});
setInterval(() => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlide(currentIndex);
}, 5000);
