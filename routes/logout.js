const { Router } = require('express');
const router = Router();
const pool = require('./../db');
const sob = require('./.././staticObj');

async function checkSession(req, res, next) {
  try {
    if (req.session.user && req.session.shiftId) {
      next();
    } else {
      req.session.destroy();
      res.status(400).json();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

router.get('/role', checkSession, async (req, res) => {
  try {
    res.status(200).json({ role: req.session.user.role });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.post(`/cashierclose`, async (req, res) => {
  try {
    const { amount } = req.body;
    const updateShift = await pool.query(
      `UPDATE "shift" SET isOpen = false, closerid = $1 WHERE id = $2 AND status = 'ACTIVE' returning id`,
      [req.session.user.id, req.session.shiftId]
    );

    if (updateShift.rows[0]) {
      const open = await pool.query(
        `
      INSERT INTO cashierlog(accountid, shiftid,creationtime,type,amount) VALUES($1,$2,NOW()::timestamp,'CLOSED',$3) RETURNING id
      `,
        [req.session.user.id, updateShift.rows[0].id, amount]
      );
      if (open.rows[0]) {
        req.session.shiftId = updateShift.rows[0].id;
        res.status(200).json();
      } else {
        req.session.destroy();
        res.status(400).json({ msg: 'Không thể lưu thông tin đóng ca' });
      }
    } else {
      req.session.destroy();
      res.status(400).json({ msg: 'Không thể đóng ca' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userLogOut = await pool.query(
      `Update "account" SET status = 'OFFLINE' WHERE id=$1`,
      [req.session.user.id]
    );
    req.session.destroy();
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
