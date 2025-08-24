// Admin panel: improved UX & animations
const PRODUCTS_KEY = 'shop3_products_v1';

function readProducts() {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveProducts(list) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

let products = readProducts();

const adminTbody = document.querySelector('#adminTable tbody');
const adminSearch = document.getElementById('adminSearch');
const adminSort = document.getElementById('adminSort');
const addProductBtn = document.getElementById('addProductBtn');

function renderAdminTable(list) {
  adminTbody.innerHTML = '';
  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${p.image}" style="width:64px;height:44px;object-fit:cover;border-radius:6px" /></td>
      <td>${p.title}</td>
      <td>${p.category}</td>
      <td>${p.price.toLocaleString('vi-VN')}₫</td>
      <td>${p.qty}</td>
      <td>
        <button class="btn ghost" data-act="edit" data-id="${p.id}">Sửa</button>
        <button class="btn" data-act="del" data-id="${p.id}">Xóa</button>
      </td>
    `;
    adminTbody.appendChild(tr);
  });
}

function applyAdminFilters() {
  const q = adminSearch.value.trim().toLowerCase();
  const s = adminSort.value;
  let list = products.filter(p => !q || p.title.toLowerCase().includes(q));
  if (s === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if (s === 'price-desc') list.sort((a,b)=>b.price-a.price);
  renderAdminTable(list);
}

/* Modal for add/edit */
const modal = document.getElementById('modal');
const productForm = document.getElementById('productForm');
let editingId = null;

addProductBtn.addEventListener('click', () => {
  editingId = null;
  productForm.reset();
  document.getElementById('modalTitle').textContent = 'Thêm sản phẩm';
  modal.style.display = 'grid';
});

document.getElementById('cancelModal').addEventListener('click', () => {
  modal.style.display = 'none';
});

/* table actions */
adminTbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  if (act === 'del') {
    if (!confirm('Xóa sản phẩm?')) return;
    products = products.filter(p => p.id !== id);
    saveProducts(products);
    applyAdminFilters();
    alert('Đã xóa');
  }
  if (act === 'edit') {
    const p = products.find(x => x.id === id);
    if (!p) return;
    editingId = id;
    productForm.title.value = p.title;
    productForm.image.value = p.image || '';
    productForm.category.value = p.category || '';
    productForm.price.value = p.price || 0;
    productForm.qty.value = p.qty || 0;
    document.getElementById('modalTitle').textContent = 'Sửa sản phẩm';
    modal.style.display = 'grid';
  }
});

/* submit add/edit */
productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    id: editingId || ('p' + Date.now()),
    title: productForm.title.value,
    image: productForm.image.value || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop&crop=entropy',
    category: productForm.category.value || 'General',
    price: parseInt(productForm.price.value,10) || 0,
    qty: parseInt(productForm.qty.value,10) || 0
  };
  if (editingId) {
    products = products.map(p => p.id === editingId ? data : p);
  } else {
    products.unshift(data);
  }
  saveProducts(products);
  modal.style.display = 'none';
  applyAdminFilters();
});

/* search/sort */
adminSearch.addEventListener('input', applyAdminFilters);
adminSort.addEventListener('change', applyAdminFilters);

/* init */
(function init() {
  products = readProducts();
  if (!products || products.length === 0) {
    // seed if empty
    const seed = [
      { id: 'p1', title: 'Headphone Nova', category: 'Audio', price: 1290000, qty: 20, image: 'https://images.unsplash.com/photo-1516707570266-2f0f6e2f2b22?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
      { id: 'p2', title: 'Sneakers Aero', category: 'Fashion', price: 890000, qty: 15, image: 'https://images.unsplash.com/photo-1528701800484-3c3b3d1b6ba1?q=80&w=1200&auto=format&fit=crop&crop=entropy' },
    ];
    products = seed;
    saveProducts(products);
  }
  applyAdminFilters();
})();
