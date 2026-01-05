import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';
import {
  FiHome,
  FiSettings,
  FiUsers,
  FiArchive,
  FiBox,
  FiShoppingCart,
  FiShield,
  FiChevronRight,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';
import './sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRoutes = ['/usuarios', '/recursos', '/prestamos', '/productos', '/roles'];

  const isAdminSectionActive = adminRoutes.some((route) => location.pathname.startsWith(route));

  useEffect(() => {
    if (isAdminSectionActive) {
      setAdminOpen(true);
    }
  }, [isAdminSectionActive]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <img src={logo} alt="Águilas Saber" className="sidebar-logo" />
          <h4>Águilas Saber</h4>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <FiHome className="icon" aria-hidden="true" />
                <span className="text">Inicio</span>
              </NavLink>
            </li>

            {/* Administración */}
            <li>
              <button
                className={`nav-link toggle ${adminOpen ? 'expanded' : ''} ${isAdminSectionActive ? 'active' : ''}`}
                onClick={() => setAdminOpen(!adminOpen)}
              >
                <FiSettings className="icon" aria-hidden="true" />
                <span className="text">Administración</span>
                <FiChevronRight className="chevron" aria-hidden="true" />
              </button>
              <ul className={`submenu ${adminOpen ? 'open' : ''}`}>
                <li>
                  <NavLink
                    to="/usuarios"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <FiUsers className="icon" aria-hidden="true" />
                    <span className="text">Usuarios</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/recursos"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <FiArchive className="icon" aria-hidden="true" />
                    <span className="text">Recursos</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/prestamos"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <FiBox className="icon" aria-hidden="true" />
                    <span className="text">Préstamos</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/productos"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <FiShoppingCart className="icon" aria-hidden="true" />
                    <span className="text">Productos</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/roles"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <FiShield className="icon" aria-hidden="true" />
                    <span className="text">Roles</span>
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" aria-hidden="true">
              <FiUser />
            </div>
            <div className="user-details">
              <div className="user-name">{usuario?.nombre || usuario?.email || 'Usuario'}</div>
              <div className="user-email">{usuario?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <FiLogOut aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
