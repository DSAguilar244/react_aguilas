import client from './client';

export const getPrestamos = async () => {
  const response = await client.get('/prestamos');
  return response.data;
};

export const getPrestamo = async (id) => {
  const response = await client.get(`/prestamos/${id}`);
  return response.data;
};

export const createPrestamo = async (data) => {
  const response = await client.post('/prestamos', data);
  return response.data;
};

export const updatePrestamo = async (id, data) => {
  const response = await client.put(`/prestamos/${id}`, data);
  return response.data;
};

export const deletePrestamo = async (id) => {
  const response = await client.delete(`/prestamos/${id}`);
  return response.data;
};
