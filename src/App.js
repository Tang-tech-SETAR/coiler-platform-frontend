// src/App.js
import React from 'react';
import AddDeviceFullWithAlarms from './components/AddDeviceFullWithAlarms';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📡 Device Monitor (With Alarms)
        </h1>
        <AddDeviceFullWithAlarms />
      </div>
    </div>
  );
}

export default App;
