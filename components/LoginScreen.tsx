import React, { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // In a real application, you would make an API call to a backend server
    // to verify the email and password.
    // For this simulation, we'll accept any non-empty credentials.
    if (!email || !password) {
      setError('Per favore, inserisci email e password.');
      return;
    }

    // Simulate a successful login
    onLoginSuccess();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-colibri-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-colibri-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.5 7.5L15.5 10.5M17 6L14 9"/>
                <path d="M19 4.5A2.5 2.5 0 0 0 16.5 2C15.5 2 14 3 14 4.5C14 6.5 16 7 16 8.5C16 9.5 15 10 15 10"/>
                <path d="M14 4.5C12.5 3.5 10.5 2 8.5 2C5.5 2 4 4.5 4 7.5C4 12.5 9 15.5 10.5 16.5L12.5 17.5L14.5 16.5C16 15.5 21 12.5 21 7.5C21 6.5 20.5 5.5 19.5 5"/>
            </svg>
          <h1 className="text-3xl font-bold text-colibri-gray-800 mt-4">
            Colibrinvest
          </h1>
          <p className="text-colibri-gray-500">Accesso Consulente</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Indirizzo Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-3 border border-colibri-gray-300 placeholder-colibri-gray-500 text-colibri-gray-900 rounded-md focus:outline-none focus:ring-colibri-green focus:border-colibri-green focus:z-10 sm:text-sm"
                placeholder="Indirizzo Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-3 border border-colibri-gray-300 placeholder-colibri-gray-500 text-colibri-gray-900 rounded-md focus:outline-none focus:ring-colibri-green focus:border-colibri-green focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
            
          {error && <p className="text-sm text-colibri-red text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-colibri-blue border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Accedi
            </button>
          </div>
        </form>
         <p className="mt-4 text-xs text-center text-colibri-gray-400">
            © {new Date().getFullYear()} Colibrinvest. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
