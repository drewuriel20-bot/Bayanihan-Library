// ============================================================
// DATA & STATE
// ============================================================
const BOOKS = [
  { id:1, title:'Noli Me Tangere', author:'José Rizal', genre:'Filipino Lit', year:1887, copies:3, available:1, emoji:'📘', rating:4.9, desc:'A social novel that exposed the injustices of colonial rule in the Philippines.' },
  { id:2, title:'El Filibusterismo', author:'José Rizal', genre:'Filipino Lit', year:1891, copies:2, available:0, emoji:'📕', rating:4.8, desc:'The sequel to Noli Me Tangere, depicting the rise of Filipino nationalism.' },
  { id:3, title:'Florante at Laura', author:'Francisco Balagtas', genre:'Filipino Lit', year:1838, copies:4, available:2, emoji:'📙', rating:4.7, desc:'An epic awit poem set in the fictional kingdom of Albania.' },
  { id:4, title:'Ibong Adarna', author:'Anonymous', genre:'Filipino Lit', year:1800, copies:3, available:3, emoji:'📗', rating:4.6, desc:'A classic Filipino narrative poem about a magical bird.' },
  { id:5, title:'The Alchemist', author:'Paulo Coelho', genre:'Fiction', year:1988, copies:5, available:2, emoji:'✨', rating:4.7, desc:"A philosophical novel about a young shepherd's journey to find treasure." },
  { id:6, title:'Sapiens', author:'Yuval Noah Harari', genre:'Non-fiction', year:2011, copies:3, available:1, emoji:'🌏', rating:4.5, desc:'A brief history of humankind from the Stone Age to the present.' }
];

let currentUser = null;
let books = [...BOOKS];
let editingBookId = null;

// ============================================================
// NAVIGATION
// ============================================================
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo(0, 0);
}

