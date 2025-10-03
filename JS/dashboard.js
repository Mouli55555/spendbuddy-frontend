// /* ============================================================
//    SpendBuddy Dashboard Script - UPDATED WITH NULL HANDLING
//    Handles initialization, data loading, UI updates & charts
//    Dependencies: config.js, api.js, Chart.js
// ============================================================ */

// /* --------------------------
//    Global Variables
// -------------------------- */
// let trendChart, categoryChart;

// const dashboardState = {
//   expenses: [],
//   categories: [],
//   paymentTypes: [],
//   currentMonthExpenses: [],
//   loading: true,
//   isSubmitting: {
//     expense: false,
//     category: false,
//     payment: false
//   }
// };

// /* --------------------------
//    Initialization
// -------------------------- */
// async function initDashboard() {
//   try {
//     console.log("🚀 Initializing dashboard...");
    
//     // Check authentication
//     if (!api.isAuthenticated()) {
//       console.warn("⚠️ User not authenticated - redirecting to login");
//       window.location.href = "../Components/auth.html";
//       return;
//     }

//     // Display username
//     const username = localStorage.getItem(CONFIG.STORAGE_KEYS.USERNAME) || "User";
//     document.getElementById("username").textContent = username;
//     console.log(`👤 Logged in as: ${username}`);

//     // Load data in parallel
//     console.log("📡 Loading data from API...");
//     await Promise.all([
//       loadCurrentMonthExpenses(),
//       loadCategories(),
//       loadPaymentTypes(),
//       loadAllExpenses(),
//     ]);

//     console.log("📊 Data loaded:", {
//       currentMonthExpenses: dashboardState.currentMonthExpenses.length,
//       allExpenses: dashboardState.expenses.length,
//       categories: dashboardState.categories.length,
//       paymentTypes: dashboardState.paymentTypes.length
//     });

//     // Update UI
//     updateStats();
//     initializeCharts();
//     displayRecentExpenses();
//     populateDropdowns();

//     dashboardState.loading = false;
//     CONFIG.utils.log("info", "Dashboard initialized successfully");
//     console.log("✅ Dashboard ready!");
//   } catch (error) {
//     console.error("❌ Dashboard initialization failed:", error);
//     CONFIG.utils.log("error", "Dashboard initialization failed", error);
//     showError("Failed to load dashboard data. Please refresh the page.");
//   }
// }

// /* --------------------------
//    Data Loading Functions
// -------------------------- */
// async function loadCurrentMonthExpenses() {
//   console.log("🔄 Loading current month expenses...");
//   try {
//     const result = await api.getCurrentMonthExpenses();
//     console.log("📊 Current month expenses API response:", result);
    
//     if (result.success) {
//       // Handle null/undefined data
//       dashboardState.currentMonthExpenses = Array.isArray(result.data) 
//         ? result.data 
//         : (result.data ? [result.data] : []);
      
//       console.log(`✅ Loaded ${dashboardState.currentMonthExpenses.length} current month expenses`);
//     } else {
//       console.error("❌ Failed to load current month expenses:", result.error);
//       dashboardState.currentMonthExpenses = [];
//       CONFIG.utils.log("error", "Failed to load current month expenses", result.error);
//     }
//   } catch (error) {
//     console.error("❌ Exception loading current month expenses:", error);
//     dashboardState.currentMonthExpenses = [];
//   }
// }

// async function loadAllExpenses() {
//   console.log("🔄 Loading all expenses...");
//   try {
//     const result = await api.getExpenses();
//     console.log("📊 All expenses API response:", result);
    
//     if (result.success) {
//       dashboardState.expenses = Array.isArray(result.data) 
//         ? result.data 
//         : (result.data ? [result.data] : []);
      
//       console.log(`✅ Loaded ${dashboardState.expenses.length} total expenses`);
//     } else {
//       console.error("❌ Failed to load expenses:", result.error);
//       dashboardState.expenses = [];
//       CONFIG.utils.log("error", "Failed to load expenses", result.error);
//     }
//   } catch (error) {
//     console.error("❌ Exception loading expenses:", error);
//     dashboardState.expenses = [];
//   }
// }

// async function loadCategories() {
//   console.log("🔄 Loading categories...");
//   try {
//     const result = await api.getCategories();
//     console.log("📊 Categories API response:", result);
    
//     if (result.success) {
//       dashboardState.categories = Array.isArray(result.data) 
//         ? result.data 
//         : (result.data ? [result.data] : []);
      
//       console.log(`✅ Loaded ${dashboardState.categories.length} categories`);
//     } else {
//       console.error("❌ Failed to load categories:", result.error);
//       dashboardState.categories = [];
//       CONFIG.utils.log("error", "Failed to load categories", result.error);
//     }
//   } catch (error) {
//     console.error("❌ Exception loading categories:", error);
//     dashboardState.categories = [];
//   }
// }

// async function loadPaymentTypes() {
//   console.log("🔄 Loading payment types...");
//   try {
//     const result = await api.getPaymentTypes();
//     console.log("📊 Payment types API response:", result);
    
//     if (result.success) {
//       dashboardState.paymentTypes = Array.isArray(result.data) 
//         ? result.data 
//         : (result.data ? [result.data] : []);
      
//       console.log(`✅ Loaded ${dashboardState.paymentTypes.length} payment types`);
//     } else {
//       console.error("❌ Failed to load payment types:", result.error);
//       dashboardState.paymentTypes = [];
//       CONFIG.utils.log("error", "Failed to load payment types", result.error);
//     }
//   } catch (error) {
//     console.error("❌ Exception loading payment types:", error);
//     dashboardState.paymentTypes = [];
//   }
// }

