import client from './client';

export const getRoles = async () => {
  const response = await client.get('/roles');
  return response.data;
};

export const getRole = async (id) => {
  const response = await client.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (data) => {
  const response = await client.post('/roles', data);
  return response.data;
};

export const updateRole = async (id, data) => {
  const response = await client.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await client.delete(`/roles/${id}`);
  return response.data;
};
