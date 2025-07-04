
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LoginSignup({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (authMode === 'login') {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        onAuthSuccess();
      }
    } else {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        alert('Signup successful, please check your email for confirmation');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleAuth} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          {authMode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <p className="mt-4 text-sm text-center">
        {authMode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button onClick={() => setAuthMode('signup')} className="text-blue-600 underline">Sign Up</button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => setAuthMode('login')} className="text-blue-600 underline">Login</button>
          </>
        )}
      </p>
    </div>
  );
}