// /* --------------------------
//    Statistics
// -------------------------- */
// function updateStats() {
//   const expenses = dashboardState.currentMonthExpenses;
  
//   console.log("📈 Updating stats with", expenses?.length || 0, "expenses");
  
//   // Handle empty/null data gracefully
//   if (!expenses || expenses.length === 0) {
//     console.warn("⚠️ No expenses found for current month - showing zeros");
//     document.getElementById("totalExpenses").textContent = "₹0";
//     document.getElementById("totalTransactions").textContent = "0";
//     document.getElementById("totalCategories").textContent = "0";
//     document.getElementById("avgExpense").textContent = "₹0";
//     return;
//   }

//   const totalAmount = expenses.reduce(
//     (sum, exp) => sum + parseFloat(exp.expenseAmount || 0), 
//     0
//   );
//   const totalTransactions = expenses.length;
//   const avgDaily = totalAmount / new Date().getDate();
//   const uniqueCategories = new Set(
//     expenses.map((exp) => exp.categoryName || "Unknown")
//   ).size; 

//   console.log("💰 Stats calculated:", {
//     totalAmount,
//     totalTransactions,
//     avgDaily,
//     uniqueCategories
//   });

//   document.getElementById("totalExpenses").textContent =
//     CONFIG.utils.formatCurrency(totalAmount);
//   document.getElementById("totalTransactions").textContent =
//     totalTransactions;
//   document.getElementById("totalCategories").textContent =
//     uniqueCategories;
//   document.getElementById("avgExpense").textContent =
//     CONFIG.utils.formatCurrency(avgDaily);
// }

// /* --------------------------
//    Charts
// -------------------------- */
// function initializeCharts() {
//   console.log("📊 Initializing charts...");
//   initTrendChart();
//   initCategoryChart();
// }

// // Line chart: daily expenses
// function initTrendChart() {
//   const ctx = document.getElementById("trendChart");
//   if (!ctx) {
//     console.error("❌ Trend chart canvas not found");
//     return;
//   }
  
//   const dailyData = generateDailyTrendData();
//   console.log("📈 Trend chart data:", dailyData);

//   // Destroy existing chart if it exists
//   if (trendChart) {
//     trendChart.destroy();
//   }

//   trendChart = new Chart(ctx.getContext("2d"), {
//     type: "line",
//     data: {
//       labels: dailyData.labels,
//       datasets: [
//         {
//           label: "Daily Expenses",
//           data: dailyData.values,
//           borderColor: "#667eea",
//           backgroundColor: "rgba(102, 126, 234, 0.1)",
//           borderWidth: 3,
//           fill: true,
//           tension: 0.4,
//           pointBackgroundColor: "#667eea",
//           pointBorderColor: "#ffffff",
//           pointBorderWidth: 2,
//           pointRadius: 5,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: { 
//         legend: { display: false },
//         tooltip: {
//           callbacks: {
//             label: function(context) {
//               return '₹' + context.parsed.y.toLocaleString('en-IN');
//             }
//           }
//         }
//       },
//       scales: {
//         y: {
//           beginAtZero: true,
//           grid: { color: "rgba(0, 0, 0, 0.05)" },
//           ticks: {
//             callback: (value) => "₹" + value.toLocaleString('en-IN'),
//           },
//         },
//         x: { grid: { display: false } },
//       },
//       elements: { point: { hoverRadius: 8 } },
//     },
//   });
// }

// // Doughnut chart: categories
// function initCategoryChart() {
//   const ctx = document.getElementById("categoryChart");
//   if (!ctx) {
//     console.error("❌ Category chart canvas not found");
//     return;
//   }
  
//   const categoryData = generateCategoryData();
//   console.log("🏷️ Category chart data:", categoryData);

//   // Destroy existing chart if it exists
//   if (categoryChart) {
//     categoryChart.destroy();
//   }

//   categoryChart = new Chart(ctx.getContext("2d"), {
//     type: "doughnut",
//     data: {
//       labels: categoryData.labels.length > 0 ? categoryData.labels : ["No Data"],
//       datasets: [
//         {
//           data: categoryData.values.length > 0 ? categoryData.values : [1],
//           backgroundColor: categoryData.values.length > 0 
//             ? CONFIG.UI.CHART_COLORS 
//             : ["#e0e0e0"],
//           borderWidth: 0,
//           hoverOffset: 10,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           position: "bottom",
//           labels: {
//             padding: 20,
//             usePointStyle: true,
//             font: { size: 12 },
//           },
//         },
//         tooltip: {
//           callbacks: {
//             label: function(context) {
//               const label = context.label || '';
//               const value = context.parsed || 0;
//               return label + ': ₹' + value.toLocaleString('en-IN');
//             }
//           }
//         }
//       },
//       cutout: "60%",
//     },
//   });
// }

// // Generate data helpers
// function generateDailyTrendData() {
//   const days = 30;
//   const labels = [];
//   const values = [];
  
//   // Use ALL expenses, not just current month
//   const allExpenses = dashboardState.expenses || [];
  
//   // Get date 30 days ago
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//   for (let i = days - 1; i >= 0; i--) {
//     const date = new Date();
//     date.setDate(date.getDate() - i);

//     labels.push(date.getDate().toString());

//     const dayExpenses = allExpenses.filter((expense) => {
//       if (!expense.expenseDate) return false;
//       const expenseDate = new Date(expense.expenseDate);
//       return expenseDate.toDateString() === date.toDateString();
//     });

