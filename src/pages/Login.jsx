import React, { useState, useContext } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './login.css';
import ModalRecuperar from '../components/ModalRecuperar';
import '../pages/modalRecuperar.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [recuperarMsg, setRecuperarMsg] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(username, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Login falló');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src={logo} alt="Águilas Saber" className="login-logo" />
          <h1 className="login-title">Iniciar Sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-icon-wrapper">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                disabled={loading}
              />
              <span className="input-icon-user">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Mostrar/Ocultar contraseña"
                tabIndex={-1}
                style={{background: 'none', border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              >
                {showPassword ? (
                  <FiEye size={22} />
                ) : (
                  <FiEyeOff size={22} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="forgot-password">
          <button type="button" className="forgot-link" style={{background:'none',border:'none',padding:0,margin:0,cursor:'pointer'}} onClick={()=>setModalOpen(true)}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        {recuperarMsg && (
          <div style={{color:'#28a745',marginTop:'0.7rem',textAlign:'center',fontWeight:500}}>{recuperarMsg}</div>
        )}
      </div>
      <ModalRecuperar
        open={modalOpen}
        onClose={()=>setModalOpen(false)}
        onSubmit={email => {
          setRecuperarMsg('Si el correo existe, recibirás instrucciones para recuperar tu contraseña.');
          setModalOpen(false);
        }}
      />
      <div className="login-background"></div>
    </div>
  );
};

export default Login;
