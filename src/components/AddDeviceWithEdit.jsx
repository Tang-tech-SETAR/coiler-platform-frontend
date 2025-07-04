import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AddDeviceWithEdit() {
  const [form, setForm] = useState({
    name: '',
    ip: '',
    signal: '',
    alarm: false,
    uptime: '',
    temperature: ''
  });
  const [devices, setDevices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDevices();

    const subscription = supabase
      .channel('realtime-devices-edit')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Devices' },
        (payload) => {
          fetchDevices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchDevices = async () => {
    const { data, error } = await supabase.from('Devices').select('*').order('last_seen', { ascending: false });
    if (data) setDevices(data);
    if (error) console.error(error);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('Devices').insert([
      {
        ...form,
        signal: parseInt(form.signal, 10),
        last_seen: new Date().toISOString()
      }
    ]);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Device added successfully');
      setForm({ name: '', ip: '', signal: '', alarm: false, uptime: '', temperature: '' });
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (device) => {
    setEditingId(device.id);
    setEditForm(device);
  };

  const saveEdit = async () => {
    const { error } = await supabase.from('Devices').update({
      ...editForm,
      signal: parseInt(editForm.signal, 10)
    }).eq('id', editingId);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Device updated');
      setEditingId(null);
      fetchDevices();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold">Add Device & Edit Devices</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="p-2 border rounded" required />
        <input name="ip" value={form.ip} onChange={handleChange} placeholder="IP" className="p-2 border rounded" required />
        <input name="signal" value={form.signal} onChange={handleChange} placeholder="Signal" type="number" className="p-2 border rounded" required />
        <input name="uptime" value={form.uptime} onChange={handleChange} placeholder="Uptime" className="p-2 border rounded" required />
        <input name="temperature" value={form.temperature} onChange={handleChange} placeholder="Temperature" className="p-2 border rounded" required />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="alarm" checked={form.alarm} onChange={handleChange} />
          <span>Alarm</span>
        </label>
        <button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">Add Device</button>
        {message && <p className="col-span-2 text-sm">{message}</p>}
      </form>

      <div className="overflow-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">IP</th>
              <th className="p-2 border">Signal</th>
              <th className="p-2 border">Alarm</th>
              <th className="p-2 border">Uptime</th>
              <th className="p-2 border">Temperature</th>
              <th className="p-2 border">Last Seen</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td className="p-2 border">
                  {editingId === device.id
                    ? <input name="name" value={editForm.name} onChange={handleEditChange} className="p-1 border rounded" />
                    : device.name}
                </td>
                <td className="p-2 border">
                  {editingId === device.id
                    ? <input name="ip" value={editForm.ip} onChange={handleEditChange} className="p-1 border rounded" />
                    : device.ip}
                </td>
                <td className="p-2 border">
                  {editingId === device.id
                    ? <input name="signal" value={editForm.signal} onChange={handleEditChange} type="number" className="p-1 border rounded" />
                    : device.signal}
                </td>
                <td className="p-2 border">
                  {editingId === device.id
                    ? <input name="alarm" type="checkbox" checked={editForm.alarm} onChange={handleEditChange} />
                    : device.alarm ? 'Yes' : 'No'}
                </td>
                <td className="p-2 border">
                  {editingId === device.id
                    ? <input name="uptime" value={editForm.uptime} onChange={handleEditChange} className="p-1 border rounded" />
                    : device.uptime}
                </td>
                <td className="p-2 border">
                  {editingId === device.id
                    ? <input name="temperature" value={editForm.temperature} onChange={handleEditChange} className="p-1 border rounded" />
                    : device.temperature}
                </td>
                <td className="p-2 border">{new Date(device.last_seen).toLocaleString()}</td>
                <td className="p-2 border space-x-2">
                  {editingId === device.id ? (
                    <button onClick={saveEdit} className="text-green-600">Save</button>
                  ) : (
                    <button onClick={() => handleEdit(device)} className="text-blue-600">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}