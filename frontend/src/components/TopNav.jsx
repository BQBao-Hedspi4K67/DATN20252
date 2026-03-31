import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopNav() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="topnav">
      <Link to="/" className="brand-mark">NextGen LMS</Link>
      <nav className="topnav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        {isAuthenticated && <NavLink to="/student/learning">My Learning</NavLink>}
        {isAuthenticated && <NavLink to="/student/certificates">Certificates</NavLink>}
        {isAuthenticated && (user.role === 'instructor' || user.role === 'admin') && (
          <NavLink to="/instructor/studio">Instructor Studio</NavLink>
        )}
        {isAuthenticated && user.role === 'admin' && <NavLink to="/admin/console">Admin</NavLink>}
      </nav>
      <div className="topnav-user">
        {isAuthenticated ? (
          <>
            <span>{user.fullName || user.email}</span>
            <button type="button" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn-small">Login</Link>
        )}
      </div>
    </header>
  );
}
