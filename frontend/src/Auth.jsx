
import { useState } from "react";
import { apiRequest } from "./api";

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = isRegister
        ? "/auth/register"
        : "/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (isRegister) {
        setIsRegister(false);
        setPassword("");
        setError("Account created! Please log in.");
      } else {
        localStorage.setItem("spendwise_token", data.token);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand">
          SpendWise<span>.</span>
        </h1>

        <p className="eyebrow">YOUR FINANCIAL SPACE</p>
        <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>

        <p className="subtitle">
          {isRegister
            ? "Start building better money habits."
            : "Sign in to manage your money."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : 1}
            required
          />

          {error && <p className="auth-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account? "
            : "New to SpendWise? "}

          <button
            type="button"
            className="text-button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Log in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
