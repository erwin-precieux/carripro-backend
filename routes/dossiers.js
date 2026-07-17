const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../config/multer');

// GET statistiques des dossiers
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT statut, COUNT(*) as total
      FROM dossiers
      GROUP BY statut
    `);

    const stats = {
      total: 0,
      recu: 0,
      valide: 0,
      rejete: 0,
      acte_emis: 0
    };

    rows.forEach(row => {
      stats[row.statut] = row.total;
      stats.total += row.total;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques', erreur: error.message });
  }
});

// GET tous les dossiers
router.get('/', async (req, res) => {
  try {
    const [dossiers] = await db.query(`
      SELECT d.*, u.nom, u.prenom, u.matricule 
      FROM dossiers d
      JOIN usagers u ON d.id_usager = u.id
      ORDER BY d.date_depot DESC
    `);
    res.json(dossiers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des dossiers', erreur: error.message });
  }
});

// GET un dossier précis avec ses pièces jointes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [dossiers] = await db.query(`
      SELECT d.*, u.nom, u.prenom, u.matricule
      FROM dossiers d
      JOIN usagers u ON d.id_usager = u.id
      WHERE d.id = ?
    `, [id]);

    if (dossiers.length === 0) {
      return res.status(404).json({ message: 'Dossier introuvable' });
    }

    const [pieces] = await db.query(`
      SELECT * FROM pieces_jointes WHERE id_dossier = ?
    `, [id]);

    res.json({ ...dossiers[0], pieces_jointes: pieces });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du dossier', erreur: error.message });
  }
});


// PUT modifier un dossier
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type_acte, statut, commentaire_rh, numero_bordereau, chemin_acte } = req.body;

    await db.query(`
      UPDATE dossiers 
      SET type_acte = ?, statut = ?, commentaire_rh = ?, numero_bordereau = ?, chemin_acte = ?
      WHERE id = ?
    `, [type_acte, statut, commentaire_rh, numero_bordereau, chemin_acte, id]);

    res.json({ message: 'Dossier mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du dossier', erreur: error.message });
  }
});


// POST upload de l'acte PDF pour un dossier
router.post('/:id/upload-acte', upload.single('acte'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    const cheminFichier = `/uploads/actes/${req.file.filename}`;

    await db.query(`
      UPDATE dossiers SET chemin_acte = ? WHERE id = ?
    `, [cheminFichier, id]);

    res.json({ message: 'Fichier uploadé avec succès', chemin: cheminFichier });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'upload", erreur: error.message });
  }
});

module.exports = router;