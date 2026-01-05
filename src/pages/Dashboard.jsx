import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <div>
        <strong>Usuario:</strong> {usuario ? usuario.nombre || usuario.email : '—'}
      </div>
      <div>
        <strong>Roles:</strong> {(usuario?.roles || []).map((r) => (typeof r === 'string' ? r : r.nombre || r.name)).join(', ')}
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={() => logout()}>Cerrar sesión</button>
      </div>
    </div>
  );
};

export default Dashboard;
