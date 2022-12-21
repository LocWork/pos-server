const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'kzPwifxzP9F0YUtYA0gl',
  host: 'containers-us-west-98.railway.app',
  port: 6692,
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
