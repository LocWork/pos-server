const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'YIpPoRDzfHKfcuKAH3Ri',
  host: 'containers-us-west-166.railway.app',
  port: 8010,
  database: 'railway',
});

//Local run
// const pool = new Pool({
//   user: 'postgres',
//   password: 'qwe',
//   host: 'localhost',
//   port: 5432,
//   database: 'restaurant',
// });

module.exports = pool;