//     const dayTotal = dayExpenses.reduce(
//       (sum, exp) => sum + parseFloat(exp.expenseAmount || 0),
//       0
//     );
    
//     values.push(dayTotal);
//   }
  
//   return { labels, values };
// }

// function generateCategoryData() {
//   // Use ALL expenses from last 30 days, not just current month
//   const allExpenses = dashboardState.currentMonthExpenses || [];
  
//   // Get date 30 days ago
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
//   // Filter expenses from last 30 days
//   const last30DaysExpenses = allExpenses.filter(expense => {
//     if (!expense.expenseDate) return false;
//     const expenseDate = new Date(expense.expenseDate);
//     return expenseDate >= thirtyDaysAgo;
//   });
  
//   const categoryExpenses = {};
  
//   last30DaysExpenses.forEach((expense) => {
//     const categoryName = expense.categoryName || "Unknown";
//     const amount = parseFloat(expense.expenseAmount || 0);
    
//     categoryExpenses[categoryName] = (categoryExpenses[categoryName] || 0) + amount;
//   });

//   return {
//     labels: Object.keys(categoryExpenses),
//     values: Object.values(categoryExpenses),
//   };
// }

// /* --------------------------
//    Helpers
// -------------------------- */
// function getCategoryName(categoryId) {
//   if (!categoryId) return "Unknown";
//   const category = dashboardState.categories.find((c) => c.id == categoryId);
//   return category ? category.name : "Unknown";
// }

// function getPaymentTypeName(paymentId) {
//   if (!paymentId) return "Unknown";
//   const paymentType = dashboardState.paymentTypes.find(
//     (p) => p.id == paymentId
//   );
//   return paymentType ? paymentType.type : "Unknown";
// }

// /* --------------------------
//    UI Updates
// -------------------------- */
// function displayRecentExpenses() {
//   const container = document.getElementById("recentExpenses");
//   if (!container) return;
  
//   // Use ALL expenses, not just current month
//   const allExpenses = dashboardState.expenses || [];
  
//   // Sort by date (newest first) and take top 8
//   const recentExpenses = allExpenses
//     .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
//     .slice(0, 8);
  
//   if (recentExpenses.length === 0) {
//     container.innerHTML = `
//       <div class="empty-state">
//         <h3>No expenses yet</h3>
//         <p>Start tracking your expenses by adding your first one!</p>
//         <button class="btn btn-primary" onclick="openAddExpenseModal()" style="margin-top: 15px;">Add Your First Expense</button>
//       </div>`;
//     return;
//   }

//   container.innerHTML = recentExpenses
//     .map(
//       (exp) => `
//       <div class="expense-item">
//         <div class="expense-info">
//           <div class="expense-icon">💳</div>
//           <div class="expense-details">
//             <h4>${exp.expenseDescription || "No description"}</h4>
//             <div class="expense-meta">
//               ${exp.categoryName || "Unknown"} • 
//               ${exp.paymentType || "Unknown"} • 
//               ${CONFIG.utils.formatDate(exp.expenseDate)}
//             </div>
//           </div>
//         </div>
//         <div class="expense-amount">${CONFIG.utils.formatCurrency(exp.expenseAmount || 0)}</div>
//       </div>`
//     )
//     .join("");
// }

// function populateDropdowns() {
//   console.log("🔽 Populating dropdowns...");
  
//   // Categories
//   const categorySelect = document.getElementById("expenseCategory");
//   if (categorySelect) {
//     categorySelect.innerHTML = '<option value="">Select Category</option>';
//     (dashboardState.categories || []).forEach((cat) => {
//       categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
//     });
//     console.log(`✅ Added ${dashboardState.categories.length} categories to dropdown`);
//   }

//   // Payment types
//   const paymentSelect = document.getElementById("expensePayment");
//   if (paymentSelect) {
//     paymentSelect.innerHTML = '<option value="">Select Payment Method</option>';
//     (dashboardState.paymentTypes || []).forEach((pt) => {
//       paymentSelect.innerHTML += `<option value="${pt.id}">${pt.type}</option>`;
//     });
//     console.log(`✅ Added ${dashboardState.paymentTypes.length} payment types to dropdown`);
//   }

//   // Set today as default date
//   const dateInput = document.getElementById("expenseDate");
//   if (dateInput) {
//     dateInput.valueAsDate = new Date();
//   }
// }

// /* --------------------------
//    Modal Controls
// -------------------------- */
// function openAddExpenseModal() {
//   console.log("📝 Opening add expense modal");
//   const modal = document.getElementById("addExpenseModal");
//   if (modal) {
//     modal.style.display = "flex";
//     modal.style.alignItems = "center";
//     modal.style.justifyContent = "center";
//   }
// }

// function closeAddExpenseModal() {
//   console.log("❌ Closing add expense modal");
//   const modal = document.getElementById("addExpenseModal");
//   const form = document.getElementById("addExpenseForm");
  
//   if (modal) modal.style.display = "none";
//   if (form) form.reset();
// }

// // Category Modal Functions
// function openAddCategoryModal() {
//   console.log("📝 Opening add category modal");
//   const modal = document.getElementById("addCategoryModal");
//   if (modal) {
//     modal.style.display = "flex";
//     modal.style.alignItems = "center";
//     modal.style.justifyContent = "center";
//   }
// }

// function closeAddCategoryModal() {
//   console.log("❌ Closing add category modal");
//   const modal = document.getElementById("addCategoryModal");
//   const form = document.getElementById("addCategoryForm");
  
//   if (modal) modal.style.display = "none";
//   if (form) form.reset();
// }

