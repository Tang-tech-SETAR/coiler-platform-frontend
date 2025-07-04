import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import sendAlarmEmail from '../emailService';

const supabase = createClient(
  'https://bcqbaxggwxavogdqpzhj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcWJheGdnd3hhdm9nZHFwemhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODkxMzAsImV4cCI6MjA2NDk2NTEzMH0.cVpQXK5bFvGyk-xFSork7_qyDLZ3LsZ5av1UrYyja_I'
);

const DeviceMonitorWithAlarms = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchDevices();

    const subscription = supabase
      .channel('devices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Devices' }, (payload) => {
        console.log('🔁 Change received!', payload);

        if (payload.eventType === 'UPDATE' && !payload.old.alarm && payload.new.alarm) {
          alert(`🔔 Alarm triggered: ${payload.new.name}`);
          sendAlarmEmail({
            name: payload.new.name,
            email: 'seferino34@gmail.com',
            title: `Alarm triggered: ${payload.new.name}`,
            signal: payload.new.signal,
            temperature: payload.new.temperature,
            uptime: payload.new.uptime || 'N/A',
            time: new Date().toLocaleString(),
            message: `Device ${payload.new.name} triggered an alarm at ${new Date().toLocaleString()}.\nIP: ${payload.new.ip}`
          });
        }

        fetchDevices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchDevices = async () => {
    const { data, error } = await supabase.from('Devices').select('*');
    if (error) {
      console.error('❌ Error fetching devices:', error);
    } else {
      setDevices(data);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">📡 Device Monitor (With Alarms)</h2>
      <ul className="space-y-2">
        {devices.map((device) => (
          <li
            key={device.id}
            className={`p-4 rounded border ${
              device.alarm
                ? 'bg-red-100 border-red-400 text-red-800'
                : 'bg-green-100 border-green-400 text-green-800'
            }`}
          >
            <div className="font-semibold">{device.name}</div>
            <div>IP: {device.ip}</div>
            <div>Signal: {device.signal}</div>
            <div>Temp: {device.temperature}</div>
            <div>
              Alarm:{' '}
              {device.alarm ? (
                <span role="img" aria-label="alarm">
                  🚨
                </span>
              ) : (
                <span role="img" aria-label="ok">
                  ✅
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeviceMonitorWithAlarms;
