import React, { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('apprenant');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Inscription réussie. Vous pouvez maintenant vous connecter.');
        setUsername('');
        setPassword('');
        setRole('apprenant');
      } else {
        setError(data.message || "L'inscription a échoué");
      }
    } catch {
      setError('Erreur serveur');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-600 to-orange-500 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Inscription</h1>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="apprenant">Apprenant</option>
            <option value="formateur">Formateur</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-900 text-white py-3 rounded hover:bg-blue-800 transition-colors"
          >
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
