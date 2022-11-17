const Pool = require('pg').Pool;

// const pool = new Pool({
//   user: 'postgres',
//   password: 'YlwFv6hrsWvEXY5R21Cr',
//   host: 'containers-us-west-128.railway.app',
//   port: 7541,
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
