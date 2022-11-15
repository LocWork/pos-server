const Pool = require('pg').Pool;

// const pool = new Pool({
//   user: 'postgres',
//   password: 'rkdNVaH5667mogzvOz9W',
//   host: 'containers-us-west-121.railway.app',
//   port: 6126,
//   database: 'railway',
// });

const pool = new Pool({
  user: 'postgres',
  password: 'qwe',
  host: 'localhost',
  port: 5432,
  database: 'restaurant',
});

module.exports = pool;
