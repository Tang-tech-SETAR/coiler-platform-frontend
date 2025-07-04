import React from 'react';
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_rx72r57';
const TEMPLATE_ID = 'template_edpk85d';
const PUBLIC_KEY = 'BvQQNOItUdjbOC9g8';

const TestEmailSender = () => {
  const handleTestEmail = () => {
    const templateParams = {
      name: 'Test Device',
      email: 'seferino34@gmail.com',
      title: 'Manual Test Email',
      signal: '90',
      temperature: '40°C',
      uptime: '12h',
      time: new Date().toLocaleString(),
      message: '🔔 This is a manual test of the alarm email system.'
    };

    console.log('📧 Sending test email with params:', templateParams);

    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((result) => {
        console.log('✅ Email sent!', result.text);
        alert('✅ Test email sent successfully!');
      })
      .catch((error) => {
        console.error('❌ Failed to send email:', error.text || error);
        alert(`❌ Failed to send email: ${error.text || error}`);
      });
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-lg font-bold mb-2">📨 Test EmailJS</h2>
      <button
        onClick={handleTestEmail}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Send Test Email
      </button>
    </div>
  );
};

export default TestEmailSender;
