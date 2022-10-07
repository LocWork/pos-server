const { Router } = require('express');
const router = Router();
const pool = require('./db');

router.get('/', async (req, res) => {
  try {
    const location = await pool.query('SELECT id, name, status FROM location');
    if (location.rows[0]) {
    } else {
      res.status(400).json({ msg: 'Unable to find table' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'An error has occur' });
  }
});

module.exports = router;
