db = db.getSiblingDB('nft_db');
db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'nft_db' }]
});
