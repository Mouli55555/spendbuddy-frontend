/* ============================================================
   SpendBuddy Dashboard Script
   Handles initialization, data loading, UI updates & charts
   Dependencies: config.js, api.js, Chart.js
============================================================ */

/* --------------------------
   Global Variables
-------------------------- */
let trendChart, categoryChart;

const dashboardState = {
  expenses: [],
  categories: [],
  paymentTypes: [],
  currentMonthExpenses: [],
  loading: true,
  isSubmitting: {
    expense: false,
    category: false,
    payment: false
  }
};

/* --------------------------
   Initialization
-------------------------- */
async function initDashboard() {
  try {
    // Check authentication
    if (!api.isAuthenticated()) {
      window.location.href = "../Components/auth.html";
      return;
    }

    // Display username
    const username =
      localStorage.getItem(CONFIG.STORAGE_KEYS.USERNAME) || "User";
    document.getElementById("username").textContent = username;

    // Load data in parallel
    await Promise.all([
      loadCurrentMonthExpenses(),
      loadCategories(),
      loadPaymentTypes(),
      loadAllExpenses(),
    ]);

    // Update UI
    updateStats();
    initializeCharts();
    displayRecentExpenses();
    populateDropdowns();

    dashboardState.loading = false;
    CONFIG.utils.log("info", "Dashboard initialized successfully");
  } catch (error) {
    CONFIG.utils.log("error", "Dashboard initialization failed", error);
    showError("Failed to load dashboard data");
  }
}

/* --------------------------
   Data Loading Functions
-------------------------- */
async function loadCurrentMonthExpenses() {
  const result = await api.getCurrentMonthExpenses();
  if (result.success) {
    dashboardState.currentMonthExpenses = result.data || [];
  } else {
    CONFIG.utils.log(
      "error",
      "Failed to load current month expenses",
      result.error
    );
  }
}

async function loadAllExpenses() {
  const result = await api.getExpenses();
  if (result.success) {
    dashboardState.expenses = result.data || [];
  } else {
    CONFIG.utils.log("error", "Failed to load expenses", result.error);
  }
}

async function loadCategories() {
  const result = await api.getCategories();
  if (result.success) {
    dashboardState.categories = result.data || [];
  } else {
    CONFIG.utils.log("error", "Failed to load categories", result.error);
  }
}

async function loadPaymentTypes() {
  const result = await api.getPaymentTypes();
  if (result.success) {
    dashboardState.paymentTypes = result.data || [];
  } else {
    CONFIG.utils.log("error", "Failed to load payment types", result.error);
  }
}

/* --------------------------
   Statistics
-------------------------- */
function updateStats() {
  const expenses = dashboardState.currentMonthExpenses;
  if (!expenses || expenses.length === 0) return;

  const totalAmount = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.expenseAmount || 0), 
    0
  );
  const totalTransactions = expenses.length;
  const avgDaily = totalAmount / new Date().getDate();
  const uniqueCategories = new Set(expenses.map((exp) => exp.categoryName)).size; 

  document.getElementById("totalExpenses").textContent =
    CONFIG.utils.formatCurrency(totalAmount);
  document.getElementById("totalTransactions").textContent =
    totalTransactions;
  document.getElementById("totalCategories").textContent =
    uniqueCategories;
  document.getElementById("avgExpense").textContent =
    CONFIG.utils.formatCurrency(avgDaily);
}

/* --------------------------
   Charts
-------------------------- */
function initializeCharts() {
  initTrendChart();
  initCategoryChart();
}

// Line chart: daily expenses
function initTrendChart() {
  const ctx = document.getElementById("trendChart").getContext("2d");
  const dailyData = generateDailyTrendData();

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dailyData.labels,
      datasets: [
        {
          label: "Daily Expenses",
          data: dailyData.values,
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: {
            callback: (value) => "₹" + value.toLocaleString(),
          },
        },
        x: { grid: { display: false } },
      },
      elements: { point: { hoverRadius: 8 } },
    },
  });
}

// Doughnut chart: categories
function initCategoryChart() {
  const ctx = document.getElementById("categoryChart").getContext("2d");
  const categoryData = generateCategoryData();

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categoryData.labels,
      datasets: [
        {
          data: categoryData.values,
          backgroundColor: CONFIG.UI.CHART_COLORS,
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            font: { size: 12 },
          },
        },
      },
      cutout: "60%",
    },
  });
}