// // Payment Modal Functions  
// function openAddPaymentModal() {
//   console.log("📝 Opening add payment modal");
//   const modal = document.getElementById("addPaymentModal");
//   if (modal) {
//     modal.style.display = "flex";
//     modal.style.alignItems = "center";
//     modal.style.justifyContent = "center";
//   }
// }

// function closeAddPaymentModal() {
//   console.log("❌ Closing add payment modal");
//   const modal = document.getElementById("addPaymentModal");
//   const form = document.getElementById("addPaymentForm");
  
//   if (modal) modal.style.display = "none";
//   if (form) form.reset();
// }

// /* --------------------------
//    Form Handling
// -------------------------- */
// document.getElementById("addExpenseForm")
// ?.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   if (dashboardState.isSubmitting.expense) {
//     console.warn("⚠️ Expense submission already in progress");
//     return;
//   }
  
//   dashboardState.isSubmitting.expense = true;
//   const submitBtn = e.target.querySelector('button[type="submit"]');
//   const originalText = submitBtn.textContent;
//   submitBtn.textContent = 'Adding...';
//   submitBtn.disabled = true;

//   try {
//     const formData = new FormData(e.target);
//     const expenseData = {
//       amount: parseFloat(formData.get("amount")),
//       expenseDescription: formData.get("expenseDescription"),
//       categoryId: parseInt(formData.get("categoryId")),
//       paymentId: parseInt(formData.get("paymentId")),
//       subCategoryId: 1,
//       expenseDate: formData.get("expenseDate"),
//     };
    
//     console.log("📤 Submitting expense:", expenseData);

//     const result = await api.createExpense(expenseData);
//     console.log("📥 Create expense result:", result);

//     if (result.success) {
//       console.log("✅ Expense added successfully");
//       showSuccess("Expense added successfully!");
//       closeAddExpenseModal();

//       // Reload data
//       await Promise.all([
//         loadCurrentMonthExpenses(),
//         loadAllExpenses()
//       ]);
      
//       updateStats();
//       displayRecentExpenses();
      
//       // Update charts
//       if (trendChart) {
//         const dailyData = generateDailyTrendData();
//         trendChart.data.labels = dailyData.labels;
//         trendChart.data.datasets[0].data = dailyData.values;
//         trendChart.update();
//       }
      
//       if (categoryChart) {
//         const categoryData = generateCategoryData();
//         categoryChart.data.labels = categoryData.labels.length > 0 ? categoryData.labels : ["No Data"];
//         categoryChart.data.datasets[0].data = categoryData.values.length > 0 ? categoryData.values : [1];
//         categoryChart.update();
//       }
//     } else {
//       console.error("❌ Failed to add expense:", result);
//       showError(result.error || "Failed to add expense");
//     }
//   } catch (error) {
//     console.error("❌ Exception during expense submission:", error);
//     showError("An error occurred while adding expense");
//   } finally {
//     dashboardState.isSubmitting.expense = false;
//     submitBtn.textContent = originalText;
//     submitBtn.disabled = false;
//   }
// });

// // Category Form Handler
// document.getElementById("addCategoryForm")
// ?.addEventListener("submit", async (e) => {
//   e.preventDefault();
  
//   if (dashboardState.isSubmitting.category) {
//     console.warn("⚠️ Category submission already in progress");
//     return;
//   }
  
//   dashboardState.isSubmitting.category = true;
//   const submitBtn = e.target.querySelector('button[type="submit"]');
//   const originalText = submitBtn.textContent;
//   submitBtn.textContent = 'Adding...';
//   submitBtn.disabled = true;
  
//   try {
//     const formData = new FormData(e.target);
//     const categoryData = {
//       name: formData.get("name")
//     };

//     console.log("📤 Submitting category:", categoryData);
//     const result = await api.createCategory(categoryData);
//     console.log("📥 Create category result:", result);
    
//     if (result.success) {
//       console.log("✅ Category added successfully");
//       showSuccess("Category added successfully!");
//       closeAddCategoryModal();
//       await loadCategories();
//       populateDropdowns();
//     } else {
//       console.error("❌ Failed to add category:", result);
//       showError(result.error || "Failed to add category");
//     }
//   } catch (error) {
//     console.error("❌ Exception during category submission:", error);
//     showError("An error occurred while adding category");
//   } finally {
//     dashboardState.isSubmitting.category = false;
//     submitBtn.textContent = originalText;
//     submitBtn.disabled = false;
//   }
// });

// // Payment Type Form Handler
// document.getElementById("addPaymentForm")
// ?.addEventListener("submit", async (e) => {
//   e.preventDefault();
  
//   if (dashboardState.isSubmitting.payment) {
//     console.warn("⚠️ Payment type submission already in progress");
//     return;
//   }
  
//   dashboardState.isSubmitting.payment = true;
//   const submitBtn = e.target.querySelector('button[type="submit"]');
//   const originalText = submitBtn.textContent;
//   submitBtn.textContent = 'Adding...';
//   submitBtn.disabled = true;
  
//   try {
//     const formData = new FormData(e.target);
//     const paymentData = {
//       type: formData.get("type")
//     };

//     console.log("📤 Submitting payment type:", paymentData);
//     const result = await api.createPaymentType(paymentData);
//     console.log("📥 Create payment type result:", result);
    
//     if (result.success) {
//       console.log("✅ Payment type added successfully");
//       showSuccess("Payment type added successfully!");
//       closeAddPaymentModal();
//       await loadPaymentTypes();
//       populateDropdowns();
//     } else {
//       console.error("❌ Failed to add payment type:", result);
//       showError(result.error || "Failed to add payment type");
//     }
//   } catch (error) {
//     console.error("❌ Exception during payment type submission:", error);
//     showError("An error occurred while adding payment type");
//   } finally {
//     dashboardState.isSubmitting.payment = false;
//     submitBtn.textContent = originalText;
//     submitBtn.disabled = false;
//   }
// });

