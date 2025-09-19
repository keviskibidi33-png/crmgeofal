import React, { useEffect, useState } from 'react';
import ModuloBase from '../components/ModuloBase';
import apiFetch from '../services/api';

const Recuperados = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const json = await apiFetch(`/api/recuperados?page=${page}&limit=${limit}`);
        setData(json.data || []);
        setTotal(json.total || 0);
      } catch (err) {
        setError(err.message || 'Error al cargar recuperados');
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <ModuloBase titulo="Clientes Recuperados" descripcion="Empresas sin proyectos en los últimos 3 meses.">
      <div style={{background:'#fffbe6',border:'1px solid #ffe58f',borderRadius:8,padding:'1rem',marginBottom:'1.5rem',color:'#ad8b00'}}>
        <b>¿Qué es un cliente recuperado?</b><br/>
        Este listado muestra todas las empresas que no han tenido ningún proyecto registrado en los últimos 3 meses. Puedes usar esta información para campañas de reactivación, seguimiento comercial o análisis de clientes inactivos.
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {!loading && !error && (
        <>
          <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'1rem'}}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>RUC/DNI</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={6} style={{textAlign:'center'}}>Sin recuperados</td></tr>}
              {data.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.ruc || c.dni}</td>
                  <td>{c.contact_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</button>
            <span>Página {page} de {Math.ceil(total/limit)||1}</span>
            <button disabled={page*limit>=total} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
          </div>
        </>
      )}
    </ModuloBase>
  );
};

export default Recuperados;
