import React from 'react';

function App() {
  const devices = []; // Placeholder: Replace with your actual state or data
  const handleEdit = () => {};
  const handleDelete = () => {};

  return (
    <div className="App">
      <h1>Coiler Device Monitor (Live)</h1>

      <table border="1" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>IP</th>
            <th>Signal</th>
            <th>Temperature</th>
            <th>Alarm</th>
            <th>Uptime</th>
            <th>Last Seen</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.length > 0 ? (
            devices.map((device) => (
              <tr key={device.id}>
                <td>{device.name}</td>
                <td>{device.ip}</td>
                <td>{device.signal}</td>
                <td>{device.temperature}</td>
                <td>{device.alarm ? '🔴' : '✅'}</td>
                <td>{device.uptime}</td>
                <td>{new Date(device.last_seen).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleEdit(device)}>✏️</button>{' '}
                  <button onClick={() => handleDelete(device.id)}>🗑️</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                No devices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
