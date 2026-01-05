import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api/usuarios';
import { getRoles } from '../api/roles';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import '../pages/shared.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const emptyForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    roles: [],
    activo: true,
  };
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(usuarios.length / perPage));
      return Math.min(prev, totalPages);
    });
  }, [usuarios.length, perPage]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await getUsuarios();
      setUsuarios(Array.isArray(response) ? response : response.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await getRoles();
      setRoles(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRolesLoading(false);
    }
  };

  const openForm = (usuario = null) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        password: '',
        roles: Array.isArray(usuario.roles)
          ? usuario.roles.map((rol) => String(rol.id || rol.role_id || rol.pivot?.role_id || rol))
          : [],
        activo: Boolean(usuario.activo),
      });
    } else {
      setEditingUser(null);
      setFormData({ ...emptyForm });
    }
    setFormError(null);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditingUser(null);
    setFormData({ ...emptyForm });
    setFormError(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'activo' ? value === 'true' : value,
    }));
  };

  const handleRolesChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, roles: selected }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (!editingUser && formData.roles.length === 0) {
        setFormError('Selecciona al menos un rol.');
        setSaving(false);
        return;
      }

      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        roles: formData.roles.map((r) => Number(r)),
        activo: Boolean(formData.activo),
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }
      if (editingUser) {
        await updateUsuario(editingUser.id, payload);
      } else {
        if (!payload.password) {
          throw new Error('La contraseña es obligatoria para un usuario nuevo.');
        }
        await createUsuario(payload);
      }
      await fetchUsuarios();
      closeForm();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Error al guardar el usuario';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (usuario) => {
    setDeleteTarget(usuario);
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
      await deleteUsuario(deleteTarget.id);
      await fetchUsuarios();
      closeDeleteModal();
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo eliminar el usuario';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalUsuarios = usuarios.length;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedUsuarios = usuarios.slice(startIndex, startIndex + perPage);

  const getRolesText = (usuario) => {
    if (!usuario.roles) return '—';
    return Array.isArray(usuario.roles)
      ? usuario.roles.map((r) => (typeof r === 'string' ? r : r.nombre || r.name)).join(', ')
      : '—';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiUsers className="page-title-icon" aria-hidden="true" />
          Gestión de Usuarios
        </h1>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => openForm()}>Nuevo usuario</button>
          <button className="btn btn-primary" onClick={fetchUsuarios}>Actualizar</button>
        </div>
      </div>

      {formVisible && (
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h2>{editingUser ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <button className="btn btn-secondary btn-sm" onClick={closeForm} type="button">Cerrar</button>
          </div>
          {formError && <div className="crud-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="crud-grid">
              <div className="crud-field">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="apellido">Apellido</label>
                <input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="email">Correo electrónico</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
              <div className="crud-field">
                <label htmlFor="password">Contraseña {editingUser && <span style={{ fontWeight: 400 }}>(solo si deseas cambiarla)</span>}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={editingUser ? 'Dejar vacío para mantener' : ''}
                  required={!editingUser}
                />
              </div>
              <div className="crud-field">
                <label htmlFor="roles">Roles</label>
                <select id="roles" multiple value={formData.roles} onChange={handleRolesChange} disabled={rolesLoading}>
                  {roles.map((rol) => (
                    <option key={rol.id} value={String(rol.id)}>
                      {rol.name || rol.nombre}
                    </option>
                  ))}
                </select>
                <span className="crud-note">Mantén presionadas Ctrl/⌘ para seleccionar múltiples.</span>
              </div>
              <div className="crud-field">
                <label htmlFor="activo">Estado</label>
                <select id="activo" name="activo" value={formData.activo ? 'true' : 'false'} onChange={handleChange}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
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
        <div className="loading">Cargando usuarios...</div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p className="empty-state-text">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Roles</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="text-muted">{usuario.id}</td>
                  <td>{usuario.nombre || '—'}</td>
                  <td>{usuario.apellido || '—'}</td>
                  <td>{usuario.email || '—'}</td>
                  <td>{usuario.telefono || '—'}</td>
                  <td>{getRolesText(usuario)}</td>
                  <td>
                    <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => openForm(usuario)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(usuario)}>
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

      <Pagination
        currentPage={currentPage}
        perPage={perPage}
        totalItems={totalUsuarios}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar a ${deleteTarget?.nombre || deleteTarget?.email || 'este usuario'}?`}
        confirmLabel="Eliminar"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Usuarios;
