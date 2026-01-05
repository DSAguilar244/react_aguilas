import React, { useState } from 'react';
import './modalRecuperar.css';

const ModalRecuperar = ({ open, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  if (!open) return null;
  return (
    <div className="modal-recuperar-overlay">
      <div className="modal-recuperar-box">
        <h2>Recuperar contraseña</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit(email);
          }}
        >
          <label htmlFor="recuperar-email">Correo electrónico</label>
          <input
            id="recuperar-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
            autoFocus
          />
          <div className="modal-recuperar-actions">
            <button type="submit" className="btn-recuperar">Enviar</button>
            <button type="button" className="btn-cerrar" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalRecuperar;
