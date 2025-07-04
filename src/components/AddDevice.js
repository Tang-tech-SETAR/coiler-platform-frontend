// src/components/AddDeviceForm.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AddDeviceForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    signal: '',
    temperature: '',
    alarm: false,
    uptime: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('Devices').insert([formData]);
    if (error) {
      alert('❌ Failed to add device: ' + error.message);
    } else {
      alert('✅ Device added successfully!');
      setFormData({ name: '', ip: '', signal: '', temperature: '', alarm: false, uptime: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">➕ Add Device</h2>
      <div className="grid grid-cols-2 gap-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="border p-2" required />
        <input name="ip" value={formData.ip} onChange={handleChange} placeholder="IP" className="border p-2" required />
        <input name="signal" value={formData.signal} onChange={handleChange} placeholder="Signal" className="border p-2" required />
        <input name="temperature" value={formData.temperature} onChange={handleChange} placeholder="Temperature" className="border p-2" required />
        <input name="uptime" value={formData.uptime} onChange={handleChange} placeholder="Uptime" className="border p-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="alarm" checked={formData.alarm} onChange={handleChange} />
          Alarm
        </label>
      </div>
      <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Save Device
      </button>
    </form>
  );
};

export default AddDeviceForm;
