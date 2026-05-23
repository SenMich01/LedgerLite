import React from 'react';

const StatCard = ({ label, value, icon: Icon, colorClass = "text-primary" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-gray-50 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
