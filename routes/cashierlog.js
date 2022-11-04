const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const _ = require('lodash');

router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT C.id, S.name as shiftname, A.fullname, CONCAT(C.creationTime::date,' ',C.creationTime::time) AS creationtime,C.type, C.amount
     FROM cashierlog AS C
     JOIN "shift" AS S
     ON C.shiftid = S.id
     JOIN "account" AS A
     ON C.accountid = A.id
     ORDER BY id
     DESC
     ;
    `);
    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const amount = await pool.query(
      `SELECT C.id, C.amount
     FROM cashierlog AS C
     WHERE id = $1
     LIMIT 1;
     ;
    `,
      [id]
    );
    if (amount.rows[0]) {
      res.status(200).json({ amount: amount.rows[0] });
    } else {
      res.status(400).json({ msg: 'Không tim thấy thông tin!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const update = await pool.query(
      `UPDATE cashierlog SET amount = $1, updaterid = $2, updatetime = CURRENT_TIMESTAMP WHERE id = $3
     ;
    `,
      [amount, req.session.user.id, id]
    );
    res.status(200).json({ msg: 'Đã cập nhật' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
