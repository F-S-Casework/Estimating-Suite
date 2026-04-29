// Login view — rendered by App() when no Supabase session exists
function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await window.sb.auth.signInWithPassword({ email, password });
    if (authError) setError('Invalid email or password');
    setLoading(false);
    // On success: onAuthStateChange in App() fires automatically — no navigation needed here
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">F&amp;S Estimating Suite</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoFocus
            autoComplete="email"
          />
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn primary login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

window.Views = Object.assign(window.Views || {}, { login: LoginView });
