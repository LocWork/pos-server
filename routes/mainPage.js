const { Router } = require('express');
const router = Router();
const pool = require('./../db');

router.get('/', async (req, res) => {
  try {
    const location = await pool.query(
      'SELECT id, name FROM "location" WHERE status != \'INACTIVE\''
    );
    if (location.rows[0]) {
      res.status(200).json(location.rows);
    } else {
      res.status(400).json({ msg: 'Không thể tìm được vị trí!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
