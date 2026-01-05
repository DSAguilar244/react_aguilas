import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './navbar.css';

const Navbar = ({ onMenuToggle }) => {
  const { usuario, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Hamburger Menu */}
        <button className="hamburger" onClick={onMenuToggle} aria-label="Abrir menú">
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Águilas Saber" />
          <span>Águilas Saber</span>
        </Link>

        {/* User button removed as requested */}
      </div>
    </nav>
  );
};

export default Navbar;
