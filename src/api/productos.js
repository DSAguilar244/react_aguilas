import client from './client';

export const getProductos = async () => {
  const response = await client.get('/productos');
  return response.data;
};

export const getProducto = async (id) => {
  const response = await client.get(`/productos/${id}`);
  return response.data;
};

export const createProducto = async (data) => {
  const response = await client.post('/productos', data);
  return response.data;
};

export const updateProducto = async (id, data) => {
  const response = await client.put(`/productos/${id}`, data);
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await client.delete(`/productos/${id}`);
  return response.data;
};
