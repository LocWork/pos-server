const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('./.././staticObj');

async function validateUserRole(req, res, next) {
  try {
    if (req.session.user.role == sob.WAITER) {
      next();
    } else {
      res.status(401).json({ msg: 'Không được quyền truy cập!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

router.post('/create', validateUserRole, async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
