import { useState, useEffect, useCallback } from "react";
import "./App.css";
import Auth from "./Auth";
import { apiRequest } from "./api";

function App() {
  const [user, setUser] = useState(() =>
    localStorage.getItem("spendwise_token") ? "checking" : null
  );

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const [transactionType, setTransactionType] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [activePage, setActivePage] = useState("Dashboard");

  const loadDashboard = useCallback(async () => {
    try {
      const [summaryData, transactionData] = await Promise.all([
        apiRequest("/transactions/summary"),
        apiRequest("/transactions"),
      ]);

      setSummary(summaryData);
      setTransactions(transactionData);
      setError("");
    } catch (err) {
      if (
        err.message === "Invalid or expired token" ||
        err.message === "Authentication token is required"
      ) {
        localStorage.removeItem("spendwise_token");
        setUser(null);
        return;
      }

      setError(err.message || "Could not load your transactions.");
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("spendwise_token")) {
      loadDashboard().finally(() => {
        setUser((currentUser) =>
          currentUser === "checking"
            ? { name: "SpendWise User", email: "" }
            : currentUser
        );
      });
    }
  }, [loadDashboard]);

  async function handleAddTransaction(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          type: transactionType,
          category,
        }),
      });

      setTitle("");
      setAmount("");
      setTransactionType("expense");
      setCategory("Food");
      setSuccess("Transaction added successfully!");

      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not add the transaction.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTransaction(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await apiRequest(`/transactions/${id}`, {
        method: "DELETE",
      });

      setSuccess("Transaction deleted successfully!");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not delete the transaction.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("spendwise_token");
    setUser(null);
    setTransactions([]);
    setSummary({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
    });
    setActivePage("Dashboard");
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  const visibleTransactions = transactions.filter((transaction) => {
    return filter === "all" || transaction.type === filter;
  });

  if (user === null) {
    return (
      <Auth
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          loadDashboard();
        }}
      />
    );
  }

  if (user === "checking") {
    return (
      <div className="app">
        <main className="main">
          <p>Loading your SpendWise dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">
          SpendWise<span>.</span>
        </h2>

        <p className="menu-title">MENU</p>

        <button
          type="button"
          className={`menu-item ${activePage === "Dashboard" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Dashboard");
            setError("");
            setSuccess("");
          }}
        >
          ▦ Dashboard
        </button>

        <button
          type="button"
          className={`menu-item ${activePage === "Transactions" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Transactions");
            setError("");
            setSuccess("");
          }}
        >
          ↔ Transactions
        </button>

        <button
          type="button"
          className={`menu-item ${activePage === "Settings" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Settings");
            setError("");
            setSuccess("");
          }}
        >
          ⚙ Settings
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-icon">₹</div>
          <p>Build better money habits.</p>
          <span>Your money, your control.</span>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>{activePage}</h1>
            <p className="subtitle">
              {activePage === "Dashboard" &&
                "Understand your money. Make it count."}
              {activePage === "Transactions" &&
                "View and manage all your transactions."}
              {activePage === "Settings" &&
                "Manage your SpendWise account."}
            </p>
          </div>

          <button
            type="button"
            className="avatar"
            title="Log out"
            onClick={handleLogout}
          >
            {typeof user === "object" && user?.name
              ? user.name.charAt(0).toUpperCase()
              : "S"}
          </button>
        </header>

        {error && <p className="auth-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {activePage === "Dashboard" && (
          <>
            <section className="welcome">
              <div>
                <p className="eyebrow">YOUR FINANCIAL SPACE</p>
                <h2>
                  Welcome
                  {typeof user === "object" && user?.name
                    ? `, ${user.name}`
                    : ""}
                  ! 👋
                </h2>
                <p>
                  Take control of your money, one transaction at a time.
                </p>
              </div>
              <div className="welcome-icon">₹</div>
            </section>

            <section className="stats">
              <div className="stat-card balance">
                <div className="stat-heading">
                  <span>Total balance</span>
                  <span className="stat-icon">₹</span>
                </div>
                <h2>{formatMoney(summary.balance)}</h2>
                <span className="stat-note">Income minus expenses</span>
              </div>

              <div className="stat-card">
                <div className="stat-heading">
                  <span>Total income</span>
                  <span className="stat-icon income-icon">↙</span>
                </div>
                <h2>{formatMoney(summary.totalIncome)}</h2>
                <span className="stat-note positive">Money received</span>
              </div>

              <div className="stat-card">
                <div className="stat-heading">
                  <span>Total expenses</span>
                  <span className="stat-icon expense-icon">↗</span>
                </div>
                <h2>{formatMoney(summary.totalExpenses)}</h2>
                <span className="stat-note negative">Money spent</span>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <p className="eyebrow">QUICK ACTIONS</p>
                <h2>Record a transaction</h2>
                <p className="panel-description">
                  Add income or an expense to your records.
                </p>

                <form onSubmit={handleAddTransaction}>
                  <label htmlFor="type">Transaction type</label>
                  <select
                    id="type"
                    value={transactionType}
                    onChange={(event) =>
                      setTransactionType(event.target.value)
                    }
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>

                  <label htmlFor="title">Description</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g. Groceries or Salary"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />

                  <label htmlFor="amount">Amount (₹)</label>
                  <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />

                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Salary</option>
                    <option>Education</option>
                    <option>Bills</option>
                    <option>Entertainment</option>
                    <option>Other</option>
                  </select>

                  <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "+ Add transaction"}
                  </button>
                </form>
              </div>

              <div className="panel">
                <p className="eyebrow">YOUR ACTIVITY</p>
                <h2>Recent transactions</h2>
                <p className="panel-description">
                  Your saved income and expenses.
                </p>

                <label htmlFor="filter">Filter transactions</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="all">All transactions</option>
                  <option value="income">Income only</option>
                  <option value="expense">Expenses only</option>
                </select>

                {visibleTransactions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">↗</div>
                    <h3>No transactions found</h3>
                    <p>Add your first transaction using the form.</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {visibleTransactions.map((transaction) => (
                      <div className="transaction-row" key={transaction.id}>
                        <div className="transaction-info">
                          <div className="transaction-icon">
                            {transaction.type === "income" ? "↙" : "↗"}
                          </div>
                          <div>
                            <h3>{transaction.title}</h3>
                            <p>
                              {transaction.category} ·{" "}
                              {new Date(transaction.date).toLocaleDateString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="transaction-amount">
                          <strong
                            className={
                              transaction.type === "income"
                                ? "positive"
                                : "negative"
                            }
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatMoney(transaction.amount)}
                          </strong>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activePage === "Transactions" && (
          <section className="panel page-panel">
            <p className="eyebrow">TRANSACTION HISTORY</p>
            <h2>All transactions</h2>
            <p className="panel-description">
              Every income and expense saved to your account.
            </p>

            <label htmlFor="transactions-filter">
              Filter transactions
            </label>
            <select
              id="transactions-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All transactions</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>

            {visibleTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">↗</div>
                <h3>No transactions found</h3>
                <p>Your saved transactions will appear here.</p>
              </div>
            ) : (
              <div className="transaction-list">
                {visibleTransactions.map((transaction) => (
                  <div className="transaction-row" key={transaction.id}>
                    <div className="transaction-info">
                      <div className="transaction-icon">
                        {transaction.type === "income" ? "↙" : "↗"}
                      </div>
                      <div>
                        <h3>{transaction.title}</h3>
                        <p>
                          {transaction.category} ·{" "}
                          {new Date(transaction.date).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="transaction-amount">
                      <strong
                        className={
                          transaction.type === "income"
                            ? "positive"
                            : "negative"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </strong>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteTransaction(transaction.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activePage === "Settings" && (
          <section className="panel page-panel">
            <p className="eyebrow">ACCOUNT PREFERENCES</p>
            <h2>Account settings</h2>
            <p className="panel-description">
              Your SpendWise account information.
            </p>

            <div className="settings-details">
              <div className="settings-row">
                <span>Account name</span>
                <strong>
                  {typeof user === "object" && user?.name
                    ? user.name
                    : "SpendWise User"}
                </strong>
              </div>

              <div className="settings-row">
                <span>Email address</span>
                <strong>
                  {typeof user === "object" && user?.email
                    ? user.email
                    : "Not available"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="settings-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          </section>
        )}

        <footer className="footer">
          SpendWise · Make every rupee count.
          <button
            type="button"
            className="text-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </footer>
      </main>
    </div>
  );
}

export default App;