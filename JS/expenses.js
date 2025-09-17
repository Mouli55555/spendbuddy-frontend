/* ============================================================
   SpendBuddy Expenses Page Script - FINAL FIXED VERSION
   Handles expense listing, filtering, pagination, and modals
   Dependencies: config.js, api.js
============================================================ */

/* --------------------------
   Global State
-------------------------- */
const expensesState = {
  allExpenses: [],
  filteredExpenses: [],
  categories: [],
  paymentTypes: [],
  currentPage: 1,
  itemsPerPage: 10,
  currentView: 'list',
  filters: {
    dateRange: 'all',
    category: 'all',
    payment: 'all',
    sort: 'date-desc',
    startDate: null,
    endDate: null
  },
  isSubmitting: false
};

/* --------------------------
   Initialization
-------------------------- */
async function initExpensesPage() {
  try {
    // Check authentication
    if (!api.isAuthenticated()) {
      window.location.href = '../Components/auth.html';
      return;
    }

    // Display username
    const username = localStorage.getItem(CONFIG.STORAGE_KEYS.USERNAME) || 'User';
    document.getElementById('username').textContent = username;

    // Show loading
    document.getElementById('loadingSpinner').style.display = 'block';

    // Load data
    await Promise.all([loadAllExpenses(), loadCategories(), loadPaymentTypes()]);

    // Initialize UI
    populateFilterDropdowns();
    applyFilters();
    setupEventListeners();

    // Hide loading
    document.getElementById('loadingSpinner').style.display = 'none';

    CONFIG.utils.log('info', 'Expenses page initialized');
  } catch (error) {
    CONFIG.utils.log('error', 'Initialization failed', error);
    document.getElementById('loadingSpinner').innerHTML = 'Failed to load expenses data';
  }
}

/* --------------------------
   Data Loading
-------------------------- */
async function loadAllExpenses() {
  const result = await api.getExpenses();
  if (result.success) {
    expensesState.allExpenses = result.data || [];
    expensesState.filteredExpenses = [...expensesState.allExpenses];
  } else {
    throw new Error(result.error || 'Failed to fetch expenses');
  }
}

async function loadCategories() {
  const result = await api.getCategories();
  if (result.success) expensesState.categories = result.data || [];
}

async function loadPaymentTypes() {
  const result = await api.getPaymentTypes();
  if (result.success) expensesState.paymentTypes = result.data || [];
}

/* --------------------------
   UI Setup
-------------------------- */
function populateFilterDropdowns() {
  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  expensesState.categories.forEach(cat => {
    categoryFilter.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
  });

  // Payment filter
  const paymentFilter = document.getElementById('paymentFilter');
  paymentFilter.innerHTML = '<option value="all">All Methods</option>';
  expensesState.paymentTypes.forEach(pt => {
    paymentFilter.innerHTML += `<option value="${pt.type}">${pt.type}</option>`;
  });

  populateExpenseFormDropdowns();
}

function populateExpenseFormDropdowns() {
  const categorySelect = document.getElementById('expenseCategory');
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  expensesState.categories.forEach(cat => {
    categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });

  const paymentSelect = document.getElementById('expensePayment');
  paymentSelect.innerHTML = '<option value="">Select Payment Method</option>';
  expensesState.paymentTypes.forEach(pt => {
    paymentSelect.innerHTML += `<option value="${pt.id}">${pt.type}</option>`;
  });

  const dateInput = document.getElementById('expenseDate');
  if (dateInput) dateInput.valueAsDate = new Date();
}

function setupEventListeners() {
  // Date filter -> toggle custom range
  document.getElementById('dateFilter').addEventListener('change', e => {
    const customRange = document.getElementById('customDateRange');
    if (customRange) customRange.style.display = e.target.value === 'custom' ? 'block' : 'none';
  });

  // Expense form
  document.getElementById('addExpenseForm').addEventListener('submit', handleAddExpense);

  // Close modals on overlay click
  document.getElementById('addExpenseModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAddExpenseModal();
  });
  document.getElementById('expenseDetailModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeExpenseDetailModal();
  });

  // Fix cancel button colors
  fixCancelButtonColors();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAddExpenseModal();
      closeExpenseDetailModal();
    }
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      openAddExpenseModal();
    }
  });
}

function fixCancelButtonColors() {
  // Fix cancel buttons that might be blending with background
  const cancelButtons = document.querySelectorAll('button[onclick*="close"], button[type="button"]');
  cancelButtons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('cancel') || btn.textContent.toLowerCase().includes('close')) {
      btn.style.backgroundColor = '#6b7280';
      btn.style.color = '#ffffff';
      btn.style.border = '1px solid #6b7280';
    }
  });
}