function scrollAbout() {
  goTo('home');
  setTimeout(() => {
    document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' });
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
// AUTHENTICATION
// ============================================================
function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value.trim();
  if (!u || !p) { showToast('Please enter your username and password.', 'error'); return; }
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
  const lname = document.getElementById('reg-lname').value.trim();
  if (!fname || !lname) { showToast('Please fill in required fields.', 'error'); return; }
  currentUser = { name: fname + ' ' + lname, firstName: fname, email: 'user@email.com', isAdmin: false };
  setLoggedIn();
  goTo('dashboard');
  showToast('Account created! Welcome, ' + fname + '!', 'success');
}

function setLoggedIn() {
  document.getElementById('nav-guest').style.display = 'none';
  document.getElementById('nav-user').style.display = 'flex';
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('navAvatar').textContent = initials;
  document.getElementById('dashAvatar').textContent = initials;
  document.getElementById('dashName').textContent = currentUser.name;
  document.getElementById('dashEmail').textContent = currentUser.email;
  document.getElementById('dashFirst').textContent = currentUser.firstName;
  if (currentUser.isAdmin) {
    document.getElementById('adminNavBtn').style.display = '';
  }
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
// CATALOG RENDERING
// ============================================================
function renderCatalog(list) {
  const grid = document.getElementById('book-grid');
  const count = document.getElementById('catalog-count');
  if (!list || list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--ink-muted);">No books found matching your search.</div>';
    count.textContent = '';
    return;
  }
  count.textContent = list.length + ' book' + (list.length !== 1 ? 's' : '') + ' found';
  
  // Adjusted background colors for Mandaluyong theme compatibility
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
  const avail = document.getElementById('catalog-avail').value;
  const sort = document.getElementById('catalog-sort').value;
  
  let list = books.filter(b => {
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchG = !genre || b.genre === genre;
    const matchA = !avail || (avail === 'available' ? b.available > 0 : b.available === 0);
    return matchQ && matchG && matchA;
  });
  
  if (sort === 'author') list.sort((a,b) => a.author.localeCompare(b.author));
  else if (sort === 'rating') list.sort((a,b) => b.rating - a.rating);
  else if (sort === 'new') list.sort((a,b) => b.year - a.year);
  else list.sort((a,b) => a.title.localeCompare(b.title));
  
  renderCatalog(list);
}

// ============================================================
// MODALS & ACTIONS
// ============================================================
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

function openBookDetail(id) {
  const b = books.find(x => x.id === id);
  if (!b) return;
  const avail = b.available > 0;
  
  document.getElementById('borrow-book-title').textContent = b.title;
  document.getElementById('borrow-book-author').textContent = 'by ' + b.author;
  document.getElementById('borrow-modal-body').innerHTML = `
    <div style="display:flex; gap:1.25rem; align-items:flex-start; margin-bottom:1.25rem;">
      <div style="font-size:4rem; width:80px; height:100px; background:var(--paper-warm); border-radius:var(--radius); display:flex; align-items:center; justify-content:center; flex-shrink:0;">${b.emoji}</div>
      <div style="flex:1;">
        <span class="badge ${avail?'badge-green':'badge-red'}">${avail ? b.available+' copies' : 'Checked out'}</span>
        <p style="font-size:14px; color:var(--ink-soft); margin-top:10px;">${b.desc}</p>
      </div>
    </div>`;
    
  document.getElementById('borrow-modal-footer').innerHTML = currentUser
    ? (avail
        ? `<button class="btn btn-outline" onclick="closeModal('borrow-modal')">Close</button>
           <button class="btn btn-primary" onclick="borrowBook(${b.id})">Borrow this book</button>`
        : `<button class="btn btn-outline" onclick="closeModal('borrow-modal')">Close</button>
           <button class="btn btn-primary" onclick="closeModal('borrow-modal'); showToast('Hold placed!', 'success')">Place hold</button>`)
    : `<button class="btn btn-outline" onclick="closeModal('borrow-modal')">Close</button>
       <button class="btn btn-primary" onclick="closeModal('borrow-modal'); goTo('login')">Sign in to borrow</button>`;
       
  openModal('borrow-modal');
}

function borrowBook(id) {
  const b = books.find(x => x.id === id);
  if (b && b.available > 0) {
    b.available--;
    closeModal('borrow-modal');
    showToast('Borrowed successfully!', 'success');
    filterCatalog();
    renderAdminBooks();
  }
}

// ============================================================
// ADMIN CONTROLS
// ============================================================
function renderAdminBooks() {
  const tbody = document.getElementById('admin-book-tbody');
  tbody.innerHTML = books.map(b => `
    <tr>
      <td><strong>${b.title}</strong></td>
      <td>${b.author}</td>
      <td><span class="badge badge-gray">${b.genre}</span></td>
      <td>${b.year}</td>
      <td>${b.copies}</td>
      <td>${b.available}</td>
      <td><span class="badge ${b.available>0?'badge-green':'badge-red'}">${b.available>0?'Available':'Unavailable'}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteBook(${b.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  books = books.filter(b => b.id !== id);
  renderAdminBooks();
  filterCatalog();
  showToast('Book removed.', 'success');
}

function openBookModal() {
  document.getElementById('modal-book-title').value = '';
  document.getElementById('modal-book-author').value = '';
  openModal('book-modal');
}

function saveBook() {
  const title = document.getElementById('modal-book-title').value.trim();
  const author = document.getElementById('modal-book-author').value.trim();
  if (!title || !author) { showToast('Title and author required.', 'error'); return; }
  
  books.push({
    id: Date.now(), title, author, genre: 'Fiction', year: 2026, copies: 1, available: 1, emoji: '📘', rating: 0, desc: 'New addition.'
  });
  
  closeModal('book-modal');
  renderAdminBooks();
  filterCatalog();
  showToast('Book added!', 'success');
}

// ============================================================
// TOAST SYSTEM
// ============================================================
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

// Initialize System
renderCatalog(books);
renderAdminBooks();