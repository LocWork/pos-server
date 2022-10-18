const { Router } = require('express');
const router = Router();
const pool = require('./../db');

async function isCheckExist(req, res, next) {
  try {
    const check = await pool.query(
      `SELECT id
      FROM "check"
      WHERE status = 'ACTIVE' AND accountid = $1 LIMIT 1`,
      [req.session.user.id]
    );
    console.log(check.rows[0]);
    if (check.rows[0]) {
      res.status(400).json({ msg: 'Xin hãy phân công lại trước khi logout!' });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function checkUserSession(req, res, next) {
  try {
    if (req.session.user) {
      next();
    } else {
      res
        .status(401)
        .json(
          'msg: Lỗi hệ thống. Không thể lấy thông tin người dùng hiện tại!'
        );
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}
//checkUserSession
router.post('/', checkUserSession, isCheckExist, async (req, res) => {
  try {
    const userLogOut = await pool.query(
      `Update "account" SET status = 'OFFLINE' WHERE id=$1`,
      [req.session.user.id]
    );

    req.session.destroy();
    req.session = null;
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
