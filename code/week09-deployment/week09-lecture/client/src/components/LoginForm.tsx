import { useState } from 'react';
import type { FormEvent } from 'react';
import type { User } from '../types.ts';
import { login, register } from '../api/auth.ts';

type Props = {
  onLogin: (user: User) => void;
  onCancel: () => void;
};

export const LoginForm = ({ onLogin, onCancel }: Props) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user =
        mode === 'login'
          ? await login(username, password)
          : await register(username, password);
      onLogin(user);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <article className="login">
      <h2>{mode === 'login' ? 'Log in' : 'Create an account'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" aria-busy={busy} disabled={busy}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
      <p>
        <small>
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <button
            className="link"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </button>
          {' · '}
          <button className="link" onClick={onCancel}>
            Back to the shop
          </button>
        </small>
      </p>
    </article>
  );
};
