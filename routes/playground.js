const { Router } = require('express');
const router = Router();
const helper = require('../utils/helpers');
const pool = require('./../db');
const { request } = require('./kdsMain');

router.post('/create', async (req, res) => {
  try {
    const { username, password, fullname, email, phone, status } = req.body;

    const hashedPassword = await helper.hashPassword(password);

    const createUser = await pool.query(
      'INSERT INTO account(username,password,fullname,email,phone,status,roleid) VALUES($1,$2,$3,$4,$5,$6,(SELECT id FROM account WHERE name = ADMIN ))',
      [username, hashedPassword, fullname, email, phone, status]
    );
    console.log(createUser);
    res.status(200).json({ msg: 'New user created' });
  } catch (error) {
    console.log(error);
  }
});

router.get('/forcast', (req, res) => {
  req.io.emit('demo', { msg: 'hello world' });
  res.status(200).json({ msg: 'success' });
});

module.exports = router;
