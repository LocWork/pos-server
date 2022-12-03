const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'lL3mOZbTrZbW2CXrqblw',
  host: 'containers-us-west-135.railway.app',
  port: 7544,
  database: 'railway',
});

// const pool = new Pool({
//   user: 'postgres',
//   password: 'qwe',
//   host: 'localhost',
//   port: 5432,
//   database: 'restaurant',
// });

module.exports = pool;
