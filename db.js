const Pool = require('pg').Pool;

// const pool = new Pool({
//   user: 'postgres',
//   password: 'z4ahAWmfBoSd7f4VPVMP',
//   host: 'containers-us-west-110.railway.app',
//   port: 5824,
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
