// ============================================================
// DATA & STATE
// ============================================================
const BOOKS = [
  { id:1, title:'Noli Me Tangere', author:'José Rizal', genre:'Filipino Lit', year:1887, copies:3, available:1, emoji:'📘', desc:'A social novel that exposed the injustices of colonial rule.' },
  { id:2, title:'El Filibusterismo', author:'José Rizal', genre:'Filipino Lit', year:1891, copies:2, available:0, emoji:'📕', desc:'The sequel to Noli Me Tangere, depicting rising nationalism.' },
  { id:3, title:'Florante at Laura', author:'Francisco Balagtas', genre:'Filipino Lit', year:1838, copies:4, available:2, emoji:'📙', desc:'An epic awit poem set in the kingdom of Albania.' },
  { id:4, title:'Ibong Adarna', author:'Anonymous', genre:'Filipino Lit', year:1800, copies:3, available:3, emoji:'📗', desc:'A classic Filipino narrative poem about a magical bird.' },
  { id:5, title:'The Alchemist', author:'Paulo Coelho', genre:'Fiction', year:1988, copies:5, available:2, emoji:'✨', desc:"A philosophical novel about a young shepherd's journey." },
  { id:6, title:'Sapiens', author:'Yuval Noah Harari', genre:'Non-fiction', year:2011, copies:3, available:1, emoji:'🌏', desc:'A brief history of humankind from the Stone Age to modern times.' }
];

let currentUser = null;
let books = [...BOOKS];

// ============================================================
// NAVIGATION CORE
// ============================================================
function goTo(page, skipScroll = false) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  
  // Kung hindi galing sa About button, doon lang ito mag-scoscroll sa top window
  if (!skipScroll) {
    window.scrollTo(0, 0);
  }
}

// BULLETPROOF SCROLLABOUT FUNCTION
function scrollAbout() {
  // 1. Lumipat sa Home Page nang hindi pinapagana ang default top layout scroll
  goTo('home', true);
  
  // 2. Patakbuhin ang scrollIntoView matapos ma-render nang maayos ang active page block
  setTimeout(() => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      console.log("System Status: Smooth scroll executed successfully.");
    } else {
      console.error("System Error: target 'about-section' element id cannot be found.");
    }
  }, 100);
}

function showDashSection(id) {
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  const map = { 'ds-overview':'sn-overview', 'ds-borrowed':'sn-borrowed' };
  if (document.getElementById(map[id])) document.getElementById(map[id]).classList.add('active');
}

function showAdminSection(id) {
  document.querySelectorAll('#page-admin .dash-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('#page-admin .sidebar-nav a').forEach(a => a.classList.remove('active'));
  const map = { 'as-overview':'asn-overview', 'as-books':'asn-books' };
  if (document.getElementById(map[id])) document.getElementById(map[id]).classList.add('active');
}

// ============================================================
// SYSTEM AUTHENTICATION
// ============================================================
function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  if (!u) { showToast('Please enter your username.', 'error'); return; }
  currentUser = { name: u, firstName: u.split(' ')[0] || u, email: u + '@email.com', isAdmin: false };
  setLoggedIn();
  goTo('dashboard');
  showToast('Welcome back, ' + currentUser.firstName + '!', 'success');
}

function doAdminLogin() {
  currentUser = { name: 'Admin', firstName: 'Admin', email: 'admin@libralend.ph', isAdmin: true };
  setLoggedIn();
  goTo('admin');
  showToast('Logged in as Administrator.', 'success');
}

function doRegister() {
  const fname = document.getElementById('reg-fname').value.trim();
  if (!fname) { showToast('Please enter your first name.', 'error'); return; }
  currentUser = { name: fname, firstName: fname, email: 'user@email.com', isAdmin: false };
  setLoggedIn();
  goTo('dashboard');
  showToast('Account created! Welcome, ' + fname + '!', 'success');
}

