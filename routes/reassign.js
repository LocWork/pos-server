const { Router } = require('express');
const session = require('express-session');
const router = Router();
const pool = require('../db');

async function checkSessionAndRole(req, res, next) {
  try {
    if (req.session.user && req.session.shiftId) {
      if (
        req.session.user.role == sob.WAITER ||
        req.session.user.role == sob.CASHIER
      ) {
        next();
      } else {
        res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
      }
    } else {
      res.status(400).json({ msg: 'Xin hãy login lại vào hệ thống.' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

// router.use(checkSessionAndRole);

async function isUserOnline(req, res, next) {
  try {
    const { touserid } = req.body;
    const waiter = await pool.query(
      `SELECT A.id, A.fullname
      FROM "account" AS A
      JOIN "role" AS R
      ON A.roleid = R.id
      WHERE A.id = $1 AND (R.name = 'WAITER' OR R.name ='CASHIER') AND A.status = 'ONLINE' `,
      [touserid]
    );
    if (waiter.rows[0]) {
      next();
    } else {
      res.status(400).json({ msg: 'Người dùng không còn online!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

router.get('/', async (req, res) => {
  try {
    if (req.session.user.id) {
      const waiterList = await pool.query(
        `SELECT A.id, A.fullname
      FROM "account" AS A
      JOIN "role" AS R
      ON A.roleid = R.id
      WHERE (R.name = 'WAITER' OR R.name ='CASHIER') AND A.status = 'ONLINE' AND A.id != $1`,
        [req.session.user.id]
      );
      res.status(200).json(waiterList.rows);
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin người dùng!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.put('/', isUserOnline, async (req, res) => {
  try {
    const { touserid } = req.body;
    if (req.session.user.id) {
      const reassign = await pool.query(
        `
     UPDATE "check" SET accountid = $1, updaterId = $2, updateTime = CURRENT_TIMESTAMP WHERE accountid = $3 AND status = 'ACTIVE'
     `,
        [touserid, req.session.user.id, req.session.user.id]
      );
      res.status(200).json({ msg: `Đã phân công lại thành công!` });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin người dùng!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
