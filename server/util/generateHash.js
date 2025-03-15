const bcrypt = require('bcrypt');

const password = 'password';  // This will generate a hash for the default password
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('New hash for "password":');
    console.log(hash);
    console.log('\nUpdate the hash in db_init.sql file for the testuser.');
  })
  .catch(err => {
    console.error('Error generating hash:', err);
  });