// /* --------------------------
//    Notifications
// -------------------------- */
// function showSuccess(message) {
//   console.log("✅", message);
//   const alert = createAlert(message, "success");
//   document.body.appendChild(alert);
//   setTimeout(() => alert.remove(), 3000);
// }

// function showError(message) {
//   console.error("❌", message);
//   const alert = createAlert(message, "error");
//   document.body.appendChild(alert);
//   setTimeout(() => alert.remove(), 5000);
// }

// function createAlert(message, type) {
//   const alert = document.createElement("div");
//   alert.style.cssText = `
//     position: fixed;
//     top: 20px; right: 20px;
//     padding: 15px 20px;
//     border-radius: 10px;
//     color: white; font-weight: 600;
//     z-index: 10000;
//     animation: slideInRight 0.3s ease-out;
//     max-width: 300px;
//     box-shadow: 0 5px 15px rgba(0,0,0,0.2);
//   `;
//   alert.style.background =
//     type === "success"
//       ? "linear-gradient(135deg, #10b981, #059669)"
//       : "linear-gradient(135deg, #ef4444, #dc2626)";
//   alert.textContent = message;
//   return alert;
// }

// /* --------------------------
//    Miscellaneous
// -------------------------- */
// function viewAllExpenses() {
//   console.log("📊 Navigating to expenses page");
//   window.location.href = "../Components/expense.html";
// }

// // Close modals on overlay click
// document.getElementById("addExpenseModal")
// ?.addEventListener("click", (e) => {
//   if (e.target === e.currentTarget) closeAddExpenseModal();
// });

// document.getElementById("addCategoryModal")
// ?.addEventListener("click", (e) => {
//   if (e.target === e.currentTarget) closeAddCategoryModal();
// });

// document.getElementById("addPaymentModal")
// ?.addEventListener("click", (e) => {
//   if (e.target === e.currentTarget) closeAddPaymentModal();
// });

// // Keyboard shortcuts
// document.addEventListener("keydown", (e) => {
//   if (e.key === "Escape") {
//     closeAddExpenseModal();
//     closeAddCategoryModal();
//     closeAddPaymentModal();
//   }
//   if (e.ctrlKey && e.key === "n") {
//     e.preventDefault();
//     openAddExpenseModal();
//   }
// });

// // Auto-refresh every 5 minutes
// setInterval(async () => {
//   if (!dashboardState.loading && api.isAuthenticated()) {
//     console.log("🔄 Auto-refreshing dashboard data");
//     await loadCurrentMonthExpenses();
//     updateStats();
//     displayRecentExpenses();
    
//     // Update charts
//     if (trendChart) {
//       const dailyData = generateDailyTrendData();
//       trendChart.data.datasets[0].data = dailyData.values;
//       trendChart.update('none'); // Update without animation
//     }
    
//     if (categoryChart) {
//       const categoryData = generateCategoryData();
//       categoryChart.data.labels = categoryData.labels;
//       categoryChart.data.datasets[0].data = categoryData.values;
//       categoryChart.update('none');
//     }
//   }
// }, 300000); // 5 minutes

// // Refresh when page visible again
// document.addEventListener("visibilitychange", async () => {
//   if (!document.hidden && !dashboardState.loading && api.isAuthenticated()) {
//     console.log("👁️ Page visible - refreshing data");
//     await loadCurrentMonthExpenses();
//     updateStats();
//     displayRecentExpenses();
//   }
// });

// // Welcome log
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("🎨 DOM loaded - initializing dashboard");
//   CONFIG.utils.log("info", "Dashboard page loaded");
//   initDashboard();
  
//   setTimeout(() => {
//     console.log(
//       "%c💰 Welcome to SpendBuddy Dashboard!",
//       "color: #667eea; font-size: 16px; font-weight: bold;"
//     );
//     console.log(
//       "%c📊 Dashboard State:",
//       "color: #667eea; font-weight: bold;",
//       dashboardState
//     );
//   }, 1000);
// });

// // Global error handler
// window.addEventListener("unhandledrejection", (event) => {
//   console.error("❌ Unhandled promise rejection:", event.reason);
  
//   if (
//     event.reason &&
//     event.reason.message &&
//     event.reason.message.includes("401")
//   ) {
//     console.warn("⚠️ Authentication error detected - redirecting to login");
//     CONFIG.utils.log(
//       "warn",
//       "Authentication error detected - redirecting to login"
//     );
//     api.handleUnauthorized();
//   }
// });

