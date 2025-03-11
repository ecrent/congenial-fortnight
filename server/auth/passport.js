const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('../config/database');

// Configure local strategy using 'name' as username field
passport.use(new LocalStrategy(
  { usernameField: 'name', passwordField: 'password' },
  async (name, password, done) => {
    try {
      // Query user by name
      const result = await db.query('SELECT * FROM users WHERE name = $1', [name]);
      if (result.rows.length === 0) {
        return done(null, false, { message: 'Incorrect username' });
      }
      const user = result.rows[0];

      // Removed encryption: compare plain text password directly
      if (password === user.password) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return done(new Error('User not found'));
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});
