const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updatePassword() {
  const hash = bcrypt.hashSync('112044', 10);
  console.log('Generated hash:', hash);

  const connection = await mysql.createConnection({
    host: '124.221.119.134',
    user: 'fl',
    password: 'fl10b312',
    database: '投研图灵室_test'
  });

  await connection.execute(
    'UPDATE users SET password = ? WHERE id = 15',
    [hash]
  );

  console.log('Password updated successfully');

  const [rows] = await connection.execute(
    'SELECT id, name, password FROM users WHERE id = 15'
  );
  console.log('Updated user:', rows);

  await connection.end();
}

updatePassword().catch(console.error);