/* ============================================================
   SpendBuddy Dashboard Script - UPDATED WITH NULL HANDLING
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
  categoryView: 'month', // 'month' or 'overall'
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
    console.log("🚀 Initializing dashboard...");
    
    // Check authentication
    if (!api.isAuthenticated()) {
      console.warn("⚠️ User not authenticated - redirecting to login");
      window.location.href = "../Components/auth.html";
      return;
    }

    // Display username
    const username = localStorage.getItem(CONFIG.STORAGE_KEYS.USERNAME) || "User";
    document.getElementById("username").textContent = username;
    console.log(`👤 Logged in as: ${username}`);

    // Load data in parallel
    console.log("📡 Loading data from API...");
    await Promise.all([
      loadCurrentMonthExpenses(),
      loadCategories(),
      loadPaymentTypes(),
      loadAllExpenses(),
    ]);

    console.log("📊 Data loaded:", {
      currentMonthExpenses: dashboardState.currentMonthExpenses.length,
      allExpenses: dashboardState.expenses.length,
      categories: dashboardState.categories.length,
      paymentTypes: dashboardState.paymentTypes.length
    });

    // Update UI
    updateStats();
    initializeCharts();
    displayRecentExpenses();
    populateDropdowns();

    dashboardState.loading = false;
    CONFIG.utils.log("info", "Dashboard initialized successfully");
    console.log("✅ Dashboard ready!");
  } catch (error) {
    console.error("❌ Dashboard initialization failed:", error);
    CONFIG.utils.log("error", "Dashboard initialization failed", error);
    showError("Failed to load dashboard data. Please refresh the page.");
  }
}

/* --------------------------
   Data Loading Functions
-------------------------- */
async function loadCurrentMonthExpenses() {
  console.log("🔄 Loading current month expenses...");
  try {
    const result = await api.getCurrentMonthExpenses();
    console.log("📊 Current month expenses API response:", result);
    
    if (result.success) {
      // Handle null/undefined data
      dashboardState.currentMonthExpenses = Array.isArray(result.data) 
        ? result.data 
        : (result.data ? [result.data] : []);
      
      console.log(`✅ Loaded ${dashboardState.currentMonthExpenses.length} current month expenses`);
    } else {
      console.error("❌ Failed to load current month expenses:", result.error);
      dashboardState.currentMonthExpenses = [];
      CONFIG.utils.log("error", "Failed to load current month expenses", result.error);
    }
  } catch (error) {
    console.error("❌ Exception loading current month expenses:", error);
    dashboardState.currentMonthExpenses = [];
  }
}

async function loadAllExpenses() {
  console.log("🔄 Loading all expenses...");
  try {
    const result = await api.getExpenses();
    console.log("📊 All expenses API response:", result);
    
    if (result.success) {
      dashboardState.expenses = Array.isArray(result.data) 
        ? result.data 
        : (result.data ? [result.data] : []);
      
      console.log(`✅ Loaded ${dashboardState.expenses.length} total expenses`);
    } else {
      console.error("❌ Failed to load expenses:", result.error);
      dashboardState.expenses = [];
      CONFIG.utils.log("error", "Failed to load expenses", result.error);
    }
  } catch (error) {
    console.error("❌ Exception loading expenses:", error);
    dashboardState.expenses = [];
  }
}

async function loadCategories() {
  console.log("🔄 Loading categories...");
  try {
    const result = await api.getCategories();
    console.log("📊 Categories API response:", result);
    
    if (result.success) {
      dashboardState.categories = Array.isArray(result.data) 
        ? result.data 
        : (result.data ? [result.data] : []);
      
      console.log(`✅ Loaded ${dashboardState.categories.length} categories`);
    } else {
      console.error("❌ Failed to load categories:", result.error);
      dashboardState.categories = [];
      CONFIG.utils.log("error", "Failed to load categories", result.error);
    }
  } catch (error) {
    console.error("❌ Exception loading categories:", error);
    dashboardState.categories = [];
  }
}

async function loadPaymentTypes() {
  console.log("🔄 Loading payment types...");
  try {
    const result = await api.getPaymentTypes();
    console.log("📊 Payment types API response:", result);
    
    if (result.success) {
      dashboardState.paymentTypes = Array.isArray(result.data) 
        ? result.data 
        : (result.data ? [result.data] : []);
      
      console.log(`✅ Loaded ${dashboardState.paymentTypes.length} payment types`);
    } else {
      console.error("❌ Failed to load payment types:", result.error);
      dashboardState.paymentTypes = [];
      CONFIG.utils.log("error", "Failed to load payment types", result.error);
    }
  } catch (error) {
    console.error("❌ Exception loading payment types:", error);
    dashboardState.paymentTypes = [];
  }
}

/* --------------------------
   Statistics
-------------------------- */
function updateStats() {
  const expenses = dashboardState.currentMonthExpenses;
  
  console.log("📈 Updating stats with", expenses?.length || 0, "expenses");
  
  // Handle empty/null data gracefully
  if (!expenses || expenses.length === 0) {
    console.warn("⚠️ No expenses found for current month - showing zeros");
    document.getElementById("totalExpenses").textContent = "₹0";
    document.getElementById("totalTransactions").textContent = "0";
    document.getElementById("totalCategories").textContent = "0";
    document.getElementById("avgExpense").textContent = "₹0";
    return;
  }

  const totalAmount = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.expenseAmount || 0), 
    0
  );
  const totalTransactions = expenses.length;
  const avgDaily = totalAmount / new Date().getDate();
  const uniqueCategories = new Set(
    expenses.map((exp) => exp.categoryName || "Unknown")
  ).size; 

  console.log("💰 Stats calculated:", {
    totalAmount,
    totalTransactions,
    avgDaily,
    uniqueCategories
  });

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
  console.log("📊 Initializing charts...");
  initTrendChart();
  initCategoryChart();
}

