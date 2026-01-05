import client from './client';

export const getRecursos = async () => {
  const response = await client.get('/recursos');
  return response.data;
};

export const getRecurso = async (id) => {
  const response = await client.get(`/recursos/${id}`);
  return response.data;
};

export const createRecurso = async (data) => {
  const response = await client.post('/recursos', data);
  return response.data;
};

export const updateRecurso = async (id, data) => {
  const response = await client.put(`/recursos/${id}`, data);
  return response.data;
};

export const deleteRecurso = async (id) => {
  const response = await client.delete(`/recursos/${id}`);
  return response.data;
};