function setLoggedIn() {
  document.getElementById('nav-guest').style.display = 'none';
  document.getElementById('nav-user').style.display = 'flex';
  const initials = currentUser.name.slice(0,2).toUpperCase();
  document.getElementById('navAvatar').textContent = initials;
  document.getElementById('dashAvatar').textContent = initials;
  document.getElementById('dashName').textContent = currentUser.name;
  document.getElementById('dashEmail').textContent = currentUser.email;
  document.getElementById('dashFirst').textContent = currentUser.firstName;
  if (currentUser.isAdmin) document.getElementById('adminNavBtn').style.display = '';
}

function logout() {
  currentUser = null;
  document.getElementById('nav-guest').style.display = 'flex';
  document.getElementById('nav-user').style.display = 'none';
  document.getElementById('adminNavBtn').style.display = 'none';
  goTo('home');
  showToast('You have been signed out.');
}

// ============================================================
// ENGINE SYSTEM INTERACTION
// ============================================================
function renderCatalog(list) {
  const grid = document.getElementById('book-grid');
  const count = document.getElementById('catalog-count');
  if (!grid) return;
  if (!list || list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--ink-muted);">No books found.</div>';
    count.textContent = '';
    return;
  }
  count.textContent = list.length + ' book(s) found';
  const coverBg = { 'Filipino Lit':'#fef3c7','Fiction':'#e0f2fe','Non-fiction':'#d1fae5' };
  
  grid.innerHTML = list.map(b => {
    const avail = b.available > 0;
    return `<div class="book-card" onclick="openBookDetail(${b.id})">
      <div class="book-cover" style="background:${coverBg[b.genre]||'#f1f5f9'}">
        <span style="font-size:3.5rem;">${b.emoji}</span>
        <span class="badge ${avail?'badge-green':'badge-red'} avail-badge">${avail?'Available':'Checked out'}</span>
      </div>
      <div class="book-info">
        <h4>${b.title}</h4>
        <p style="font-size:12px; color:var(--ink-muted); margin-bottom:8px;">${b.author}</p>
        <span class="badge badge-gray">${b.genre}</span>
      </div>
    </div>`;
  }).join('');
}

function filterCatalog() {
  const q = document.getElementById('catalog-search').value.toLowerCase();
  const genre = document.getElementById('catalog-genre').value;
  let list = books.filter(b => (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) && (!genre || b.genre === genre));
  renderCatalog(list);
}

function openBookDetail(id) {
  const b = books.find(x => x.id === id);
  if (!b) return;
  const avail = b.available > 0;
  document.getElementById('borrow-book-title').textContent = b.title;
  document.getElementById('borrow-modal-body').innerHTML = `<p>${b.desc}</p><br><span class="badge badge-gray">${b.genre}</span>`;
  document.getElementById('borrow-modal-footer').innerHTML = `<button class="btn btn-outline" onclick="closeModal('borrow-modal')">Close</button>`;
  openModal('borrow-modal');
}

function renderAdminBooks() {
  const tbody = document.getElementById('admin-book-tbody');
  if (!tbody) return;
  tbody.innerHTML = books.map(b => `<tr><td>${b.title}</td><td>${b.author}</td><td>${b.genre}</td><td><button class="btn btn-danger btn-sm" onclick="deleteBook(${b.id})">Delete</button></td></tr>`).join('');
}

function deleteBook(id) {
  books = books.filter(b => b.id !== id);
  renderAdminBooks();
  filterCatalog();
  showToast('Book removed.', 'success');
}

function openBookModal() { openModal('book-modal'); }
function saveBook() {
  const title = document.getElementById('modal-book-title').value.trim();
  const author = document.getElementById('modal-book-author').value.trim();
  if (!title || !author) return;
  books.push({ id: Date.now(), title, author, genre: 'Fiction', year: 2026, copies: 1, available: 1, emoji: '📘', desc: 'Added.' });
  closeModal('book-modal');
  renderAdminBooks();
  filterCatalog();
  showToast('Book added!', 'success');
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

let toastTimer;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  const m = document.getElementById('toast-msg');
  t.className = '';
  if (type) t.classList.add(type);
  m.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// Initialization Run
renderCatalog(books);
renderAdminBooks();