/* --------------------------
   Filters
-------------------------- */
function applyFilters() {
  const dateFilter = document.getElementById('dateFilter').value;
  const categoryFilter = document.getElementById('categoryFilter').value;
  const paymentFilter = document.getElementById('paymentFilter').value;
  const sortFilter = document.getElementById('sortFilter').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  expensesState.filters = { dateRange: dateFilter, category: categoryFilter, payment: paymentFilter, sort: sortFilter, startDate, endDate };

  let filtered = [...expensesState.allExpenses];


    console.log("hiii", filtered, " " , categoryFilter," ",paymentFilter);
  // Date filter
  if (dateFilter !== 'all') filtered = filterByDate(filtered, dateFilter, startDate, endDate);


  // Category filter (using categoryId)
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(exp => String(exp.categoryName) === String(categoryFilter));
  }

  // Payment filter (using paymentId)
  if (paymentFilter !== 'all') {
    filtered = filtered.filter(exp => String(exp.paymentType) === String(paymentFilter));
  }

  // Sorting
  filtered = sortExpenses(filtered, sortFilter);

  expensesState.filteredExpenses = filtered;
  expensesState.currentPage = 1;

  updateQuickStats();
  displayExpenses();
  updatePagination();
}

function filterByDate(expenses, dateRange, startDate, endDate) {
  const now = new Date();
  let filterStart, filterEnd;

  switch (dateRange) {
    case 'current-month':
      filterStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filterEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'last-month':
      filterStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filterEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'current-year':
      filterStart = new Date(now.getFullYear(), 0, 1);
      filterEnd = new Date(now.getFullYear(), 11, 31);
      break;
    case 'custom':
      if (startDate) filterStart = new Date(startDate);
      if (endDate) filterEnd = new Date(endDate);
      break;
  }

  if (filterStart) filterStart.setHours(0, 0, 0, 0);
  if (filterEnd) filterEnd.setHours(23, 59, 59, 999);

  return expenses.filter(exp => {
    const expDate = new Date(exp.expenseDate);
    if (filterStart && expDate < filterStart) return false;
    if (filterEnd && expDate > filterEnd) return false;
    return true;
  });
}

/* --------------------------
   Sorting
-------------------------- */
function sortExpenses(expenses, sortKey) {
  const arr = [...expenses];
  switch (sortKey) {
    case 'date-desc':
      arr.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
      break;
    case 'date-asc':
      arr.sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate));
      break;
    case 'amount-desc':
      arr.sort((a, b) => parseFloat(b.expenseAmount) - parseFloat(a.expenseAmount));
      break;
    case 'amount-asc':
      arr.sort((a, b) => parseFloat(a.expenseAmount) - parseFloat(b.expenseAmount));
      break;
  }
  return arr;
}

/* --------------------------
   Display & Pagination
-------------------------- */
function displayExpenses() {
  const container = document.getElementById('expensesList');
  const { filteredExpenses, currentPage, itemsPerPage } = expensesState;

  container.innerHTML = '';

  if (!filteredExpenses.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3>No expenses found</h3>
        <p>Try adjusting filters or add your first expense!</p>
        <button class="btn btn-primary" onclick="openAddExpenseModal()">Add Expense</button>
      </div>`;
    document.getElementById('pagination').style.display = 'none';
    updateResultsCount(0);
    return;
  }

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, filteredExpenses.length);
  const pageItems = filteredExpenses.slice(startIdx, endIdx);

  updateResultsCount(filteredExpenses.length);

  pageItems.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      <div class="expense-info">
        <div class="expense-icon">💳</div>
        <div class="expense-details">
          <h4>${escapeHtml(exp.expenseDescription || 'No description')}</h4>
          <div class="expense-meta">
            <span>📅 ${formatDate(exp.expenseDate)}</span>
            <span>🏷️ ${exp.categoryName}</span>
            <span>💳 ${exp.paymentType}</span>
          </div>
        </div>
      </div>
      <div class="expense-amount">
        <div>${formatCurrency(exp.expenseAmount)}</div>
        <div class="expense-actions">
          <button class="btn btn-primary" onclick="openExpenseDetailModal('${exp.id}')">View</button>
        </div>
      </div>`;
    container.appendChild(item);
  });
}

function updatePagination() {
  const { filteredExpenses, currentPage, itemsPerPage } = expensesState;
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));

  const pagination = document.getElementById('pagination');
  const pageInfo = document.getElementById('pageInfo');

  if (filteredExpenses.length <= itemsPerPage) {
    pagination.style.display = 'none';
    return;
  }

  pagination.style.display = 'flex';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevBtn').disabled = currentPage <= 1;
  document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

function changePage(dir) {
  const totalPages = Math.max(1, Math.ceil(expensesState.filteredExpenses.length / expensesState.itemsPerPage));
  let newPage = expensesState.currentPage + dir;
  if (newPage < 1) newPage = 1;
  if (newPage > totalPages) newPage = totalPages;
  expensesState.currentPage = newPage;
  displayExpenses();
  updatePagination();
}

