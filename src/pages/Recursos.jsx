import React, { useState, useEffect } from 'react';
import { FiArchive } from 'react-icons/fi';
import { getRecursos, createRecurso, updateRecurso, deleteRecurso } from '../api/recursos';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import '../pages/shared.css';

const Recursos = () => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState(null);
  const emptyForm = { nombre: '', descripcion: '', cantidad: 0, estado: 'disponible' };
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRecursos();
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(recursos.length / perPage));
      return Math.min(prev, totalPages);
    });
  }, [recursos.length, perPage]);

  const fetchRecursos = async () => {
    try {
      setLoading(true);
      const response = await getRecursos();
      setRecursos(Array.isArray(response) ? response : response.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar recursos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (recurso = null) => {
    if (recurso) {
      setEditingRecurso(recurso);
      setFormData({
        nombre: recurso.nombre || '',
        descripcion: recurso.descripcion || '',
        cantidad: Number(recurso.cantidad || 0),
        estado: recurso.estado || 'disponible',
      });
    } else {
      setEditingRecurso(null);
      setFormData({ ...emptyForm });
    }
    setFormError(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingRecurso(null);
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
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        cantidad: Number(formData.cantidad) || 0,
        estado: formData.estado.trim() || 'disponible',
      };
      if (editingRecurso) {
        await updateRecurso(editingRecurso.id, payload);
      } else {
        await createRecurso(payload);
      }
      await fetchRecursos();
      closeForm();
    } catch (err) {
      const message = err?.response?.data?.message || 'Error al guardar el recurso';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (recurso) => {
    setDeleteTarget(recurso);
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
      await deleteRecurso(deleteTarget.id);
      await fetchRecursos();
      closeDeleteModal();
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo eliminar el recurso';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalRecursos = recursos.length;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedRecursos = recursos.slice(startIndex, startIndex + perPage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiArchive className="page-title-icon" aria-hidden="true" />
          Gestión de Recursos
        </h1>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => openForm()}>Nuevo recurso</button>
          <button className="btn btn-primary" onClick={fetchRecursos}>Actualizar</button>
        </div>
      </div>

      {formVisible && (
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h2>{editingRecurso ? 'Editar recurso' : 'Nuevo recurso'}</h2>
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
                <label htmlFor="cantidad">Cantidad</label>
                <input id="cantidad" name="cantidad" type="number" min="0" value={formData.cantidad} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={formData.estado} onChange={handleChange}>
                  <option value="disponible">Disponible</option>
                  <option value="en uso">En uso</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="crud-field">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
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
        <div className="loading">Cargando recursos...</div>
      ) : recursos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <p className="empty-state-text">No hay recursos registrados</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecursos.map((recurso) => (
                <tr key={recurso.id}>
                  <td className="text-muted">{recurso.id}</td>
                  <td><strong>{recurso.nombre || '—'}</strong></td>
                  <td>{recurso.descripcion || '—'}</td>
                  <td className="text-center">
                    <span className="badge badge-primary">{recurso.cantidad ?? 0}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">{recurso.estado || 'disponible'}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => openForm(recurso)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(recurso)}>
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

      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalRecursos} onPageChange={setCurrentPage} />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Eliminar recurso"
        message={`¿Seguro que deseas eliminar el recurso ${deleteTarget?.nombre || ''}?`}
        confirmLabel="Eliminar"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Recursos;
