const { Router } = require('express');
const router = Router();
const pool = require('./../db');

async function checkUserSession(req, res, next) {
  try {
    if (req.session.user) {
      next();
    } else {
      res.status(401).json('msg: Không thể lấy thông tin người dùng hiện tại!');
    }
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ msg: 'Lỗi hệ thống, không thể kiểm tra người dùng!' });
  }
}

router.post('/', checkUserSession, async (req, res) => {
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
