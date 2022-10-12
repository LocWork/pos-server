const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const helpers = require('./../utils/helpers');
// async function validateUserRole(req, res, next) {
//   try {
//     if (req.session.user.role == sob.WAITER) {
//       next();
//     } else {
//       res.status(401).json({ msg: 'Không được quyền truy cập!' });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ msg: 'Lỗi hệ thống!' });
//   }
// }
async function isTableInUse(req, res, next) {
  try {
    const { id } = req.body;
    const tableStatus = await pool.query(
      `SELECT status FROM "table" WHERE id = $1`,
      [id]
    );
    if (tableStatus.rows[0].status) {
      if (tableStatus.rows[0].status == sob.NOT_USE) {
        next();
      } else {
        res.status(400).json({ msg: 'Bàn đã có check' });
      }
    } else {
      res.status(400).json({ msg: 'Không tìm được bàn!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

router.get('/tablecheck/:id', async (req, res) => {
  try {
    const { id } = req.params;
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.post('/check/create', isTableInUse, async (req, res) => {
  try {
    const shiftId = req.session.shiftId;
    const { id } = req.body;
    const waiterId = req.session.user.id;

    const checkno = await helpers.randomCheckString(8);
    const createCheck = await pool.query(
      `INSERT INTO "check"(shiftid,waiterid,tableid,checkno,subtotal,totaltax,totalamount,creatorid,creationtime,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,'ACTIVE') RETURNING id;`,
      [shiftId, waiterId, id, checkno, 0, 0, 0, waiterId]
    );
    if (createCheck.rows[0]) {
      const updateTable = await pool.query(
        `UPDATE "table" SET status = 'IN_USE' WHERE id = $1`,
        [id]
      );
      res.status(200).json(createCheck.rows[0]);
    } else {
      res.status(400).json({ msg: 'Không thể tạo đơn' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.put('/check/closed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const closeCheck = await pool.query(
      `UPDATE "check" SET status ='CLOSED' WHERE status = 'ACTIVE' and tableid= $1`,
      [id]
    );
    const closeTable = await pool.query(
      `UPDATE "table" SET status = 'NOT_USE' WHERE id=$1`,
      [id]
    );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//GO back to this later;
// router.post('/check/:id', async (req, res) => {
//   try {
//     const {id} = req.body;
//     const checkInformation
//   } catch (error) {
//      console.log(error);
//      res.status(400).json({ msg: 'Lỗi hệ thống!' });
//   }
// });

router.post('/check/checkdetail/add', async (req, res) => {
  try {
    const itemList = req.body;
    console.log(itemList);
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
