import React from 'react';

interface DashboardProps {
  role: string;
  username: string;
}

const Dashboard: React.FC<DashboardProps> = ({ role, username }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      <p className="mb-4">Bienvenue, {username} ({role})</p>

      {role === 'admin' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Gestion Admin</h2>
          <p>Gérez les utilisateurs, les cours, les paiements, etc.</p>
          {/* Add admin management components here */}
        </div>
      )}

      {role === 'formateur' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Gestion Formateur</h2>
          <p>Créez et gérez vos cours, vidéos et quiz.</p>
          {/* Add formateur course management components here */}
        </div>
      )}

      {role === 'apprenant' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Mes Cours</h2>
          <p>Suivez vos cours, regardez les vidéos et passez les quiz.</p>
          {/* Add apprenant course progress components here */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