// Line chart: daily expenses
function initTrendChart() {
  const ctx = document.getElementById("trendChart");
  if (!ctx) {
    console.error("❌ Trend chart canvas not found");
    return;
  }
  
  const dailyData = generateDailyTrendData();
  console.log("📈 Trend chart data:", dailyData);

  // Destroy existing chart if it exists
  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(ctx.getContext("2d"), {
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
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return '₹' + context.parsed.y.toLocaleString('en-IN');
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0, 0, 0, 0.05)" },
          ticks: {
            callback: (value) => "₹" + value.toLocaleString('en-IN'),
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
  const ctx = document.getElementById("categoryChart");
  if (!ctx) {
    console.error("❌ Category chart canvas not found");
    return;
  }
  
  const categoryData = generateCategoryData();
  console.log("🏷️ Category chart data:", categoryData);

  // Destroy existing chart if it exists
  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: categoryData.labels.length > 0 ? categoryData.labels : ["No Data"],
      datasets: [
        {
          data: categoryData.values.length > 0 ? categoryData.values : [1],
          backgroundColor: categoryData.values.length > 0 
            ? CONFIG.UI.CHART_COLORS 
            : ["#e0e0e0"],
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
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return label + ': ₹' + value.toLocaleString('en-IN');
            }
          }
        }
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
  
  // Use ALL expenses, not just current month
  const allExpenses = dashboardState.expenses || [];
  
  // Get date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    labels.push(date.getDate().toString());

    const dayExpenses = allExpenses.filter((expense) => {
      if (!expense.expenseDate) return false;
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate.toDateString() === date.toDateString();
    });

    const dayTotal = dayExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.expenseAmount || 0),
      0
    );
    
    values.push(dayTotal);
  }
  
  return { labels, values };
}

function generateCategoryData() {
  // Use expenses based on selected view
  const expenses = dashboardState.categoryView === 'month' 
    ? (dashboardState.currentMonthExpenses || [])
    : (dashboardState.expenses || []);
  
  const categoryExpenses = {};
  
  expenses.forEach((expense) => {
    const categoryName = expense.categoryName || "Unknown";
    const amount = parseFloat(expense.expenseAmount || 0);
    
    categoryExpenses[categoryName] = (categoryExpenses[categoryName] || 0) + amount;
  });

  return {
    labels: Object.keys(categoryExpenses),
    values: Object.values(categoryExpenses),
  };
}

/* --------------------------
   Toggle Category View
-------------------------- */
function toggleCategoryView() {
  // Switch between month and overall
  dashboardState.categoryView = dashboardState.categoryView === 'month' ? 'overall' : 'month';
  
  // Update button text
  const btn = document.getElementById('categoryToggleBtn');
  if (btn) {
    btn.textContent = dashboardState.categoryView === 'month' ? 'Show Overall' : 'Show This Month';
  }
  
  // Update chart
  if (categoryChart) {
    const categoryData = generateCategoryData();
    categoryChart.data.labels = categoryData.labels.length > 0 ? categoryData.labels : ["No Data"];
    categoryChart.data.datasets[0].data = categoryData.values.length > 0 ? categoryData.values : [1];
    categoryChart.data.datasets[0].backgroundColor = categoryData.values.length > 0 
      ? CONFIG.UI.CHART_COLORS 
      : ["#e0e0e0"];
    categoryChart.update();
  }
}

/* --------------------------
   Helpers
-------------------------- */
function getCategoryName(categoryId) {
  if (!categoryId) return "Unknown";
  const category = dashboardState.categories.find((c) => c.id == categoryId);
  return category ? category.name : "Unknown";
}

