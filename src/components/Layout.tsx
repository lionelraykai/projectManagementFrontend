import type { PropsWithChildren } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearSession } from '../features/auth/authSlice';
import { authApi } from '../api/auth.api';
import { Button } from './ui/Button';

export function Layout({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  async function handleLogout() {
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
    // Dispatching clearSession is enough — the store's own subscriber
    // disconnects the socket whenever the session goes away (see app/store.ts).
    dispatch(clearSession());
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/projects" className="app-title">
          ProjectFlow
        </Link>
        <div className="app-header-user">
          {user && <span className="user-name">{user.name}</span>}
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
