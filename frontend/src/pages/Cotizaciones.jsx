
import React, { lazy, Suspense } from 'react';

const Lista = lazy(() => import('./ListaCotizaciones'));

export default function Cotizaciones() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Cargando módulo de cotizaciones...</div>}>
      <Lista />
    </Suspense>
  );
}
