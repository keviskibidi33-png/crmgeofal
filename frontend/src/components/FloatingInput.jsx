import React from 'react';

export default function FloatingInput({ id, label, ...props }) {
  return (
    <div className="form-floating">
      <input id={id} placeholder={label} className="form-control" {...props} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
