const bcrypt = require('bcrypt');

const motDePasse = 'agent1234'; // le mot de passe que tu veux utiliser

bcrypt.hash(motDePasse, 10).then(hash => {
  console.log('Mot de passe hashé :', hash);
});