// Generate data helpers
function generateDailyTrendData() {
  const days = 30;
  const labels = [];
  const values = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    labels.push(date.getDate().toString());

    const dayExpenses = dashboardState.currentMonthExpenses.filter(
      (expense) =>
        new Date(expense.expenseDate).toDateString() ===
        date.toDateString()
    );

    const dayTotal = dayExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.expenseAmount || 0),
      0
    );
    values.push(dayTotal);
  }

  return { labels, values };
}

function generateCategoryData() {
  const categoryExpenses = {};
  dashboardState.currentMonthExpenses.forEach((expense) => {
    const categoryName = expense.categoryName || "Unknown";
    categoryExpenses[categoryName] =
      (categoryExpenses[categoryName] || 0) +
      parseFloat(expense.expenseAmount || 0);
  });

  return {
    labels: Object.keys(categoryExpenses),
    values: Object.values(categoryExpenses),
  };
}

/* --------------------------
   Helpers
-------------------------- */
function getCategoryName(categoryId) {
  const category = dashboardState.categories.find((c) => c.id == categoryId);
  return category ? category.name : "Unknown";
}

function getPaymentTypeName(paymentId) {
  const paymentType = dashboardState.paymentTypes.find(
    (p) => p.id == paymentId
  );
  return paymentType ? paymentType.type : "Unknown";
}

