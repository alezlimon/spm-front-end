import { useState } from 'react';

export default function BirthDateInput({ value, onChange }) {
  return (
    <input
      name="birthDate"
      type="date"
      placeholder="Fecha de nacimiento"
      value={value}
      onChange={onChange}
      required
      style={{padding: 8, borderRadius: 8, border: '1px solid #d1d5db', width: '100%', marginBottom: 8}}
    />
  );
}
