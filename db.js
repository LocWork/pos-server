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
  password: 'jxanxaO6G8CFMziYbA49',
  host: 'containers-us-west-104.railway.app',
  port: 6928,
  database: 'railway',
});

module.exports = pool;
