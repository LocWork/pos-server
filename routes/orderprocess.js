const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const helpers = require('../utils/helpers');
const _ = require('lodash');

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

async function isAllItemServed(req, res, next) {
  try {
    const { checkid } = req.body;
    const checkdetail = await pool.query(
      `SELECT status FROM "checkdetail" WHERE checkid = $1 AND status != 'SERVED' AND status != 'VOID' LIMIT 1`,
      [checkid]
    );
    if (checkdetail.rows[0]) {
      res.status(400).json({ msg: 'Đơn vẫn còn món chưa sử lý!' });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function massViewUpdate(req, res) {
  try {
    req.io
      .to('POS-L-0')
      .emit('update-pos-tableOverview', await helpers.updateTableOverview(0));

    req.io
      .to(`POS-L-${req.session.locationid}`)
      .emit(
        'update-pos-tableOverview',
        await helpers.updateTableOverview(req.session.locationid)
      );

    req.io
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function hasCheckBeenRefund(req, res, next) {
  try {
    const { checkid } = req.body;
    const getBill = await pool.query(
      `SELECT id FROM bill WHERE checkid = $1 and status = 'REFUND' LIMIT 1
      `,
      [checkid]
    );
    if (getBill.rows[0]) {
      res.status(400).json({ msg: 'Hóa đơn này đã được hoàn tiền!' });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

//router.use(checkRoleCashier);

router.post('/check/process', isAllItemServed, async (req, res) => {
  try {
    const { checkid, paymentlist } = req.body;
    const billno = await helpers.billNoString();
    const validate = await pool.query(
      'SELECT id FROM "bill" WHERE billno = $1',
      [billno]
    );
    if (validate.rows[0]) {
      res.status(400).json({
        msg: 'Lỗi hệ thống: Xin liên hệ quản trị viên để giải quyết lỗi.',
      });
    } else {
      const getCheck = await pool.query(
        `
      SELECT C.id AS checkid, C.guestname,C.subtotal,C.totaltax,C.totalamount, C.note, C.tableid 
      FROM "check" AS C
      JOIN "table" AS T
      ON T.id = C.tableid
      WHERE C.id = $1 AND C.status = 'ACTIVE' AND T.status = 'IN_USE';
      `,
        [checkid]
      );
      if (!getCheck.rows[0]) {
        res.status(400).json({ msg: 'Không thể xử lý hóa đơn' });
      } else {
        const createBill = await pool.query(
          `
      INSERT INTO "bill"(checkid,billno,guestname,subtotal,totaltax,totalamount,note,creatorId,creationTime, status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP, 'CLOSED') RETURNING id
    `,
          [
            getCheck.rows[0].checkid,
            billno,
            getCheck.rows[0].guestname,
            getCheck.rows[0].subtotal,
            getCheck.rows[0].totaltax,
            getCheck.rows[0].totalamount,
            getCheck.rows[0].note,
            req.session.user.id,
          ]
        );
        if (createBill.rows[0]) {
          //insert payment method
          const checkdetail = await pool.query(
            `SELECT D.id, I.name AS itemname, D.itemid,D.itemprice, D.quantity, D.subtotal, D.taxamount, D.amount
          FROM "checkdetail" AS D
          JOIN "item" AS I
          ON D.itemid = I.id
          WHERE D.status != 'VOID' AND D.status = 'SERVED' AND D.checkid = $1`,
            [checkid]
          );
          const detaillist = await helpers.printBillDetailList(
            checkdetail.rows
          );
          for (var i = 0; i < paymentlist.length; i++) {
            var payment = await pool.query(
              `
          INSERT INTO billpayment(billid,paymentmethodid,paymentmethodname,amountreceive) VALUES($1,$2,$3,$4)
        `,
              [
                createBill.rows[0].id,
                paymentlist[i].id,
                paymentlist[i].name,
                paymentlist[i].amount,
              ]
            );
          }

          for (var x = 0; x < detaillist.length; x++) {
            var detail = await pool.query(
              `
            INSERT INTO billdetail(billid,itemid,itemname,itemprice,quantity,subtotal,taxamount,amount) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
          `,
              [
                createBill.rows[0].id,
                detaillist[x].itemid,
                detaillist[x].itemname,
                detaillist[x].itemprice,
                detaillist[x].quantity,
                detaillist[x].subtotal,
                detaillist[x].taxamount,
                detaillist[x].amount,
              ]
            );
          }
          const updateTable = await pool.query(
            `UPDATE "table" SET status = 'NOT_USE' WHERE id = $1`,
            [getCheck.rows[0].tableid]
          );

          const updateCheck = await pool.query(
            `UPDATE "check" SET status = 'CLOSED', updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
            [req.session.user.id, checkid]
          );
          await massViewUpdate(req, res);
          res.status(200).json({ msg: 'Thanh toán thành công' });
        } else {
          res.status(400).json({ msg: 'Không thể xử lý hóa đơn' });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//GET check and detail for refund
router.get('/check/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const getCheck = await pool.query(
      `SELECT C.id AS checkid,C.checkno,(C.subtotal * -1) AS subtotal,(C.totalTax * -1) AS totaltax, (C.totalamount * -1) AS totalamount, C.creationtime::time(0)
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.status = 'CLOSED' AND C.id = $1
      LIMIT 1;
      `,
      [id]
    );

    var checkInfo = [];

    for (var i = 0; i < getCheck.rows.length; i++) {
      var checkDetailList = await pool.query(
        `
       SELECT D.id AS checkDetailId, I.name AS itemname, D.quantity, D.note, D.isReminded, (D.amount * -1) AS amount
       FROM "check" AS C
 	     JOIN checkdetail AS D
       ON C.id = D.checkid
       JOIN item AS I
       ON D.itemid = I.id
       WHERE D.status != 'VOID' AND C.id = $1
       ORDER BY D.id ASC;
       `,
        [getCheck.rows[0].checkid]
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
          [checkDetailList.rows[x].checkdetailid]
        );

        temp.push(
          _.merge(checkDetailList.rows[x], {
            specialrequest: specialRequestList.rows,
          })
        );
      }
    }
    checkInfo = _.merge(getCheck.rows[0], { checkdetail: temp });

    res.status(200).json({
      check: checkInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.post('/check/refund', hasCheckBeenRefund, async (req, res) => {
  try {
    const { checkid } = req.body;
    const billno = await helpers.billNoString();
    const validate = await pool.query(
      'SELECT id FROM "bill" WHERE billno = $1',
      [billno]
    );
    if (validate.rows[0]) {
      res.status(400).json({
        msg: 'Lỗi hệ thống: Xin liên hệ quản trị viên để giải quyết lỗi.',
      });
    } else {
      const getCheck = await pool.query(
        `
    SELECT id AS checkid, guestname,(subtotal * -1) AS subtotal,(totaltax * -1) AS totaltax,(totalamount * -1) AS totalamount, note
    FROM "check"
    WHERE id = $1 and status = 'CLOSED';
    `,
        [checkid]
      );
      if (!getCheck.rows[0]) {
        res.status(400).json({ msg: 'Không thể xử lý hóa đơn' });
      } else {
        const createBill = await pool.query(
          `
      INSERT INTO "bill"(checkid,billno,guestname,subtotal,totaltax,totalamount,note,creatorId,creationTime, status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP, 'REFUND') RETURNING id
    `,
          [
            getCheck.rows[0].checkid,
            billno,
            getCheck.rows[0].guestname,
            getCheck.rows[0].subtotal,
            getCheck.rows[0].totaltax,
            getCheck.rows[0].totalamount,
            getCheck.rows[0].note,
            req.session.user.id,
          ]
        );
        if (createBill.rows[0]) {
          const paymentlist = await pool.query(
            `
      SELECT BP.paymentmethodid AS id, BP.paymentmethodname AS name, (BP.amountreceive * -1) AS amount
      FROM "billpayment" AS BP
      JOIN bill AS B
      ON B.id = BP.billid
      WHERE B.checkid = $1;
      `,
            [checkid]
          );

          //insert payment method
          for (var i = 0; i < paymentlist.rows.length; i++) {
            var payment = await pool.query(
              `
          INSERT INTO billpayment(billid,paymentmethodid,paymentmethodname,amountreceive) VALUES($1,$2,$3,$4)
        `,
              [
                createBill.rows[0].id,
                paymentlist.rows[i].id,
                paymentlist.rows[i].name,
                paymentlist.rows[i].amount,
              ]
            );
          }

          const checkdetail = await pool.query(
            `SELECT D.id, I.name AS itemname, D.itemid,D.itemprice, D.quantity, (D.subtotal * -1) AS subtotal, (D.taxamount *-1) AS taxamount, (D.amount * -1) AS amount
          FROM "checkdetail" AS D
          JOIN "item" AS I
          ON D.itemid = I.id
          WHERE D.status != 'VOID' AND D.status = 'SERVED' AND D.checkid = $1`,
            [checkid]
          );
          const detaillist = await helpers.printBillDetailList(
            checkdetail.rows
          );

          for (var x = 0; x < detaillist.length; x++) {
            var detail = await pool.query(
              `
            INSERT INTO billdetail(billid,itemid,itemname,itemprice,quantity,subtotal,taxamount,amount) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
          `,
              [
                createBill.rows[0].id,
                detaillist[x].itemid,
                detaillist[x].itemname,
                detaillist[x].itemprice,
                detaillist[x].quantity,
                detaillist[x].subtotal,
                detaillist[x].taxamount,
                detaillist[x].amount,
              ]
            );
          }
          res.status(200).json({ msg: 'Hoàn tiền thành công' });
        } else {
          res.status(400).json({ msg: 'Không thể xử lý hóa đơn' });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
