const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

router.post('/login', async (req, res) => {
  try {
    const { matricule, mot_de_passe } = req.body;

    const [utilisateurs] = await db.query(
      'SELECT * FROM agents WHERE matricule = ?',
      [matricule]
    );

    if (utilisateurs.length === 0) {
      return res.status(401).json({ message: 'Matricule ou mot de passe incorrect' });
    }

    const utilisateur = utilisateurs[0];
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Matricule ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: utilisateur.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        matricule: utilisateur.matricule
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', erreur: error.message });
  }
});

module.exports = router;