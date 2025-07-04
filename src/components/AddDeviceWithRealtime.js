import sendAlarmEmail from '../emailService';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AddDeviceWithRealtime() {
  const [form, setForm] = useState({
    name: '',
    ip: '',
    signal: '',
    alarm: false,
    uptime: '',
    temperature: ''
  });
  const [devices, setDevices] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDevices();

    const subscription = supabase
      .channel('realtime-devices')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Devices' },
        (payload) => {
          setDevices(prev => [payload.new, ...prev]);
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

  
    e.preventDefault();

    const { error } = await supabase.from('Devices').insert([
      {
        ...form,
        signal: parseInt(form.signal, 10),
        last_seen: new Date().toISOString()
      }
    ]); const handleSubmit = async (e) => {
  e.preventDefault();

  const newDevice = {
    ...form,
    signal: parseInt(form.signal, 10),
    last_seen: new Date().toISOString()
  };

  const { error } = await supabase.from('Devices').insert([newDevice]);

  if (error) {
    setMessage(`❌ ${error.message}`);
  } else {
    setMessage('✅ Device added successfully');
    setForm({ name: '', ip: '', signal: '', alarm: false, uptime: '', temperature: '' });

    // 🔔 Send email if alarm is true
    if (newDevice.alarm) {
      sendAlarmEmail({
        name: 'Device Monitor',
        email: 'seferino34@gmail.com',
        title: `Alarm triggered: ${newDevice.name}`,
        message: `Device ${newDevice.name} triggered an alarm.\nIP: ${newDevice.ip}\nSignal: ${newDevice.signal}\nTemperature: ${newDevice.temperature}\nTime: ${new Date().toLocaleString()}`
      });
    }
  }
};

