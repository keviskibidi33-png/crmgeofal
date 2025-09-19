import React, { useEffect, useState } from 'react';
import ModuloBase from '../components/ModuloBase';

const Recuperados = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/recuperados?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar recuperados');
        return res.json();
      })
      .then(json => {
        setData(json.data);
        setTotal(json.total);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page]);

  return (
    <ModuloBase titulo="Clientes Recuperados" descripcion="Empresas sin proyectos en los últimos 3 meses.">
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
