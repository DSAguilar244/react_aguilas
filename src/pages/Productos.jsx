import React, { useState, useEffect } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/productos';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import '../pages/shared.css';

const estadoOptions = ['disponible', 'agotado', 'en tránsito'];
const emptyForm = { nombre: '', estado: 'disponible', fecha_entrada: '', fecha_salida: '', cantidad: 0 };

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(productos.length / perPage));
      return Math.min(prev, totalPages);
    });
  }, [productos.length, perPage]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await getProductos();
      setProductos(Array.isArray(response) ? response : response.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (producto = null) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre || '',
        estado: producto.estado || 'disponible',
        fecha_entrada: producto.fecha_entrada ? producto.fecha_entrada.slice(0, 10) : '',
        fecha_salida: producto.fecha_salida ? producto.fecha_salida.slice(0, 10) : '',
        cantidad: Number(producto.cantidad || 0),
      });
    } else {
      setEditingProducto(null);
      setFormData({ ...emptyForm });
    }
    setFormError(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingProducto(null);
    setFormData({ ...emptyForm });
    setFormError(null);
    setFormVisible(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'cantidad') {
      setFormData((prev) => ({ ...prev, cantidad: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (formData.fecha_entrada && formData.fecha_salida && formData.fecha_salida < formData.fecha_entrada) {
        setFormError('La fecha de salida no puede ser anterior a la fecha de entrada.');
        setSaving(false);
        return;
      }

      const payload = {
        nombre: formData.nombre.trim(),
        estado: formData.estado.trim() || 'disponible',
        fecha_entrada: formData.fecha_entrada,
        fecha_salida: formData.fecha_salida,
        cantidad: Number(formData.cantidad) || 0,
      };

      if (editingProducto) {
        await updateProducto(editingProducto.id, payload);
      } else {
        await createProducto(payload);
      }

      await fetchProductos();
      closeForm();
    } catch (err) {
      const message = err?.response?.data?.message || 'Error al guardar el producto';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (producto) => {
    setDeleteTarget(producto);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteProducto(deleteTarget.id);
      await fetchProductos();
      closeDeleteModal();
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo eliminar el producto';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalProductos = productos.length;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedProductos = productos.slice(startIndex, startIndex + perPage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiShoppingCart className="page-title-icon" aria-hidden="true" />
          Gestión de Productos
        </h1>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => openForm()}>Nuevo producto</button>
          <button className="btn btn-primary" onClick={fetchProductos}>Actualizar</button>
        </div>
      </div>

      {formVisible && (
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h2>{editingProducto ? 'Editar producto' : 'Nuevo producto'}</h2>
            <button className="btn btn-secondary btn-sm" type="button" onClick={closeForm}>Cerrar</button>
          </div>
          {formError && <div className="crud-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="crud-grid">
              <div className="crud-field">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={formData.estado} onChange={handleChange}>
                  {estadoOptions.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div className="crud-field">
                <label htmlFor="fecha_entrada">Fecha de entrada</label>
                <input id="fecha_entrada" name="fecha_entrada" type="date" value={formData.fecha_entrada} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="fecha_salida">Fecha de salida</label>
                <input id="fecha_salida" name="fecha_salida" type="date" value={formData.fecha_salida} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="cantidad">Cantidad</label>
                <input id="cantidad" name="cantidad" type="number" min="0" value={formData.cantidad} onChange={handleChange} required />
              </div>
            </div>
            <div className="crud-actions">
              <button className="btn btn-secondary" type="button" onClick={closeForm} disabled={saving}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : productos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-text">No hay productos registrados</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Fecha Entrada</th>
                <th>Fecha Salida</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProductos.map((producto) => (
                <tr key={producto.id}>
                  <td className="text-muted">{producto.id}</td>
                  <td><strong>{producto.nombre || '—'}</strong></td>
                  <td>
                    <span className="badge badge-primary">{producto.estado || 'disponible'}</span>
                  </td>
                  <td>{producto.fecha_entrada ? new Date(producto.fecha_entrada).toLocaleDateString() : '—'}</td>
                  <td>{producto.fecha_salida ? new Date(producto.fecha_salida).toLocaleDateString() : '—'}</td>
                  <td className="text-center">{producto.cantidad ?? 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => openForm(producto)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(producto)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalProductos} onPageChange={setCurrentPage} />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Eliminar producto"
        message={`¿Seguro que deseas eliminar el producto ${deleteTarget?.nombre || ''}?`}
        confirmLabel="Eliminar"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Productos;
