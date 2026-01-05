import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBox, FiShoppingCart, FiArchive, FiShield } from 'react-icons/fi';
import './home.css';

const Home = () => {
  const cards = [
    { icon: FiUsers, color: 'primary', title: 'Gestión de Usuarios', text: 'Administra información de usuarios registrados.', href: '/usuarios' },
    { icon: FiBox, color: 'success', title: 'Gestión de Préstamos', text: 'Supervisa los préstamos realizados.', href: '/prestamos' },
    { icon: FiShoppingCart, color: 'danger', title: 'Gestión de Productos', text: 'Organiza tu inventario disponible.', href: '/productos' },
    { icon: FiArchive, color: 'info', title: 'Recursos', text: 'Controla y clasifica los recursos.', href: '/recursos' },
    { icon: FiShield, color: 'dark', title: 'Gestión de Roles', text: 'Administra roles y permisos de usuarios.', href: '/roles' },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Bienvenido a Águilas del Saber</h1>
        <p className="subtext">Una plataforma integral para gestionar usuarios, préstamos, productos y más de forma eficiente.</p>
      </div>

      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.title} className="home-card">
            <div className={`icon-circle ${card.color}`}>
              <card.icon aria-hidden className="home-card-icon" />
            </div>
            <h5 className="card-title">{card.title}</h5>
            <p className="card-text">{card.text}</p>
            <Link to={card.href} className={`btn btn-${card.color}`}>Acceder</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
