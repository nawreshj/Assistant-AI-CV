require('dotenv').config();
const express = require('express');
const app = express();

const gptRoutes  = require('./routes/gptRoutes');

const extractionRoutes = require('./routes/extractionRoutes');

app.use(express.json());
app.use('/api/gpt', gptRoutes);
app.use('/api/extraction', extractionRoutes);


// Route racine / bienvenue
app.get('/', (req, res) => {
  res.send("Bienvenue sur l'appli assistant AI CV");
});

// 404 si route inconnue
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion d’erreur globale
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

module.exports = app;
