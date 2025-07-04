import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DeviceMonitorWithAlarms from './components/DeviceMonitorWithAlarms';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DeviceMonitorWithAlarms />
  </React.StrictMode>
);

reportWebVitals();
