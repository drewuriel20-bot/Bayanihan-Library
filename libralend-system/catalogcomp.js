// --- LIVE ASSET ARCHIVE DATABASES ---
let catalogBooks = [
  { id: 1, title: "Noli Me Tangere", author: "José Rizal", genre: "Filipino Lit", year: 1887, copies: 3, available: 1, status: "Available" },
  { id: 2, title: "El Filibusterismo", author: "José Rizal", genre: "Filipino Lit", year: 1891, copies: 2, available: 0, status: "Unavailable" },
  { id: 3, title: "Florante at Laura", author: "Francisco Balagtas", genre: "Filipino Lit", year: 1838, copies: 4, available: 2, status: "Available" },
  { id: 4, title: "Ibong Adarna", author: "Anonymous", genre: "Filipino Lit", year: 1800, copies: 3, available: 3, status: "Available" },
  { id: 5, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", year: 1988, copies: 5, available: 2, status: "Available" },
  { id: 6, title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-fiction", year: 2011, copies: 3, available: 1, status: "Available" },
  { id: 7, title: "Harry Potter & the Sorcerer's Stone", author: "J.K. Rowling", genre: "Fantasy", year: 1997, copies: 4, available: 3, status: "Available" },
  { id: 8, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", genre: "Self-Help", year: 1997, copies: 3, available: 2, status: "Available" }
];

let borrowTransactions = [
  { id: "TX-1002", member: "Maria Clara", title: "El Filibusterismo", borrowDate: "2026-06-02", dueDate: "2026-06-16", status: "Active" },
  { id: "TX-1005", member: "Crisostomo Ibarra", title: "Noli Me Tangere", borrowDate: "2026-05-14", dueDate: "2026-05-28", status: "Overdue" }
];

// --- NAVIGATION MANAGER ---
function switchAdminTab(targetTab) {
  // Update sidebar highlighting
  document.querySelectorAll('.sidebar-nav a').forEach(el => el.classList.remove('active'));
  if (event) event.currentTarget.classList.add('active');
  
  // Toggle layout sections
  document.querySelectorAll('.tab-content').forEach(panel => panel.classList.remove('active'));
  
  const targetPanel = document.getElementById(`admin-${targetTab}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  } else {
    // Fallback if tab view isn't fully created yet
    document.getElementById('admin-books').classList.add('active');
  }
  
  if (targetTab === 'books') renderAdminBooks(catalogBooks);
  if (targetTab === 'borrowed') renderAdminBorrowedLogs();
}

// --- RENDERING MANAGER: BOOKS TABLE ---
function renderAdminBooks(dataset) {
  const tbody = document.getElementById('admin-books-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = dataset.map(book => {
    const statusClass = book.status === 'Available' ? 'badge-green' : 'badge-red';
    return `
      <tr>
        <td style="font-weight: 600; color: #000;">${book.title}</td>
        <td style="color: #444;">${book.author}</td>
        <td><span class="badge badge-genre">${book.genre}</span></td>
        <td>${book.year}</td>
        <td>${book.copies}</td>
        <td>${book.available}</td>
        <td><span class="badge ${statusClass}">${book.status}</span></td>
        <td class="text-right">
          <div class="actions-cell">
            <button class="btn-action" onclick="openEditBookModal(${book.id})" title="Edit Book">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteBookAsset(${book.id})" title="Delete Book">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --- CLIENT-SIDE REAL-TIME SEARCH & FILTER SYSTEM ---
function filterBooksTable() {
  const searchQuery = document.getElementById('catalog-search').value.toLowerCase();
  const selectedGenre = document.getElementById('genre-filter').value;

  const filteredData = catalogBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery) || 
                          book.author.toLowerCase().includes(searchQuery);
    const matchesGenre = (selectedGenre === "All genres") || (book.genre === selectedGenre);
    
    return matchesSearch && matchesGenre;
  });

  renderAdminBooks(filteredData);
}

// --- RENDERING MANAGER: BORROW LOGS ---
function renderAdminBorrowedLogs() {
  const tbody = document.getElementById('admin-borrowed-tbody');
  if (!tbody) return;

  tbody.innerHTML = borrowTransactions.map(tx => {
    const badgeStyle = tx.status === 'Active' ? 'badge-green' : 'badge-red';
    return `
      <tr>
        <td><code>${tx.id}</code></td>
        <td style="font-weight:600;">${tx.member}</td>
        <td>${tx.title}</td>
        <td>${tx.borrowDate}</td>
        <td>${tx.dueDate}</td>
        <td><span class="badge ${badgeStyle}">${tx.status}</span></td>
        <td class="text-right">
          ${tx.status !== 'Returned' ? 
            `<button class="btn btn-outline btn-sm" onclick="processReturn('${tx.id}')">Process Return</button>` : 
            `<span style="color:var(--ink-muted); font-size:12px;">Closed</span>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

// --- MODAL DIALOG OPERATIONS ---
function openAddBookModal() {
  document.getElementById('bookModalTitle').innerText = "Add New Catalog Title";
  document.getElementById('modal-book-id').value = "";
  document.getElementById('modal-book-title').value = "";
  document.getElementById('modal-book-author').value = "";
  document.getElementById('modal-book-genre').value = "Filipino Lit";
  document.getElementById('modal-book-year').value = new Date().getFullYear();
  document.getElementById('modal-book-copies').value = "1";
  document.getElementById('modal-book-available').value = "1";
  document.getElementById('modal-book-status').value = "Available";
  document.getElementById('bookModal').classList.add('open');
}

function openEditBookModal(id) {
  const book = catalogBooks.find(b => b.id === id);
  if (!book) return;

  document.getElementById('bookModalTitle').innerText = "Edit Book Details";
  document.getElementById('modal-book-id').value = book.id;
  document.getElementById('modal-book-title').value = book.title;
  document.getElementById('modal-book-author').value = book.author;
  document.getElementById('modal-book-genre').value = book.genre;
  document.getElementById('modal-book-year').value = book.year;
  document.getElementById('modal-book-copies').value = book.copies;
  document.getElementById('modal-book-available').value = book.available;
  document.getElementById('modal-book-status').value = book.status;
  document.getElementById('bookModal').classList.add('open');
}

function closeBookModal() {
  document.getElementById('bookModal').classList.remove('open');
}

function syncAvailableMax() {
  // Front-end constraint validator helper
  const total = document.getElementById('modal-book-copies').value;
  document.getElementById('modal-book-available').maxValue = total;
}

function saveBookData() {
  const idValue = document.getElementById('modal-book-id').value;
  const title = document.getElementById('modal-book-title').value;
  const author = document.getElementById('modal-book-author').value;
  const genre = document.getElementById('modal-book-genre').value;
  const year = parseInt(document.getElementById('modal-book-year').value) || 2026;
  const copies = parseInt(document.getElementById('modal-book-copies').value) || 0;
  const available = parseInt(document.getElementById('modal-book-available').value) || 0;
  const status = document.getElementById('modal-book-status').value;

  if (!title || !author) {
    alert("Please fill in the missing asset labels.");
    return;
  }

  if (idValue) {
    let idx = catalogBooks.findIndex(b => b.id == idValue);
    if (idx !== -1) {
      catalogBooks[idx] = { id: parseInt(idValue), title, author, genre, year, copies, available, status };
    }
  } else {
    const nextId = catalogBooks.length > 0 ? Math.max(...catalogBooks.map(b => b.id)) + 1 : 1;
    catalogBooks.push({ id: nextId, title, author, genre, year, copies, available, status });
  }

  closeBookModal();
  renderAdminBooks(catalogBooks);
}

function deleteBookAsset(id) {
  if (confirm("Are you certain you want to delete this title listing?")) {
    catalogBooks = catalogBooks.filter(b => b.id !== id);
    renderAdminBooks(catalogBooks);
  }
}

function processReturn(txnId) {
  const tx = borrowTransactions.find(t => t.id === txnId);
  if (tx) {
    tx.status = "Returned";
    alert(`Return cleared for transaction item: ${tx.title}`);
    renderAdminBorrowedLogs();
  }
}

// Dynamic initialization loop hook
document.addEventListener("DOMContentLoaded", () => {
  renderAdminBooks(catalogBooks);
});