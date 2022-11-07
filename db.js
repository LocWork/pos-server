const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'vUXvc4enWOT7kJfexO3O',
  host: 'localhost',
  port: 7184,
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
