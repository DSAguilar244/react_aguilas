import React, { useState, useEffect } from 'react';
import { FiBox } from 'react-icons/fi';
import { getPrestamos, createPrestamo, updatePrestamo, deletePrestamo } from '../api/prestamos';
import { getUsuarios } from '../api/usuarios';
import { getRecursos } from '../api/recursos';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import '../pages/shared.css';

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPrestamo, setEditingPrestamo] = useState(null);
  const emptyForm = {
    codigo: '',
    usuario_id: '',
    recurso_id: '',
    fecha_prestamo: '',
    fecha_devolucion: '',
    estado: 'pendiente',
  };
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPrestamos();
    fetchCatalogs();
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(prestamos.length / perPage));
      return Math.min(prev, totalPages);
    });
  }, [prestamos.length, perPage]);

  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      const response = await getPrestamos();
      setPrestamos(Array.isArray(response) ? response : response.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar préstamos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      setCatalogLoading(true);
      const [usuariosRes, recursosRes] = await Promise.all([getUsuarios(), getRecursos()]);
      setUsuarios(Array.isArray(usuariosRes) ? usuariosRes : usuariosRes.data || []);
      setRecursos(Array.isArray(recursosRes) ? recursosRes : recursosRes.data || []);
    } catch (err) {
      console.error('No se pudo cargar usuarios/recursos', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const openForm = (prestamo = null) => {
    if (prestamo) {
      setEditingPrestamo(prestamo);
      setFormData({
        codigo: prestamo.codigo || '',
        usuario_id: prestamo.usuario?.id ? String(prestamo.usuario.id) : String(prestamo.usuario_id || ''),
        recurso_id: prestamo.recurso?.id ? String(prestamo.recurso.id) : String(prestamo.recurso_id || ''),
        fecha_prestamo: prestamo.fecha_prestamo ? prestamo.fecha_prestamo.slice(0, 10) : '',
        fecha_devolucion: prestamo.fecha_devolucion ? prestamo.fecha_devolucion.slice(0, 10) : '',
        estado: prestamo.estado || 'pendiente',
      });
    } else {
      setEditingPrestamo(null);
      setFormData({ ...emptyForm });
    }
    setFormError(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingPrestamo(null);
    setFormData({ ...emptyForm });
    setFormError(null);
    setFormVisible(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'estado') {
      setFormData((prev) => ({
        ...prev,
        estado: value,
        fecha_devolucion: value === 'devuelto' ? prev.fecha_devolucion : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (formData.estado === 'devuelto' && !formData.fecha_devolucion) {
        setFormError('Debes indicar la fecha de devolución cuando el estado es Devuelto.');
        setSaving(false);
        return;
      }

      const payload = {
        codigo: formData.codigo.trim(),
        usuario_id: formData.usuario_id ? Number(formData.usuario_id) : null,
        recurso_id: formData.recurso_id ? Number(formData.recurso_id) : null,
        fecha_prestamo: formData.fecha_prestamo || null,
        fecha_devolucion: formData.estado === 'devuelto' ? formData.fecha_devolucion : null,
        estado: formData.estado,
      };
      if (editingPrestamo) {
        await updatePrestamo(editingPrestamo.id, payload);
      } else {
        await createPrestamo(payload);
      }
      await fetchPrestamos();
      closeForm();
    } catch (err) {
      const message = err?.response?.data?.message || 'Error al guardar el préstamo';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (prestamo) => {
    setDeleteTarget(prestamo);
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
      await deletePrestamo(deleteTarget.id);
      await fetchPrestamos();
      closeDeleteModal();
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo eliminar el préstamo';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPrestamos = prestamos.length;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedPrestamos = prestamos.slice(startIndex, startIndex + perPage);

  const getEstadoBadge = (estado) => {
    const estadoLower = (estado || 'pendiente').toLowerCase();
    if (estadoLower === 'devuelto') return 'badge-success';
    if (estadoLower === 'pendiente') return 'badge-warning';
    if (estadoLower === 'no devuelto') return 'badge-danger';
    return 'badge-primary';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiBox className="page-title-icon" aria-hidden="true" />
          Gestión de Préstamos
        </h1>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => openForm()} disabled={catalogLoading}>
            Nuevo préstamo
          </button>
          <button className="btn btn-primary" onClick={fetchPrestamos}>Actualizar</button>
        </div>
      </div>

      {formVisible && (
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h2>{editingPrestamo ? 'Editar préstamo' : 'Nuevo préstamo'}</h2>
            <button className="btn btn-secondary btn-sm" type="button" onClick={closeForm}>Cerrar</button>
          </div>
          {formError && <div className="crud-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="crud-grid">
              <div className="crud-field">
                <label htmlFor="codigo">Código</label>
                <input id="codigo" name="codigo" value={formData.codigo} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="usuario_id">Usuario</label>
                <select id="usuario_id" name="usuario_id" value={formData.usuario_id} onChange={handleChange} required>
                  <option value="">Selecciona un usuario</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={String(usuario.id)}>
                      {usuario.nombre || usuario.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crud-field">
                <label htmlFor="recurso_id">Recurso</label>
                <select id="recurso_id" name="recurso_id" value={formData.recurso_id} onChange={handleChange} required>
                  <option value="">Selecciona un recurso</option>
                  {recursos.map((recurso) => (
                    <option key={recurso.id} value={String(recurso.id)}>
                      {recurso.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crud-field">
                <label htmlFor="fecha_prestamo">Fecha préstamo</label>
                <input id="fecha_prestamo" name="fecha_prestamo" type="date" value={formData.fecha_prestamo} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="fecha_devolucion">Fecha devolución</label>
                <input
                  id="fecha_devolucion"
                  name="fecha_devolucion"
                  type="date"
                  value={formData.fecha_devolucion}
                  onChange={handleChange}
                  disabled={formData.estado !== 'devuelto'}
                  required={formData.estado === 'devuelto'}
                />
              </div>
              <div className="crud-field">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={formData.estado} onChange={handleChange}>
                  <option value="pendiente">Pendiente</option>
                  <option value="devuelto">Devuelto</option>
                  <option value="no devuelto">No devuelto</option>
                </select>
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
        <div className="loading">Cargando préstamos...</div>
      ) : prestamos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎁</div>
          <p className="empty-state-text">No hay préstamos registrados</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Usuario</th>
                <th>Recurso</th>
                <th>Fecha Préstamo</th>
                <th>Fecha Devolución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPrestamos.map((prestamo) => (
                <tr key={prestamo.id}>
                  <td className="text-muted">{prestamo.id}</td>
                  <td><strong>{prestamo.codigo || '—'}</strong></td>
                  <td>{prestamo.usuario?.nombre || prestamo.usuario_id || '—'}</td>
                  <td>{prestamo.recurso?.nombre || prestamo.recurso_id || '—'}</td>
                  <td>{prestamo.fecha_prestamo ? new Date(prestamo.fecha_prestamo).toLocaleDateString() : '—'}</td>
                  <td>{prestamo.fecha_devolucion ? new Date(prestamo.fecha_devolucion).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={`badge ${getEstadoBadge(prestamo.estado)}`}>
                      {prestamo.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => openForm(prestamo)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(prestamo)}>
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

      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalPrestamos} onPageChange={setCurrentPage} />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Eliminar préstamo"
        message={`¿Seguro que deseas eliminar el préstamo ${deleteTarget?.codigo || deleteTarget?.id || ''}?`}
        confirmLabel="Eliminar"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Prestamos;
