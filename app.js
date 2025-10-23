const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const products = [
  { id:'a1', name:'Arroz 1 kg', price:32, category:'Despensa', unit:'pz', emoji:'🍚' },
  { id:'a2', name:'Frijol 900 g', price:34, category:'Despensa', unit:'pz', emoji:'🫘' },
  { id:'a3', name:'Aceite 1 L', price:48, category:'Despensa', unit:'bot', emoji:'🛢️' },
  { id:'a4', name:'Azúcar 1 kg', price:29, category:'Despensa', unit:'pz', emoji:'🧂' },
  { id:'a5', name:'Sal 1 kg', price:16, category:'Despensa', unit:'pz', emoji:'🧂' },
  { id:'b1', name:'Leche 1 L', price:25, category:'Lácteos', unit:'lt', emoji:'🥛' },
  { id:'b2', name:'Yogur 1 L', price:30, category:'Lácteos', unit:'lt', emoji:'🍶' },
  { id:'c1', name:'Atún 140 g', price:22, category:'Enlatados', unit:'lata', emoji:'🐟' },
  { id:'c2', name:'Sardina 155 g', price:19, category:'Enlatados', unit:'lata', emoji:'🐠' },
  { id:'d1', name:'Papel higiénico 4p', price:38, category:'Higiene', unit:'pack', emoji:'🧻' },
  { id:'d2', name:'Jabón de barra', price:12, category:'Higiene', unit:'pz', emoji:'🧼' },
  { id:'e1', name:'Cloro 1 L', price:20, category:'Limpieza', unit:'lt', emoji:'🧴' },
  { id:'e2', name:'Detergente 1 kg', price:45, category:'Limpieza', unit:'kg', emoji:'🫧' },
];

const state = {
  cart: JSON.parse(localStorage.getItem('cart')||'{}'),
  search: '',
  category: 'Todas'
};

function saveCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); renderCart(); }

function addToCart(id, qty=1){
  state.cart[id] = (state.cart[id]||0) + qty;
  if(state.cart[id] <= 0) delete state.cart[id];
  saveCart();
}

function filtered(){
  const s = state.search.toLowerCase();
  return products.filter(p=>{
    const okCat = state.category==='Todas' || p.category===state.category;
    const okTxt = p.name.toLowerCase().includes(s);
    return okCat && okTxt;
  });
}

function peso(n){ return n.toLocaleString('es-MX',{style:'currency', currency:'MXN'}); }

function renderProducts(){
  const root = $('#grid');
  root.innerHTML = '';
  for(const p of filtered()){
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="img">${p.emoji}</div>
      <div class="body">
        <h3 class="title">${p.name}</h3>
        <div class="meta">
          <span class="badge">${p.category}</span>
          <span class="price">${peso(p.price)}</span>
        </div>
        <div class="qty">
          <button aria-label="menos" data-act="dec" data-id="${p.id}">−</button>
          <span id="q-${p.id}">${state.cart[p.id]||0}</span>
          <button aria-label="más" data-act="inc" data-id="${p.id}">+</button>
        </div>
        <button class="button add" data-act="add" data-id="${p.id}">Añadir al carrito</button>
      </div>
    `;
    root.appendChild(card);
  }
  root.querySelectorAll('button').forEach(btn=>btn.addEventListener('click', ev=>{
    const id = ev.currentTarget.dataset.id;
    const act = ev.currentTarget.dataset.act;
    if(act==='inc'){ addToCart(id, +1); $(`#q-${id}`).textContent = state.cart[id]||0; }
    if(act==='dec'){ addToCart(id, -1); $(`#q-${id}`).textContent = state.cart[id]||0; }
    if(act==='add'){ addToCart(id, +1); $(`#q-${id}`).textContent = state.cart[id]||0; openCart(); }
  }));
}

function cartList(){
  const items = Object.entries(state.cart).map(([id, q])=>{
    const p = products.find(x=>x.id===id);
    return { ...p, qty:q, subtotal: p.price*q };
  });
  const total = items.reduce((a,b)=>a+b.subtotal,0);
  return {items, total};
}

function renderCart(){
  const {items, total} = cartList();
  $('#cartItems').innerHTML = items.length ? items.map(it=>`
    <div class="cart-item">
      <div class="thumb">${it.emoji}</div>
      <div>
        <p class="name">${it.name}</p>
        <div class="qty-controls" data-id="${it.id}">
          <button data-k="-" aria-label="menos">−</button>
          <span>${it.qty}</span>
          <button data-k="+" aria-label="más">+</button>
          <button data-k="x" aria-label="eliminar">🗑️</button>
        </div>
      </div>
      <div>${peso(it.subtotal)}</div>
    </div>
  `).join('') : `<p style="color:var(--muted)">Tu carrito está vacío.</p>`;
  $('#total').textContent = peso(total);
  // attach listeners
  $$('#cartItems .qty-controls').forEach(el=>el.addEventListener('click', e=>{
    const id = el.dataset.id;
    const k = e.target.dataset.k;
    if(!k) return;
    if(k==='+') addToCart(id, +1);
    if(k==='-') addToCart(id, -1);
    if(k==='x'){ delete state.cart[id]; saveCart(); }
    renderProducts(); // reflect on grid
  }));
}

function openCart(){ $('.cart-drawer').classList.add('open'); }
function closeCart(){ $('.cart-drawer').classList.remove('open'); }

function init(){
  // category options
  const cats = ['Todas', ...new Set(products.map(p=>p.category))];
  const sel = $('#category');
  sel.innerHTML = cats.map(c=>`<option ${c==='Todas'?'selected':''}>${c}</option>`).join('');
  sel.addEventListener('change', () => { state.category = sel.value; renderProducts(); });

  $('#search').addEventListener('input', e => { state.search = e.target.value; renderProducts(); });
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  renderProducts();
  renderCart();
}

document.addEventListener('DOMContentLoaded', init);