function getPaymentTypeName(paymentId) {
  if (!paymentId) return "Unknown";
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
  if (!container) return;
  
  // Use ALL expenses, not just current month
  const allExpenses = dashboardState.expenses || [];
  
  // Sort by date (newest first) and take top 8
  const recentExpenses = allExpenses
    .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
    .slice(0, 8);
  
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
        <div class="expense-amount">${CONFIG.utils.formatCurrency(exp.expenseAmount || 0)}</div>
      </div>`
    )
    .join("");
}

function populateDropdowns() {
  console.log("🔽 Populating dropdowns...");
  
  // Categories
  const categorySelect = document.getElementById("expenseCategory");
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    (dashboardState.categories || []).forEach((cat) => {
      categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
    console.log(`✅ Added ${dashboardState.categories.length} categories to dropdown`);
  }

  // Payment types
  const paymentSelect = document.getElementById("expensePayment");
  if (paymentSelect) {
    paymentSelect.innerHTML = '<option value="">Select Payment Method</option>';
    (dashboardState.paymentTypes || []).forEach((pt) => {
      paymentSelect.innerHTML += `<option value="${pt.id}">${pt.type}</option>`;
    });
    console.log(`✅ Added ${dashboardState.paymentTypes.length} payment types to dropdown`);
  }

  // Set today as default date
  const dateInput = document.getElementById("expenseDate");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

/* --------------------------
   Modal Controls
-------------------------- */
function openAddExpenseModal() {
  console.log("📝 Opening add expense modal");
  const modal = document.getElementById("addExpenseModal");
  if (modal) {
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
  }
}

function closeAddExpenseModal() {
  console.log("❌ Closing add expense modal");
  const modal = document.getElementById("addExpenseModal");
  const form = document.getElementById("addExpenseForm");
  
  if (modal) modal.style.display = "none";
  if (form) form.reset();
}

// Category Modal Functions
function openAddCategoryModal() {
  console.log("📝 Opening add category modal");
  const modal = document.getElementById("addCategoryModal");
  if (modal) {
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
  }
}

function closeAddCategoryModal() {
  console.log("❌ Closing add category modal");
  const modal = document.getElementById("addCategoryModal");
  const form = document.getElementById("addCategoryForm");
  
  if (modal) modal.style.display = "none";
  if (form) form.reset();
}

// Payment Modal Functions  
function openAddPaymentModal() {
  console.log("📝 Opening add payment modal");
  const modal = document.getElementById("addPaymentModal");
  if (modal) {
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
  }
}

function closeAddPaymentModal() {
  console.log("❌ Closing add payment modal");
  const modal = document.getElementById("addPaymentModal");
  const form = document.getElementById("addPaymentForm");
  
  if (modal) modal.style.display = "none";
  if (form) form.reset();
}

/* --------------------------
   Form Handling
-------------------------- */
document.getElementById("addExpenseForm")
?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (dashboardState.isSubmitting.expense) {
    console.warn("⚠️ Expense submission already in progress");
    return;
  }
  
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
    
    console.log("📤 Submitting expense:", expenseData);

    const result = await api.createExpense(expenseData);
    console.log("📥 Create expense result:", result);

    if (result.success) {
      console.log("✅ Expense added successfully");
      showSuccess("Expense added successfully!");
      closeAddExpenseModal();

      // Reload data
      await Promise.all([
        loadCurrentMonthExpenses(),
        loadAllExpenses()
      ]);
      
      updateStats();
      displayRecentExpenses();
      
      // Update charts
      if (trendChart) {
        const dailyData = generateDailyTrendData();
        trendChart.data.labels = dailyData.labels;
        trendChart.data.datasets[0].data = dailyData.values;
        trendChart.update();
      }
      
      if (categoryChart) {
        const categoryData = generateCategoryData();
        categoryChart.data.labels = categoryData.labels.length > 0 ? categoryData.labels : ["No Data"];
        categoryChart.data.datasets[0].data = categoryData.values.length > 0 ? categoryData.values : [1];
        categoryChart.update();
      }
    } else {
      console.error("❌ Failed to add expense:", result);
      showError(result.error || "Failed to add expense");
    }
  } catch (error) {
    console.error("❌ Exception during expense submission:", error);
    showError("An error occurred while adding expense");
  } finally {
    dashboardState.isSubmitting.expense = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Category Form Handler
document.getElementById("addCategoryForm")
?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (dashboardState.isSubmitting.category) {
    console.warn("⚠️ Category submission already in progress");
    return;
  }
  
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

    console.log("📤 Submitting category:", categoryData);
    const result = await api.createCategory(categoryData);
    console.log("📥 Create category result:", result);
    
    if (result.success) {
      console.log("✅ Category added successfully");
      showSuccess("Category added successfully!");
      closeAddCategoryModal();
      await loadCategories();
      populateDropdowns();
    } else {
      console.error("❌ Failed to add category:", result);
      showError(result.error || "Failed to add category");
    }
  } catch (error) {
    console.error("❌ Exception during category submission:", error);
    showError("An error occurred while adding category");
  } finally {
    dashboardState.isSubmitting.category = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Payment Type Form Handler
document.getElementById("addPaymentForm")
?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (dashboardState.isSubmitting.payment) {
    console.warn("⚠️ Payment type submission already in progress");
    return;
  }
  
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

    console.log("📤 Submitting payment type:", paymentData);
    const result = await api.createPaymentType(paymentData);
    console.log("📥 Create payment type result:", result);
    
    if (result.success) {
      console.log("✅ Payment type added successfully");
      showSuccess("Payment type added successfully!");
      closeAddPaymentModal();
      await loadPaymentTypes();
      populateDropdowns();
    } else {
      console.error("❌ Failed to add payment type:", result);
      showError(result.error || "Failed to add payment type");
    }
  } catch (error) {
    console.error("❌ Exception during payment type submission:", error);
    showError("An error occurred while adding payment type");
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
  console.log("✅", message);
  const alert = createAlert(message, "success");
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function showError(message) {
  console.error("❌", message);
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
  console.log("📊 Navigating to expenses page");
  window.location.href = "../Components/expense.html";
}

// Close modals on overlay click
document.getElementById("addExpenseModal")
?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeAddExpenseModal();
});

document.getElementById("addCategoryModal")
?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeAddCategoryModal();
});

document.getElementById("addPaymentModal")
?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeAddPaymentModal();
});

// Keyboard shortcuts
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
    console.log("🔄 Auto-refreshing dashboard data");
    await loadCurrentMonthExpenses();
    updateStats();
    displayRecentExpenses();
    
    // Update charts
    if (trendChart) {
      const dailyData = generateDailyTrendData();
      trendChart.data.datasets[0].data = dailyData.values;
      trendChart.update('none'); // Update without animation
    }
    
    if (categoryChart) {
      const categoryData = generateCategoryData();
      categoryChart.data.labels = categoryData.labels;
      categoryChart.data.datasets[0].data = categoryData.values;
      categoryChart.update('none');
    }
  }
}, 300000); // 5 minutes

// Refresh when page visible again
document.addEventListener("visibilitychange", async () => {
  if (!document.hidden && !dashboardState.loading && api.isAuthenticated()) {
    console.log("👁️ Page visible - refreshing data");
    await loadCurrentMonthExpenses();
    updateStats();
    displayRecentExpenses();
  }
});

// Welcome log
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎨 DOM loaded - initializing dashboard");
  CONFIG.utils.log("info", "Dashboard page loaded");
  initDashboard();
  
  setTimeout(() => {
    console.log(
      "%c💰 Welcome to SpendBuddy Dashboard!",
      "color: #667eea; font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%c📊 Dashboard State:",
      "color: #667eea; font-weight: bold;",
      dashboardState
    );
  }, 1000);
});

// Global error handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Unhandled promise rejection:", event.reason);
  
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes("401")
  ) {
    console.warn("⚠️ Authentication error detected - redirecting to login");
    CONFIG.utils.log(
      "warn",
      "Authentication error detected - redirecting to login"
    );
    api.handleUnauthorized();
  }
});