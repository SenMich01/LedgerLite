import React from 'react';

const Placeholder = ({ title }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-500">This page is under development as part of the LedgerLite scaffold.</p>
  </div>
);

export default Placeholder;
