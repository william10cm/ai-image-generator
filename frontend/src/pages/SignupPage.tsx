import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import "./AuthPage.css";

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="auth-page__error">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" /> Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
      <p className="auth-page__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default SignupPage;
