const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: '5HnmMA7eCEZfy7x1zW5M',
  host: 'containers-us-west-144.railway.app',
  port: 7527,
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
