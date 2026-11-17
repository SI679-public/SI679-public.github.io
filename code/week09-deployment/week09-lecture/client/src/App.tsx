import { useState } from 'react';
import type { User } from './types.ts';
import { getCurrentUser, logout } from './api/auth.ts';
import { Header } from './components/Header.tsx';
import type { View } from './components/Header.tsx';
import { LoginForm } from './components/LoginForm.tsx';
import { Shop } from './components/Shop.tsx';
import { MyOrders } from './components/MyOrders.tsx';
import { OrderQueue } from './components/OrderQueue.tsx';
import { Inventory } from './components/Inventory.tsx';

// #region state
// Send each kind of user to the right screen.
const homeFor = (user: User | null): View =>
  user?.role === 'staff' ? 'queue' : 'shop';

export const App = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [view, setView] = useState<View>(homeFor(user));

  const handleLogin = (loggedIn: User) => {
    setUser(loggedIn);
    setView(homeFor(loggedIn));
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView('shop');
  };
  // #endregion state

  // #region render
  return (
    <>
      <Header
        user={user}
        view={view}
        onNavigate={setView}
        onLogout={handleLogout}
      />
      <main>
        {view === 'login' && (
          <LoginForm onLogin={handleLogin} onCancel={() => setView('shop')} />
        )}
        {view === 'shop' && (
          <Shop user={user} onLoginClick={() => setView('login')} />
        )}
        {view === 'my-orders' && <MyOrders />}
        {view === 'queue' && <OrderQueue />}
        {view === 'inventory' && <Inventory />}
      </main>
    </>
  );
  // #endregion render
};
