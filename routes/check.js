const Router = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const helpers = require('../utils/helpers');

router.get(`/check`, (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
