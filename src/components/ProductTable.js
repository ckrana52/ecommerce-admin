import React from 'react';
export default function ProductTable({ product }) {
  return (
    <>
      <td className="px-4 py-2 border-b">{product.stock}</td>
      <td className="px-4 py-2 border-b">{Array.isArray(product.categories) ? product.categories.join(', ') : product.categories}</td>
    </>
  );
} 