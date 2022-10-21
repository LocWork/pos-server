const Router = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const helpers = require('../utils/helpers');

async function checkSessionAndRole(req, res, next) {
  try {
    if (req.session.user && req.session.shiftId) {
      if (req.session.user.role == sob.CASHIER) {
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

router.use(checkSessionAndRole);

router.get(`/checklist`, async (req, res) => {
  try {
    const checkList = await pool.query(`
    SELECT C.id, C.creationtime::Date, C.checkno, T.name AS tablename, L.name AS locationname, C.guestname, C.cover, C.totaltax, C.totalamount, C.status
    FROM "check" AS C
    JOIN "table" AS T
    ON T.id = C.tableid
    JOIN "location" AS L
    ON L.id = T.locationid;
   `);
    res.status(200).json(checkList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get(`/billlist`, async (req, res) => {
  try {
    const billlist = await pool.query(`
    SELECT id, billno, guestname, totaltax, totalamount,status
    FROM "bill";
   `);
    res.status(200).json(billlist.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get(`/check`, async (req, res) => {
  try {
    const { checkno, status } = req.query;
    const checkList = await pool.query(
      `
    SELECT C.id, C.creationtime::Date, C.checkno, T.name AS tablename, L.name AS locationname, C.guestname, C.cover, C.totaltax, C.totalamount, C.status
    FROM "check" AS C
    JOIN "table" AS T
    ON T.id = C.tableid
    JOIN "location" AS L
    ON L.id = T.locationid
    WHERE C.checkno = $1 AND C.status = $2
   `,
      [checkno, status]
    );
    res.status(200).json(checkList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get(`/bill`, async (req, res) => {
  try {
    const { billno, status } = req.query;
    const billlist = await pool.query(
      `
    SELECT id, billno, guestname, totaltax, totalamount,status
    FROM "bill"
    WHERE billno = $1 AND status = $2
   `,
      [billno, status]
    );
    res.status(200).json(billlist.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get(`/check/:id/`, async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query(
      `
    SELECT C.id, S.name AS shiftname, A.fullname AS manageby, T.name AS tablename, L.name AS locationname, V.name AS voidreason, C.checkno, C.guestname,C.cover,C.subtotal, C.totaltax, C.totalamount,C.note, C.status
    FROM "check" AS C
    JOIN "table" AS T
    ON T.id = C.tableid
    JOIN "location" AS L
    ON L.id = T.locationid
    JOIN "account" AS A
    ON A.id = C.accountid
    JOIN "shift" AS S
    ON S.id = C.shiftid
    LEFT JOIN "voidreason" AS V
    ON C.voidreasonid = V.id
    WHERE C.id = $1;
   `,
      [id]
    );
    res.status(200).json(check.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get(`/bill/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await pool.query(
      `
    SELECT id, billno, guestname, subtotal, totaltax, totalamount,note,status
    FROM "bill"
    WHERE id = $1
   `,
      [id]
    );
    res.status(200).json(bill.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get(`/check/:id/detail`, async (req, res) => {
  try {
    const { id } = req.params;
    const checkdetailist = await pool.query(
      `
      SELECT D.id, I.name AS itemname, V.name AS voidreason, D.itemprice,D.quantity,D.subtotal,D.taxamount,D.amount,D.note
      FROM "checkdetail" AS D
      JOIN "item" AS I
      ON D.itemid = I.id
      LEFT JOIN "voidreason" AS V
      ON D.voidreasonid = V.id
      WHERE D.checkid = $1;
   `,
      [id]
    );
    res.status(200).json(checkdetaillist.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
