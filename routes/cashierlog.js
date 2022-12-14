const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');

async function checkRoleCashier(req, res, next) {
  try {
    if (req.session.user.role == sob.CASHIER) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

router.use(checkRoleCashier);
//LIST CASHIER LOG.
router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT C.id, S.name as shiftname, A.fullname,C.creationTime::timestamp at time zone 'utc' at time zone 'Asia/Bangkok' AS creationtime,C.type, C.amount, C.isverify
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

async function canUpdateCashierLog(req, res, next) {
  try {
    const { id } = req.params;
    const cashierLog = await pool.query(
      `SELECT isverify from cashierlog WHERE id = $1`,
      [id]
    );
    if (cashierLog.rows[0]) {
      if (cashierLog.rows[0].isverify == true) {
        res.status(400).json({ msg: 'Không thể cập nhật' });
      } else {
        next();
      }
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

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
      res.status(200).json(amount.rows[0]);
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

router.put('/:id', canUpdateCashierLog, async (req, res) => {
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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

module.exports = router;
