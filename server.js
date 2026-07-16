const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const dossiersRoutes = require('./routes/dossiers');
const authRoutes = require('./routes/auth');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/dossiers', dossiersRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'API CarriPro fonctionne !' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS resultat');
    res.json({ message: 'Connexion MySQL réussie !', resultat: rows[0].resultat });
  } catch (error) {
    console.error('Erreur complète :', error);
    res.status(500).json({ message: 'Erreur de connexion MySQL', erreur: error.message, code: error.code });
  }
});