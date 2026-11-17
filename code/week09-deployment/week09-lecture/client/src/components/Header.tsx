import type { User } from '../types.ts';

export type View = 'login' | 'shop' | 'my-orders' | 'queue' | 'inventory';

// The tabs each kind of user sees.
const customerTabs: { view: View; label: string }[] = [
  { view: 'shop', label: 'Shop' },
  { view: 'my-orders', label: 'My orders' }
];
const staffTabs: { view: View; label: string }[] = [
  { view: 'queue', label: 'Orders' },
  { view: 'inventory', label: 'Inventory' }
];

type Props = {
  user: User | null;
  view: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
};

export const Header = ({ user, view, onNavigate, onLogout }: Props) => {
  const tabs = !user ? [] : user.role === 'staff' ? staffTabs : customerTabs;

  return (
    <header>
      <nav>
        <ul>
          <li>
            <strong className="brand">☕ Maize & Brew ☕</strong>
          </li>
          {tabs.map((tab) => (
            <li key={tab.view}>
              <button
                className={tab.view === view ? 'tab active' : 'tab'}
                onClick={() => onNavigate(tab.view)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <ul>
          {user ? (
            <>
              <li>
                <small>
                  {user.username}
                  {user.role === 'staff' && <span className="role">staff</span>}
                </small>
              </li>
              <li>
                <button className="ghost" onClick={onLogout}>
                  Log out
                </button>
              </li>
            </>
          ) : (
            view !== 'login' && (
              <li>
                <button onClick={() => onNavigate('login')}>Log in</button>
              </li>
            )
          )}
        </ul>
      </nav>
    </header>
  );
};
