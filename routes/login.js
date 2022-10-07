const { Router } = require('express');
const router = Router();
const pool = require('./db');

router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    const userInformation = await pool.query(
      'SELECT A.id, A.username, A.password, A.fullname, R.name AS role FROM account AS A JOIN role AS R ON A.roleid = R.id WHERE A.username = {$1}',
      [username]
    );

    if (userInformation.rows[0]) {
    } else {
      res.status(401).json({ msg: 'Invalid user name or password' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'An error as occur' });
  }
});

module.exports = router;
