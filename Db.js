// Importation de Mongoose
const mongoose = require('mongoose');

// Fonction de connexion à MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    // Connexion à la base de données via l'URI stockée dans le fichier .env
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    // Affichage de l'erreur et arrêt du serveur si la connexion échoue
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Arrêt du processus Node.js avec une erreur
  }
};

// Exportation de la fonction pour l'utiliser ailleurs (ex: server.js ou app.js)
module.exports = connectDB;
