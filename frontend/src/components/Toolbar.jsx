import React from 'react';

export default function Toolbar({ left, right, compact = false }) {
  const wrapGap = compact ? 8 : 12;
  const marginBottom = compact ? 8 : 12;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems: compact ? 'stretch' : 'center', gap: wrapGap, marginBottom, flexWrap:'wrap' }}>
      <div style={{ display:'flex', gap: wrapGap, alignItems:'center', flexWrap:'wrap', rowGap: wrapGap }}>
        {left}
      </div>
      <div style={{ display:'flex', gap: wrapGap, alignItems:'center' }}>
        {right}
      </div>
    </div>
  );
}
