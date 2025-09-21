import React from 'react';
import TableEmpty from './TableEmpty';

export default function DataTable({ columns = [], rows = [], loading = false, keyField = 'id' }) {
  return (
    <div className="table-responsive mt-3">
      <table className="table table-striped align-middle" style={{ borderRadius: 8, overflow: 'hidden' }}>
        <thead className="table-light">
          <tr>
            {columns.map(col => (
              <th key={col.key || col.header} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((r, idx) => (
            <tr key={r[keyField] ?? idx}>
              {columns.map(col => (
                <td key={col.key || col.header}>{col.render ? col.render(r) : r[col.key]}</td>
              ))}
            </tr>
          ))}
          {(!rows || rows.length === 0) && !loading && (
            <TableEmpty colSpan={columns.length} label="Sin resultados" />
          )}
        </tbody>
      </table>
    </div>
  );
}
