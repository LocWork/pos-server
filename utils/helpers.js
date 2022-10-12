const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const pool = require('../db');

const randomCheckString = async (size) => {
  var x = false;
  var result = '';
  do {
    result = randomstring.generate(size);
    var check = await pool.query(`SELECT id FROM "check" WHERE checkno = $1`, [
      result,
    ]);
    if (check.rows[0] == null) {
      x = true;
    }
  } while (x == false);
  return result;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

const validatePassword = async (raw, hash) => {
  const result = await bcrypt.compare(raw, hash);
  return result;
};

const errorMsgHandler = (err) => {
  console.log(err);
  let validationErrors;
  if (err) {
    validationErrors = {};
    err.forEach((error) => {
      validationErrors[error.param] = error.msg;
    });
  }
  return validationErrors;
};

module.exports = {
  hashPassword,
  errorMsgHandler,
  validatePassword,
  randomCheckString,
};