/* --------------------------
   Quick Stats
-------------------------- */
function updateQuickStats() {
  const arr = expensesState.filteredExpenses;
  const total = arr.reduce((s, e) => s + (parseFloat(e.expenseAmount) || 0), 0);
  const count = arr.length;
  const avg = count ? total / count : 0;

  document.getElementById('totalAllExpenses').textContent = formatCurrency(total);
  document.getElementById('totalAllTransactions').textContent = count;
  document.getElementById('avgTransactionAmount').textContent = formatCurrency(avg);
}

/* --------------------------
   Helpers
-------------------------- */
function getCategoryName(id) {
  const cat = expensesState.categories.find(c => String(c.id) === String(id));
  return cat ? cat.name : 'Unknown';
}

function getPaymentName(id) {
  const pt = expensesState.paymentTypes.find(p => String(p.id) === String(id));
  return pt ? pt.type : 'Unknown';
}

function formatCurrency(value) {
  return CONFIG.utils.formatCurrency(Number(value) || 0);
}

function formatDate(dateStr) {
  return dateStr ? CONFIG.utils.formatDate(dateStr) : 'Unknown';
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* --------------------------
   Modals
-------------------------- */
function openAddExpenseModal() {
  const modal = document.getElementById('addExpenseModal');
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  document.getElementById('addExpenseForm').reset();
  document.getElementById('expenseDate').valueAsDate = new Date();
}
function closeAddExpenseModal() {
  document.getElementById('addExpenseModal').style.display = 'none';
}
function openExpenseDetailModal(id) {
  const exp = expensesState.allExpenses.find(e => String(e.id) === String(id));
  const content = document.getElementById('expenseDetailContent');
  if (!exp) {
    content.innerHTML = '<div class="empty-state">Expense not found</div>';
  } else {
    content.innerHTML = `
      <div class="detail-row"><div class="detail-label">Date:</div><div class="detail-value">${formatDate(exp.expenseDate)}</div></div>
      <div class="detail-row"><div class="detail-label">Amount:</div><div class="detail-value">${formatCurrency(exp.expenseAmount)}</div></div>
      <div class="detail-row"><div class="detail-label">Description:</div><div class="detail-value">${escapeHtml(exp.expenseDescription)}</div></div>
      <div class="detail-row"><div class="detail-label">Category:</div><div class="detail-value">${exp.categoryName}</div></div>
      <div class="detail-row"><div class="detail-label">Payment:</div><div class="detail-value">${exp.paymentType}</div></div>`;
  }
  const modal = document.getElementById('expenseDetailModal');
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
}
function closeExpenseDetailModal() {
  document.getElementById('expenseDetailModal').style.display = 'none';
}

/* --------------------------
   Add Expense
-------------------------- */
async function handleAddExpense(e) {
  e.preventDefault();
  
  if (expensesState.isSubmitting) return;
  
  expensesState.isSubmitting = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Adding...';
  submitBtn.disabled = true;
  
  try {
    const formData = new FormData(e.target);
    const data = {
      amount: parseFloat(formData.get('amount')),
      expenseDescription: formData.get('expenseDescription'),
      categoryId: parseInt(formData.get('categoryId')),
      paymentId: parseInt(formData.get('paymentId')),
      subCategoryId: 1,
      expenseDate: formData.get('expenseDate')
    };

    if (!data.amount || data.amount <= 0) return showError('Enter a valid amount');
    if (!data.expenseDescription.trim()) return showError('Enter description');
    if (!data.categoryId) return showError('Select a category');
    if (!data.paymentId) return showError('Select a payment method');

    const result = await api.createExpense(data);
    if (result.success) {
      showSuccess('Expense added');
      closeAddExpenseModal();
      await loadAllExpenses();
      applyFilters();
    } else {
      showError(result.error || 'Failed to add expense');
    }
  } finally {
    expensesState.isSubmitting = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

/* --------------------------
   Utility
-------------------------- */
function updateResultsCount(count) {
  document.getElementById('resultsCount').textContent = count;
}
function resetFilters() {
  document.getElementById('dateFilter').value = 'all';
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('paymentFilter').value = 'all';
  document.getElementById('sortFilter').value = 'date-desc';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  document.getElementById('customDateRange').style.display = 'none';
  applyFilters();
}
function goBack() {
  window.location.href = '../Components/dashboard.html';
}

/* --------------------------
   Toasts
-------------------------- */
function showError(msg) { showToast(msg, 'error'); }
function showSuccess(msg) { showToast(msg, 'success'); }

function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      display: flex; flex-direction: column; gap: 10px;`;
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: 12px 20px; border-radius: 8px; color: white; font-weight: 600;
    max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideInRight 0.3s ease-out;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); if (!container.children.length) container.remove(); }, 3000);
}

const style = document.createElement('style');
style.textContent = `@keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1}}`;
document.head.appendChild(style);

/* --------------------------
   Init
-------------------------- */
document.addEventListener('DOMContentLoaded', initExpensesPage);