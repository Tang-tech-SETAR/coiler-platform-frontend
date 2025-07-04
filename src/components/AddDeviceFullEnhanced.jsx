
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AddDeviceFullEnhanced() {
  const [form, setForm] = useState({
    name: '',
    ip: '',
    signal: '',
    alarm: false,
    uptime: '',
    temperature: ''
  });
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'last_seen', direction: 'desc' });

  useEffect(() => {
    fetchDevices();

    const subscription = supabase
      .channel('realtime-devices-enhanced')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Devices' }, () => {
        fetchDevices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [search, devices, sortConfig]);

  const fetchDevices = async () => {
    const { data, error } = await supabase.from('Devices').select('*');
    if (data) {
      setDevices(data);
    }
    if (error) console.error(error);
  };

  const applyFiltersAndSort = () => {
    const lowerSearch = search.toLowerCase();
    let filtered = devices.filter(d =>
      d.name.toLowerCase().includes(lowerSearch) ||
      d.ip.toLowerCase().includes(lowerSearch) ||
      String(d.alarm).toLowerCase().includes(lowerSearch)
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (typeof valA === 'string') {
          return sortConfig.direction === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortConfig.direction === 'asc'
            ? valA - valB
            : valB - valA;
        }
      });
    }

    setFilteredDevices(filtered);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
      setMessage('✅ Device added');
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
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    const { error } = await supabase.from('Devices').delete().eq('id', id);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Device deleted');
    }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'IP', 'Signal', 'Alarm', 'Uptime', 'Temperature', 'Last Seen'];
    const rows = filteredDevices.map(d => [
      d.name, d.ip, d.signal, d.alarm ? 'Yes' : 'No', d.uptime, d.temperature, new Date(d.last_seen).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold">Device Manager (All Features)</h2>

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

      <div className="flex justify-between items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, IP or alarm"
          className="w-2/3 p-2 border rounded"
        />
        <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded">Download CSV</button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm text-left border mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border cursor-pointer" onClick={() => requestSort('name')}>Name {getSortIcon('name')}</th>
              <th className="p-2 border cursor-pointer" onClick={() => requestSort('ip')}>IP {getSortIcon('ip')}</th>
              <th className="p-2 border cursor-pointer" onClick={() => requestSort('signal')}>Signal {getSortIcon('signal')}</th>
              <th className="p-2 border cursor-pointer" onClick={() => requestSort('alarm')}>Alarm {getSortIcon('alarm')}</th>
              <th className="p-2 border cursor-pointer" onClick={() => requestSort('uptime')}>Uptime {getSortIcon('uptime')}</th>
              <th className="p-2 border cursor-pointer" onClick={() => requestSort('temperature')}>Temperature {getSortIcon('temperature')}</th>
              <th className="p-2 border cursor-pointer" onClick={() => requestSort('last_seen')}>Last Seen {getSortIcon('last_seen')}</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
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
                    <>
                      <button onClick={() => handleEdit(device)} className="text-blue-600">Edit</button>
                      <button onClick={() => handleDelete(device.id)} className="text-red-600">Delete</button>
                    </>
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
