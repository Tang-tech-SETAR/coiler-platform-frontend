import { useState } from 'react';
import { supabase } from '../supabaseClient';

const AddDeviceForm = () => {
  const [form, setForm] = useState({
    name: '',
    ip: '',
    signal: '',
    temperature: '',
    alarm: false,
    uptime: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('Devices').insert([form]);
    if (error) alert('❌ Failed to add device');
    else alert('✅ Device added!');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md mb-4 max-w-md mx-auto">
      <h2 className="font-bold mb-2">➕ Add Device</h2>
      {['name', 'ip', 'signal', 'temperature', 'uptime'].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
          className="mb-2 p-2 border w-full"
        />
      ))}
      <label className="block mb-2">
        <input type="checkbox" name="alarm" checked={form.alarm} onChange={handleChange} /> Alarm
      </label>
      <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
        Add Device
      </button>
    </form>
  );
};

export default AddDeviceForm;