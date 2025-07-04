
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AddDeviceFullWithAlarms() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchDevices();
    const channel = supabase
      .channel('realtime-devices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Devices' }, payload => {
        fetchDevices();
        if (payload.eventType === 'UPDATE' && !payload.old.alarm && payload.new.alarm) {
          showNotification(`🔔 Alarm triggered: ${payload.new.name}`);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchDevices = async () => {
    const { data } = await supabase.from('Devices').select('*');
    setDevices(data || []);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('Devices').update(form).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('Devices').insert([form]);
    }
    setForm({});
  };

  const handleEdit = (device) => {
    setEditingId(device.id);
    setForm(device);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      await supabase.from('Devices').delete().eq('id', id);
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedDevices = [...devices].filter(d =>
    Object.values(d).some(v => String(v).toLowerCase().includes(filter.toLowerCase()))
  ).sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const downloadCSV = () => {
    const csv = [
      ['Name', 'IP', 'Signal', 'Alarm', 'Uptime', 'Temperature', 'Last Seen'],
      ...sortedDevices.map(d =>
        [d.name, d.ip, d.signal, d.alarm, d.uptime, d.temperature, d.last_seen].join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devices.csv';
    a.click();
  };

  const activeAlarms = sortedDevices.filter(d => d.alarm);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-4 right-4 bg-yellow-200 text-yellow-800 p-3 rounded shadow">
          {notification}
        </div>
      )}

      <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 rounded">
        <h3 className="font-bold text-lg">🚨 Active Alarms ({activeAlarms.length})</h3>
        {activeAlarms.length === 0 ? (
          <p>No active alarms</p>
        ) : (
          <ul className="list-disc list-inside">
            {activeAlarms.map(d => (
              <li key={d.id}>{d.name} ({d.ip})</li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-7 gap-2 items-end">
        {['name', 'ip', 'signal', 'uptime', 'temperature'].map(field => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field] || ''}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        ))}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded col-span-1">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border rounded w-1/3"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Export CSV
        </button>
      </div>

      <div className="overflow-auto shadow rounded">
        <table className="min-w-full bg-white border text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {['name', 'ip', 'signal', 'alarm', 'uptime', 'temperature', 'last_seen', 'actions'].map((key) => (
                <th
                  key={key}
                  className="p-2 border cursor-pointer"
                  onClick={() => key !== 'actions' && handleSort(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((device) => (
              <tr key={device.id} className={device.alarm ? 'bg-red-50' : ''}>
                <td className="p-2 border">{device.name}</td>
                <td className="p-2 border">{device.ip}</td>
                <td className="p-2 border">{device.signal}</td>
                <td className="p-2 border">{device.alarm ? 'Yes' : 'No'}</td>
                <td className="p-2 border">{device.uptime}</td>
                <td className="p-2 border">{device.temperature}</td>
                <td className="p-2 border">{new Date(device.last_seen).toLocaleString()}</td>
                <td className="p-2 border space-x-2">
                  <button onClick={() => handleEdit(device)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(device.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
