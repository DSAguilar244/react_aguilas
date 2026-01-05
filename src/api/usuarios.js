import client from './client';

export const getUsuarios = async () => {
  const response = await client.get('/usuarios');
  return response.data;
};

export const getUsuario = async (id) => {
  const response = await client.get(`/usuarios/${id}`);
  return response.data;
};

export const createUsuario = async (data) => {
  const response = await client.post('/usuarios', data);
  return response.data;
};

export const updateUsuario = async (id, data) => {
  const response = await client.put(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id) => {
  const response = await client.delete(`/usuarios/${id}`);
  return response.data;
};
