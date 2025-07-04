// emailService.js
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_rx72r57';
const TEMPLATE_ID = 'template_edpk85d';
const PUBLIC_KEY = 'BvQQNOItUdjbOC9g8';

/**
 * Sends an alarm email using EmailJS.
 * @param {Object} params - Alarm email parameters.
 */
const sendAlarmEmail = ({ name, email, title, signal, temperature, uptime, time, message }) => {
  const templateParams = {
    name,
    email,
    title,
    signal,
    temperature,
    uptime,
    time,
    message,
  };

  console.log('📧 Sending email with params:', templateParams);

  emailjs
    .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
    .then((result) => {
      console.log('✅ Email sent!', result.text);
      alert('✅ Alarm email sent successfully!');
    })
    .catch((error) => {
      console.error('❌ Failed to send email:', error.text || error);
      alert(`❌ Failed to send email: ${error.text || error}`);
    });
};

export default sendAlarmEmail;
