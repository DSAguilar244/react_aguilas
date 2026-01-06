import React, { useState, useEffect } from 'react';
import { FiShield } from 'react-icons/fi';
import { getRoles, createRole, updateRole, deleteRole } from '../api/roles';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import '../pages/shared.css';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const emptyForm = { name: '', descripcion: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(roles.length / perPage));
      return Math.min(prev, totalPages);
    });
  }, [roles.length, perPage]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setRoles(Array.isArray(response) ? response : response.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name || role.nombre || '',
        descripcion: role.descripcion || role.description || '',
      });
    } else {
      setEditingRole(null);
      setFormData({ ...emptyForm });
    }
    setFormError(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingRole(null);
    setFormData({ ...emptyForm });
    setFormError(null);
    setFormVisible(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        descripcion: formData.descripcion.trim() || null,
        guard_name: editingRole?.guard_name || 'api',
      };
      if (editingRole) {
        await updateRole(editingRole.id, payload);
      } else {
        await createRole(payload);
      }
      await fetchRoles();
      closeForm();
    } catch (err) {
      const message = err?.response?.data?.message || 'Error al guardar el rol';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (role) => {
    setDeleteTarget(role);
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
      await deleteRole(deleteTarget.id);
      await fetchRoles();
      closeDeleteModal();
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo eliminar el rol';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalRoles = roles.length;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedRoles = roles.slice(startIndex, startIndex + perPage);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiShield className="page-title-icon" aria-hidden="true" />
          Gestión de Roles
        </h1>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => openForm()}>Nuevo rol</button>
          <button className="btn btn-primary" onClick={fetchRoles}>Actualizar</button>
        </div>
      </div>

      {formVisible && (
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h2>{editingRole ? 'Editar rol' : 'Nuevo rol'}</h2>
            <button className="btn btn-secondary btn-sm" type="button" onClick={closeForm}>Cerrar</button>
          </div>
          {formError && <div className="crud-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="crud-grid">
              <div className="crud-field">
                <label htmlFor="name">Nombre</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
            </div>
            <div className="crud-field">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} />
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
        <div className="loading">Cargando roles...</div>
      ) : roles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p className="empty-state-text">No hay roles registrados</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoles.map((role) => (
                <tr key={role.id}>
                  <td className="text-muted">{role.id}</td>
                  <td><strong>{role.name || role.nombre || '—'}</strong></td>
                  <td>{role.descripcion || role.description || '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => openForm(role)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(role)}>
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

      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalRoles} onPageChange={setCurrentPage} />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Eliminar rol"
        message={`¿Seguro que deseas eliminar el rol ${deleteTarget?.name || deleteTarget?.nombre || ''}?`}
        confirmLabel="Eliminar"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Roles;
