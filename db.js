const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'URyqNNfZi80bm03sB9GF',
  host: 'containers-us-west-22.railway.app',
  port: 5684,
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
