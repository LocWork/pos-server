const Router = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const helpers = require('../utils/helpers');
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

// router.use(checkRoleCashier);

router.get(`/checklist`, async (req, res) => {
  try {
    const checkList = await pool.query(`
    SELECT C.id, C.creationtime::TIMESTAMP::DATE, C.checkno, T.name AS tablename, L.name AS locationname, C.totaltax, C.totalamount, C.status
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
    SELECT B.id, B.creationtime::TIMESTAMP::DATE, B.billno, T.name AS tablename, L.name AS locationname, B.totaltax, B.totalamount, B.status
    FROM "bill" AS B 
    JOIN "check" AS C
    ON B.checkid = C.id
    JOIN "table" AS T
    ON T.id = C.tableid
    JOIN "location" AS L
    ON L.id = T.locationid
   `);
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
    SELECT C.id,C.creationtime::TIMESTAMP::DATE, S.name AS shiftname, C.checkno, A.fullname AS manageby, T.name AS tablename, L.name AS locationname, V.name AS voidreason, C.guestname,C.cover,C.note,C.subtotal, C.totaltax, C.totalamount, C.status
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
    SELECT id,checkid,creationtime::TIMESTAMP::DATE, billno, guestname, subtotal, totaltax, totalamount,note,status
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

    var checkInfo = [];
    var checkDetailList = await pool.query(
      `
       SELECT D.id, I.name AS itemname, D.quantity, D.note, D.subtotal,D.taxamount, D.amount, D.status, D.completiontime
       FROM "check" AS C
 	     JOIN checkdetail AS D
       ON C.id = D.checkid
       JOIN item AS I
       ON D.itemid = I.id
       WHERE D.status != 'VOID' AND C.id = $1
       ORDER BY D.id ASC;
       `,
      [id]
    );

    var temp = [];
    for (var x = 0; x < checkDetailList.rows.length; x++) {
      var specialRequestList = await pool.query(
        `
          SELECT S.name
          FROM checkdetailspecialrequest AS CSP
          JOIN checkdetail AS D
          ON CSP.checkdetailid = D.id
          JOIN specialrequest AS S
          ON CSP.specialrequestid = S.id
          WHERE D.id = $1
          `,
        [checkDetailList.rows[x].id]
      );

      temp.push(
        _.merge(checkDetailList.rows[x], {
          specialrequest: specialRequestList.rows,
        })
      );
    }

    //checkInfo = _.merge(check.rows[0], { checkdetail: temp });
    res.status(200).json({ checkdetail: checkDetailList.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/bill/:id/detail', async (req, res) => {
  try {
    const { id } = req.params;

    const billDetailList = await pool.query(
      `SELECT id, itemname,itemprice,quantity,subtotal,taxamount,amount FROM "billdetail" WHERE billid = $1`,
      [id]
    );

    res.status(200).json({ billdetail: billDetailList.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/bill/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;

    const billPaymentList = await pool.query(
      `SELECT paymentmethodname,amountreceive FROM "billpayment" WHERE billid = $1`,
      [id]
    );

    res.status(200).json({ paymentdetail: billPaymentList.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
