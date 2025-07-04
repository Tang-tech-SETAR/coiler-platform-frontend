import React, { useEffect, useState } from 'react';
import './App.css';
import supabase from './supabaseClient';

function App() {
  const [devices, setDevices] = useState([]);
  const [formData, setFormData] = useState({
    site_name: '', ip: '', alarm: false, uptime: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices() {
    const { data, error } = await supabase
      .from('Sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Fetch error:', error);
    else setDevices(data);
  }

  async function addSite() {
    const { error } = await supabase.from('Sites').insert([formData]);
    if (error) {
      alert('Failed to add site: ' + error.message);
    } else {
      setFormData({ site_name: '', ip: '', signal: '', alarm: false, uptime: '', temperature: '', last_seen: '' });
      fetchDevices();
    }
  }

  async function confirmDeleteDevice() {
    const { error } = await supabase.from('Sites').delete().eq('id', confirmDeleteId);
    if (!error) fetchDevices();
    setConfirmDeleteId(null);
  }

  const filteredDevices = devices.filter(device =>
    device.site_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.ip?.includes(searchQuery)
  );

  return (
    <div className="container">
      <h1>Device Monitor</h1>
      <div className="form-container">
        <input placeholder="Name" value={formData.site_name} onChange={e => setFormData({ ...formData, site_name: e.target.value })} />
        <input placeholder="IP" value={formData.ip} onChange={e => setFormData({ ...formData, ip: e.target.value })} />
        <input placeholder="Signal" value={formData.signal} onChange={e => setFormData({ ...formData, signal: e.target.value })} />
        <label>Alarm <input type="checkbox" checked={formData.alarm} onChange={e => setFormData({ ...formData, alarm: e.target.checked })} /></label>
        <input placeholder="Uptime" value={formData.uptime} onChange={e => setFormData({ ...formData, uptime: e.target.value })} />
        <input placeholder="Temp" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: e.target.value })} />
        <input placeholder="Last Seen" value={formData.last_seen} onChange={e => setFormData({ ...formData, last_seen: e.target.value })} />
        <button onClick={addSite}>Add Site</button>
      </div>

      <input type="text" placeholder="Search by name or IP" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

      <table className="device-table">
        <thead>
          <tr>
            <th>Site Name</th><th>IP</th><th>Signal</th><th>Alarm</th><th>Uptime</th><th>Temp</th><th>Last Seen</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.length === 0 ? <tr><td colSpan="8">No devices found.</td></tr> : filteredDevices.map(device => (
            <tr key={device.id}>
              <td>{device.site_name}</td><td>{device.ip}</td><td>{device.signal}%</td>
              <td>{device.alarm ? '🔔 Triggered' : '✅ None'}</td>
              <td>{device.uptime}</td><td>{device.temperature}</td><td>{device.last_seen}</td>
              <td><button onClick={() => setConfirmDeleteId(device.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmDeleteId !== null && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this site?</p>
            <button onClick={confirmDeleteDevice}>Yes, Delete</button>
            <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
