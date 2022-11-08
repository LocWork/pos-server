const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'vUXvc4enWOT7kJfexO3O',
  host: 'containers-us-west-99.railway.app',
  port: 7184,
  database: 'railway',
});
//demo

// const pool = new Pool({
//   user: 'postgres',
//   password: 'qwe',
//   host: 'localhost',
//   port: 5432,
//   database: 'restaurant',
// });

module.exports = pool;
