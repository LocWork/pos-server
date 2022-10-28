const Pool = require('pg').Pool;

// const pool = new Pool({
//   user: 'postgres',
//   password: 'jxanxaO6G8CFMziYbA49',
//   host: 'containers-us-west-104.railway.app',
//   port: 6928,
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
