const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'vUXvc4enWOT7kJfexO3O',
  host: 'containers-us-west-99.railway.app',
  port: 9999,
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
