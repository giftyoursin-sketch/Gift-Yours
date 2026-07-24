import React from 'react';
import { useApp } from '../context/AppContext';
import { format, parse } from 'date-fns';

export default function MonthSelector() {
  const { globalMonth, setGlobalMonth } = useApp();
  
  // globalMonth is in format 'yyyy-MM'
  const year = parseInt(globalMonth.split('-')[0]);
  const month = parseInt(globalMonth.split('-')[1]);

  const handleYearChange = (e) => {
    setGlobalMonth(`${e.target.value}-${String(month).padStart(2, '0')}`);
  };

  const handleMonthChange = (e) => {
    setGlobalMonth(`${year}-${String(e.target.value).padStart(2, '0')}`);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <select 
        className="input" 
        style={{ width: 'auto', minWidth: '110px' }} 
        value={month} 
        onChange={handleMonthChange}
      >
        <option value={1}>January</option>
        <option value={2}>February</option>
        <option value={3}>March</option>
        <option value={4}>April</option>
        <option value={5}>May</option>
        <option value={6}>June</option>
        <option value={7}>July</option>
        <option value={8}>August</option>
        <option value={9}>September</option>
        <option value={10}>October</option>
        <option value={11}>November</option>
        <option value={12}>December</option>
      </select>
      
      <select 
        className="input" 
        style={{ width: 'auto' }} 
        value={year} 
        onChange={handleYearChange}
      >
        {[2024, 2025, 2026, 2027].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
