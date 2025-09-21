import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import ModuloBase from '../components/ModuloBase';
import apiFetch from '../services/api';

const PAGE_LIMIT = 20;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [modalEdit, setModalEdit] = useState(null);
  const [modalDelete, setModalDelete] = useState(null);
  const [modalReset, setModalReset] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  // Estado para actualizar solo el usuario editado o cambiado
  const [refresh, setRefresh] = useState(false);
  const roles = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'jefa_comercial', label: 'Jefa Comercial' },
    { value: 'vendedor_comercial', label: 'Vendedor Comercial' },
    { value: 'jefe_laboratorio', label: 'Jefe Laboratorio' },
    { value: 'usuario_laboratorio', label: 'Usuario Laboratorio' },
    { value: 'user', label: 'User' },
  ];

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const qs = [];
        qs.push(`page=${page}`);
        qs.push(`limit=${PAGE_LIMIT}`);
        if (search) qs.push(`search=${encodeURIComponent(search)}`);
        if (role) qs.push(`role=${encodeURIComponent(role)}`);
        const url = `/api/users?${qs.join('&')}`;
        const json = await apiFetch(url);
        setUsers(json.data || []);
        setTotal(json.total || 0);
      } catch (err) {
        setError(err.message || 'Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, search, role, refresh]);

  return (
    <ModuloBase titulo="Gestión de Usuarios" descripcion="Activa o desactiva el acceso de los agentes, gestiona sus contraseñas y filtra por nombre o área.">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',gap:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{padding:'0.5rem 1rem',border:'1px solid #ddd',borderRadius:6,minWidth:220}}
        />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} style={{padding:'0.5rem',borderRadius:6,background:'#f5f5f5',fontWeight:500}}>
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setModalEdit({ id: null, name: '', apellido: '', email: '', role: 'user', area: '', active: true })}
            style={{background:'#222',color:'#fff',border:'none',borderRadius:8,padding:'0.6rem 1rem',fontWeight:600}}
          >
            + Agregar usuario
          </button>
        </div>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {!loading && !error && (
        <>
          <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'1rem',background:'#fff',boxShadow:'0 2px 8px #0001',borderRadius:8}}>
            <thead>
              <tr style={{background:'#f5f5f5'}}>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Nombre</th>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Apellido</th>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Correo</th>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Rol</th>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Área</th>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Estado</th>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Acceso</th>
                <th style={{textAlign:'center',padding:'0.7rem'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'1.5rem'}}>Sin usuarios</td></tr>}
              {users.map(u => (
                <tr key={u.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                  <td style={{fontWeight:600,textAlign:'center'}}>{u.name}</td>
                  <td style={{textAlign:'center'}}>{u.apellido || '-'}</td>
                  <td style={{textAlign:'center'}}>{u.email}</td>
                  <td style={{textAlign:'center'}}>
                    <span style={{
                      background: u.role==='admin' ? '#ffe58f' : u.role==='jefa_comercial' ? '#ffd6e7' : u.role==='vendedor_comercial' ? '#e6f7ff' : u.role==='jefe_laboratorio' ? '#d9f7be' : u.role==='usuario_laboratorio' ? '#f4ffb8' : '#f5f5f5',
                      color: u.role==='admin' ? '#ad8b00' : u.role==='jefa_comercial' ? '#c41d7f' : u.role==='vendedor_comercial' ? '#096dd9' : u.role==='jefe_laboratorio' ? '#389e0d' : u.role==='usuario_laboratorio' ? '#b7a200' : '#222',
                      borderRadius:8,padding:'0.2rem 0.7rem',fontSize:13,fontWeight:600,display:'inline-block'
                    }}>{roles.find(r=>r.value===u.role)?.label||u.role}</span>
                  </td>
                   <td style={{textAlign:'center'}}>{u.area || '-'}</td>
                   <td style={{textAlign:'center'}}>
                     <label style={{display:'inline-flex',alignItems:'center',cursor:'pointer'}}>
                       <input
                         type="checkbox"
                         checked={u.active}
                         onChange={async e => {
                           try {
                             await apiFetch(`/api/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ active: e.target.checked }) });
                             setRefresh(r => !r);
                           } catch (err) {
                             alert(err.message || 'Error al actualizar estado');
                           }
                         }}
                         style={{marginRight:8}}
                       />
                       <span style={{fontWeight:600,color:u.active?'#0a7d2c':'#c0392b'}}>{u.active ? 'Activo' : 'Inactivo'}</span>
                     </label>
                   </td>
                 <td style={{textAlign:'center'}}>
                   <button title="Editar" style={{background:'none',border:'1px solid #bbb',borderRadius:4,padding:'0.2rem 0.5rem',cursor:'pointer',marginRight:8}}
                     onClick={()=>setModalEdit(u)}
                   ><span role="img" aria-label="edit" style={{color:'#fa8c16'}}>✏️</span></button>
                   <button title="Restablecer contraseña" style={{background:'none',border:'none',cursor:'pointer',marginRight:8}}
                     onClick={()=>setModalReset(u)}
                   ><span role="img" aria-label="reset" style={{color:'#faad14'}}>🔑</span></button>
                   <button title="Eliminar" style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer'}}
                     onClick={()=>setModalDelete(u)}
                   ><span role="img" aria-label="delete">🗑️</span></button>
                 </td>
      {/* MODAL EDITAR USUARIO */}
      <Modal open={!!modalEdit} onClose={()=>setModalEdit(null)}>
        {modalEdit && (
            <form onSubmit={async e => {
            e.preventDefault();
            const form = e.target;
            const nombre = form.nombre.value.trim();
            const apellido = form.apellido.value.trim();
            const email = form.email.value.trim();
            const rol = form.rol.value;
            const area = form.area.value.trim();
            const isCreate = !modalEdit.id;
            const password = isCreate ? form.password.value.trim() : undefined;
            try {
              if (isCreate) {
                if (!password || password.length < 6) {
                  alert('La contraseña debe tener al menos 6 caracteres');
                  return;
                }
                await apiFetch(`/api/users`, { method: 'POST', body: JSON.stringify({ name: nombre, apellido, email, role: rol, area, password, active: true }) });
              } else {
                await apiFetch(`/api/users/${modalEdit.id}`, { method: 'PATCH', body: JSON.stringify({ name: nombre, apellido, email, role: rol, area }) });
              }
              setModalEdit(null);
              setRefresh(r => !r);
            } catch (err) {
              alert(err.message || 'Error al editar usuario');
            }
          }}>
            <h2 style={{marginBottom:8}}>{modalEdit.id ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <div style={{color:'#888',marginBottom:18}}>{modalEdit.id ? 'Actualiza los datos del usuario.' : 'Completa los datos para crear un nuevo usuario.'}</div>
            <div style={{display:'flex',gap:'1rem',marginBottom:18}}>
              <div style={{flex:1}}>
                <label>Nombre</label>
                <input name="nombre" defaultValue={modalEdit.name} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'2px solid #222',marginTop:4,fontWeight:600}} required />
              </div>
              <div style={{flex:1}}>
                <label>Apellido</label>
                <input name="apellido" defaultValue={modalEdit.apellido} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ccc',marginTop:4}} required />
              </div>
              <div style={{flex:1}}>
                <label>Área</label>
                <input name="area" defaultValue={modalEdit.area} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ccc',marginTop:4}} required />
              </div>
            </div>
            <div style={{marginBottom:18}}>
              <label>Correo Electrónico</label>
              <input name="email" defaultValue={modalEdit.email} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ccc',marginTop:4}} required />
            </div>
            {!modalEdit.id && (
              <div style={{marginBottom:18}}>
                <label>Contraseña</label>
                <input name="password" type="password" minLength={6} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ccc',marginTop:4}} required />
              </div>
            )}
            <div style={{marginBottom:24}}>
              <label>Rol</label>
              <select name="rol" defaultValue={modalEdit.role} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ccc',marginTop:4}}>
                {roles.filter(r=>r.value).map(r=>(<option key={r.value} value={r.value}>{r.label}</option>))}
              </select>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:'1rem'}}>
              <button type="button" onClick={()=>setModalEdit(null)} style={{background:'#fff',border:'2px solid #222',borderRadius:8,padding:'0.7rem 2.2rem',fontWeight:600}}>Cancelar</button>
              <button type="submit" style={{background:'#222',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 2.2rem',fontWeight:600}}>Guardar Cambios</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL RESTABLECER CONTRASEÑA */}
      <Modal open={!!modalReset} onClose={()=>setModalReset(null)}>
        {modalReset && (
            <form onSubmit={async e => {
            e.preventDefault();
            const password = e.target.password.value.trim();
            if (password.length < 6) {
              alert('La contraseña debe tener al menos 6 caracteres');
              return;
            }
            try {
              await apiFetch(`/api/users/${modalReset.id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) });
              setModalReset(null);
              setRefresh(r => !r);
            } catch (err) {
              alert(err.message || 'Error al restablecer contraseña');
            }
          }}>
            <h2 style={{marginBottom:8}}>Restablecer contraseña</h2>
            <div style={{color:'#888',marginBottom:18}}>Escribe la nueva contraseña para el usuario <b>{modalReset.name}</b>. Debe tener al menos 6 caracteres.</div>
            <div style={{marginBottom:18}}>
              <label>Nueva contraseña</label>
              <input name="password" type="password" minLength={6} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ccc',marginTop:4}} required />
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:'1rem'}}>
              <button type="button" onClick={()=>setModalReset(null)} style={{background:'#fff',border:'2px solid #222',borderRadius:8,padding:'0.7rem 2.2rem',fontWeight:600}}>Cancelar</button>
              <button type="submit" style={{background:'#222',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 2.2rem',fontWeight:600}}>Restablecer</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL ELIMINAR USUARIO */}
      <Modal open={!!modalDelete} onClose={()=>setModalDelete(null)}>
        {modalDelete && (
            <form onSubmit={async e => {
            e.preventDefault();
            if (e.target.confirm.value === 'ELIMINAR') {
              try {
                await apiFetch(`/api/users/${modalDelete.id}`, { method: 'DELETE' });
                setModalDelete(null);
                setRefresh(r => !r);
              } catch (err) {
                alert(err.message || 'Error al eliminar usuario');
              }
            } else {
              alert('Debes escribir ELIMINAR para confirmar');
            }
          }}>
            <h2 style={{marginBottom:8}}>¿Estás absolutamente seguro?</h2>
            <div style={{color:'#888',marginBottom:18}}>Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario <b>{modalDelete.name}</b> y todos sus datos asociados.</div>
            <div style={{marginBottom:18}}>
              <label>Por favor, escribe <b>ELIMINAR</b> para confirmar.</label>
              <input name="confirm" style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ccc',marginTop:4}} required />
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:'1rem'}}>
              <button type="button" onClick={()=>setModalDelete(null)} style={{background:'#fff',border:'2px solid #222',borderRadius:8,padding:'0.7rem 2.2rem',fontWeight:600}}>Cancelar</button>
              <button type="submit" style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 2.2rem',fontWeight:600}}>Sí, eliminar usuario</button>
            </div>
          </form>
        )}
      </Modal>
                  
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</button>
            <span>Página {page} de {Math.ceil(total/PAGE_LIMIT)||1}</span>
            <button disabled={page*PAGE_LIMIT>=total} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
          </div>
        </>
      )}
    </ModuloBase>
  );
};

export default UserManagement;
