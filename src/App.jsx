import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LoginSignup from './components/LoginSignup';
import DeviceMonitorWithAlarms from './components/DeviceMonitorWithAlarms';
import TestEmailSender from './components/TestEmailSender';
import AddDeviceForm from './components/AddDeviceForm';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {session ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Welcome, {session.user.email}</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
          <AddDeviceForm />
          <DeviceMonitorWithAlarms />
          <TestEmailSender />
        </>
      ) : (
        <LoginSignup
          onAuthSuccess={() =>
            supabase.auth.getSession().then(({ data }) => setSession(data.session))
          }
        />
      )}
    </div>
  );
}

export default App;