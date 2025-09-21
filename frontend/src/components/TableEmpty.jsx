import React from 'react';

export default function TableEmpty({ colSpan = 5, message = 'Sin registros' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-3 text-muted">{message}</td>
    </tr>
  );
}
