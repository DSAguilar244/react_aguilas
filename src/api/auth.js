import client from './client';

export const login = async (email, password) => {
  const response = await client.post('/login', { email, password });
  // The backend returns `{ success, token, usuario }` - store token and user
  const { token, usuario } = response.data;
  if (token) {
    localStorage.setItem('token', token);
  }
  if (usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export const getUsuario = () => {
  try {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!localStorage.getItem('token');