/* --------------------------
   UI Updates
-------------------------- */
function displayRecentExpenses() {
  const container = document.getElementById("recentExpenses");
  const recentExpenses = dashboardState.currentMonthExpenses.slice(0, 8);
  
  if (recentExpenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No expenses yet</h3>
        <p>Start tracking your expenses by adding your first one!</p>
        <button class="btn btn-primary" onclick="openAddExpenseModal()" style="margin-top: 15px;">Add Your First Expense</button>
      </div>`;
    return;
  }

  container.innerHTML = recentExpenses
    .map(
      (exp) => `
      <div class="expense-item">
        <div class="expense-info">
          <div class="expense-icon">💳</div>
          <div class="expense-details">
            <h4>${exp.expenseDescription || "No description"}</h4>
            <div class="expense-meta">
              ${exp.categoryName || "Unknown"} • 
              ${exp.paymentType || "Unknown"} • 
              ${CONFIG.utils.formatDate(exp.expenseDate)}
            </div>
          </div>
        </div>
        <div class="expense-amount">${CONFIG.utils.formatCurrency(exp.expenseAmount)}</div>
      </div>`
    )
    .join("");
}

function populateDropdowns() {
  // Categories
  const categorySelect = document.getElementById("expenseCategory");
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  dashboardState.categories.forEach((cat) => {
    categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });

  // Payment types
  const paymentSelect = document.getElementById("expensePayment");
  paymentSelect.innerHTML = '<option value="">Select Payment Method</option>';
  dashboardState.paymentTypes.forEach((pt) => {
    paymentSelect.innerHTML += `<option value="${pt.id}">${pt.type}</option>`;
  });

  // Set today as default date
  document.getElementById("expenseDate").valueAsDate = new Date();
}

/* --------------------------
   Modal Controls
-------------------------- */
function openAddExpenseModal() {
  const modal = document.getElementById("addExpenseModal");
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
}

function closeAddExpenseModal() {
  document.getElementById("addExpenseModal").style.display = "none";
  document.getElementById("addExpenseForm").reset();
}

// Category Modal Functions
function openAddCategoryModal() {
  const modal = document.getElementById("addCategoryModal");
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
}

function closeAddCategoryModal() {
  document.getElementById("addCategoryModal").style.display = "none";
  document.getElementById("addCategoryForm").reset();
}

// Payment Modal Functions  
function openAddPaymentModal() {
  const modal = document.getElementById("addPaymentModal");
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
}

function closeAddPaymentModal() {
  document.getElementById("addPaymentModal").style.display = "none";
  document.getElementById("addPaymentForm").reset();
}

/* --------------------------
   Form Handling
-------------------------- */
document.getElementById("addExpenseForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (dashboardState.isSubmitting.expense) return;
  
  dashboardState.isSubmitting.expense = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Adding...';
  submitBtn.disabled = true;

  try {
    const formData = new FormData(e.target);
    const expenseData = {
      amount: parseFloat(formData.get("amount")),
      expenseDescription: formData.get("expenseDescription"),
      categoryId: parseInt(formData.get("categoryId")),
      paymentId: parseInt(formData.get("paymentId")),
      subCategoryId: 1,
      expenseDate: formData.get("expenseDate"),
    };
    console.log("FormData entries:", [...formData.entries()]);

    console.log("📤 Submitting expense:", expenseData); 

    const result = await api.createExpense(expenseData);

    if (result.success) {
      showSuccess("Expense added successfully!");
      closeAddExpenseModal();

      await loadCurrentMonthExpenses();
      await loadAllExpenses();
      updateStats();
      displayRecentExpenses();
    } else {
      console.error("❌ API Error:", result);
      showError(result.error || "Failed to add expense");
    }
  } finally {
    dashboardState.isSubmitting.expense = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Category Form Handler
document.getElementById("addCategoryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (dashboardState.isSubmitting.category) return;
  
  dashboardState.isSubmitting.category = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Adding...';
  submitBtn.disabled = true;
  
  try {
    const formData = new FormData(e.target);
    const categoryData = {
      name: formData.get("name")
    };

    const result = await api.createCategory(categoryData);
    
    if (result.success) {
      showSuccess("Category added successfully!");
      closeAddCategoryModal();
      await loadCategories();
      populateDropdowns();
    } else {
      showError(result.error || "Failed to add category");
    }
  } finally {
    dashboardState.isSubmitting.category = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Payment Type Form Handler
document.getElementById("addPaymentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (dashboardState.isSubmitting.payment) return;
  
  dashboardState.isSubmitting.payment = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Adding...';
  submitBtn.disabled = true;
  
  try {
    const formData = new FormData(e.target);
    const paymentData = {
      type: formData.get("type")
    };

    const result = await api.createPaymentType(paymentData);
    
    if (result.success) {
      showSuccess("Payment type added successfully!");
      closeAddPaymentModal();
      await loadPaymentTypes();
      populateDropdowns();
    } else {
      showError(result.error || "Failed to add payment type");
    }
  } finally {
    dashboardState.isSubmitting.payment = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

/* --------------------------
   Notifications
-------------------------- */
function showSuccess(message) {
  const alert = createAlert(message, "success");
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function showError(message) {
  const alert = createAlert(message, "error");
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

function createAlert(message, type) {
  const alert = document.createElement("div");
  alert.style.cssText = `
    position: fixed;
    top: 20px; right: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    color: white; font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  `;
  alert.style.background =
    type === "success"
      ? "linear-gradient(135deg, #10b981, #059669)"
      : "linear-gradient(135deg, #ef4444, #dc2626)";
  alert.textContent = message;
  return alert;
}

/* --------------------------
   Miscellaneous
-------------------------- */
function viewAllExpenses() {
  window.location.href = "../Components/expense.html";
}

document
  .getElementById("addExpenseModal")
  .addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeAddExpenseModal();
  });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAddExpenseModal();
    closeAddCategoryModal();
    closeAddPaymentModal();
  }
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    openAddExpenseModal();
  }
});

// Auto-refresh every 5 minutes
setInterval(async () => {
  if (!dashboardState.loading && api.isAuthenticated()) {
    CONFIG.utils.log("debug", "Auto-refreshing dashboard data");
    await loadCurrentMonthExpenses();
    updateStats();
    displayRecentExpenses();
  }
}, 300000);

// Refresh when page visible again
document.addEventListener("visibilitychange", async () => {
  if (!document.hidden && !dashboardState.loading && api.isAuthenticated()) {
    CONFIG.utils.log("debug", "Page visible - refreshing data");
    await loadCurrentMonthExpenses();
    updateStats();
    displayRecentExpenses();
  }
});

// Welcome log
document.addEventListener("DOMContentLoaded", () => {
  CONFIG.utils.log("info", "Dashboard page loaded");
  initDashboard();
  setTimeout(() => {
    console.log(
      "%c💰 Welcome to SpendBuddy Dashboard!",
      "color: #667eea; font-size: 16px; font-weight: bold;"
    );
  }, 1000);
});

// Global error handler
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes("401")
  ) {
    CONFIG.utils.log(
      "warn",
      "Authentication error detected - redirecting to login"
    );
    api.handleUnauthorized();
  }
});