import React, { useState } from 'react';
import { useQuery } from 'react-query';
import ModuloBase from '../components/ModuloBase';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import { listQuoteItems } from '../services/quotes';

export default function ItemsCotizacion() {
  const [quoteId, setQuoteId] = useState('');

  const { data, isLoading, isFetching } = useQuery(
    ['quoteItems', quoteId],
    () => listQuoteItems(quoteId),
    {
      enabled: !!quoteId, // Only run query if quoteId is set
    }
  );

  const rows = Array.isArray(data) ? data : [];

  const columns = React.useMemo(() => [
    { header: 'ID', key: 'id', width: 80 },
    { header: 'Código', key: 'code' },
    { header: 'Descripción', key: 'description' },
    { header: 'Norma', key: 'norm' },
    { header: 'Precio Unitario', key: 'unit_price', render: (r) => `S/ ${Number(r.unit_price || 0).toFixed(2)}` },
    { header: 'Cantidad', key: 'quantity' },
    { header: 'Precio Parcial', key: 'partial_price', render: (r) => `S/ ${Number(r.partial_price || 0).toFixed(2)}` },
  ], []);

  return (
    <ModuloBase titulo="Items de Cotización" descripcion="Consulta los ítems de una cotización específica.">
      <Toolbar
        left={
          <div className="d-flex align-items-end gap-2">
            <div style={{ minWidth: '200px' }}>
              <label htmlFor="quote-id-input" className="form-label">ID de Cotización</label>
              <input
                id="quote-id-input"
                type="number"
                className="form-control"
                placeholder="Ingrese ID de cotización"
                value={quoteId}
                onChange={(e) => setQuoteId(e.target.value)}
              />
            </div>
          </div>
        }
      />

      {quoteId ? (
        <DataTable columns={columns} rows={rows} loading={isLoading || isFetching} />
      ) : (
        <div className="alert alert-info mt-3">
          Por favor, ingrese un ID de cotización para ver sus ítems.
        </div>
      )}
    </ModuloBase>
  );
}