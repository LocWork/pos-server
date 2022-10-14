const Router = require('express');
const router = Router();
const pool = require('../db');

router.get('/location/:id/', async (req, res) => {
  try {
    const { id } = req.params;
    const locationList = await pool.query(
      'SELECT id, name, status FROM location WHERE status = ACTIVE'
    );
    var guestOrderList = {};
    if (id != 0) {
    } else {
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

module.exports = router;
