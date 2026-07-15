import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAppDispatch } from '../app/hooks';
import { setSession } from '../features/auth/authSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Card } from '../components/ui/Card';
import type { ApiErrorShape } from '../api/client';

type Mode = 'login' | 'register';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      mode === 'login' ? authApi.login({ email, password }) : authApi.register({ name, email, password }),
    onSuccess: (session) => {
      dispatch(setSession(session));
      navigate('/projects', { replace: true });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  const error = mutation.error as ApiErrorShape | null;

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h1>ProjectFlow</h1>
        <p className="auth-subtitle">Real-time project &amp; task tracking</p>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={mode === 'register' ? 8 : undefined}
            required
          />
          {error && <ErrorBanner message={error.message} details={error.details} />}
          <Button type="submit" isLoading={mutation.isPending}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
