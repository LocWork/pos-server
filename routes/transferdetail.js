const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const helpers = require('../utils/helpers');

async function checkRoleWaiterAndCashier(req, res, next) {
  try {
    if (
      req.session.user.role == sob.WAITER ||
      req.session.user.role == sob.CASHIER
    ) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

//router.use(checkRoleWaiterAndCashier);

async function isAllItemServed(req, res, next) {
  try {
    const { id1 } = req.body;
    const checkdetail = await pool.query(
      `SELECT status FROM "checkdetail" WHERE checkid = $1 AND status != 'SERVED' AND status != 'VOID' LIMIT 1`,
      [id1]
    );
    if (checkdetail.rows[0]) {
      res.status(400).json({ msg: 'Đơn vẫn còn món chưa xử lý!' });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function massViewUpdate(currentLocationId, req, res) {
  try {
    req.io
      .to('POS-L-0')
      .emit('update-pos-tableOverview', await helpers.updateTableOverview(0));

    req.io
      .to(`POS-L-${currentLocationId}`)
      .emit(
        'update-pos-tableOverview',
        await helpers.updateTableOverview(currentLocationId)
      );

    req.io
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function overviewUpdate(currentLocationId, req, res) {
  try {
    req.io
      .to(`POS-L-${currentLocationId}`)
      .emit(
        'update-pos-tableOverview',
        await helpers.updateTableOverview(currentLocationId)
      );
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function createCheck(req, res, next) {
  try {
    const { id2 } = req.body;
    const shiftId = req.session.shiftId;
    const accountId = req.session.user.id;
    const checkno = await helpers.checkNoString(8);
    const createCheck = await pool.query(
      `INSERT INTO "check"(shiftid,accountId,tableid,checkno,subtotal,totaltax,totalamount,creatorid,creationtime,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,'ACTIVE') RETURNING id;`,
      [shiftId, accountId, id2, checkno, 0, 0, 0, accountId]
    );
    if (createCheck.rows[0]) {
      const updateTable = await pool.query(
        `UPDATE "table" SET status = 'IN_USE' WHERE id = $1`,
        [id2]
      );
      next();
    } else {
      res.status(400).json({ msg: 'Không thể tạo đơn' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function isSecondTableInUse(req, res, next) {
  try {
    const { id2 } = req.body;
    const tableStatus = await pool.query(
      `SELECT status FROM "table" WHERE id = $1`,
      [id2]
    );
    if (tableStatus.rows[0]) {
      if (tableStatus.rows[0].status == sob.IN_USE) {
        const tableCheck = await pool.query(
          `SELECT id FROM "check" WHERE tableId = $1 AND status = 'ACTIVE' LIMIT 1`,
          [id2]
        );
        if (tableCheck.rows[0]) {
          next();
        } else {
          await createCheck(req, res, next);
        }
      } else {
        await createCheck(req, res, next);
      }
    } else {
      res.status(400).json({ msg: 'Không tìm được bàn' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function canItemTransfer(req, res, next) {
  try {
    const { detaillist } = req.body;
    var flag = true;

    for (var i = 0; i < detaillist.length; i++) {
      var item = await pool.query(
        `SELECT id FROM checkdetail WHERE id = $1 AND (status != 'VOID' AND status != 'RECALL')`,
        [detaillist[i].id]
      );
      if (!item.rows[0]) {
        flag = false;
      }
    }
    if (flag) {
      next();
    } else {
      res.status(400).json('Không thể tách đơn');
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function isCheckActiveForTransfer(req, res, next) {
  try {
    const { id1 } = req.body;
    const checkstatus = await pool.query(
      `SELECT status FROM "check" WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [id1]
    );
    if (checkstatus.rows[0]) {
      next();
    } else {
      res.status(400).json({ msg: `Không tìm thấy thông tin` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

router.get('/check/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const taxValue = await pool.query(
      `SELECT COALESCE(taxValue,0) AS taxvalue  FROM systemsetting LIMIT 1`
    );

    const checkdetail = await pool.query(
      `
    SELECT D.id, I.name AS itemname, D.quantity, D.itemprice, D.status
    FROM checkdetail AS D
    JOIN item AS I
    ON D.itemid = I.id
    WHERE D.status != 'VOID' AND D.status != 'RECALL' AND D.checkid = $1
    ORDER BY D.id ASC;
   `,
      [id]
    );

    res
      .status(200)
      .json({ taxvalue: taxValue.rows[0], checkdetail: checkdetail.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

async function transferDetailInFull(secondTableCheckId, currentDetailId) {
  try {
    const updateCheckDetail = await pool.query(
      `
    UPDATE checkdetail SET checkid = $1 WHERE id = $2
    `,
      [secondTableCheckId, currentDetailId]
    );
  } catch (error) {
    console.log(error);
  }
}

async function transferDetailSingle(
  currentDetail,
  transferDetail,
  secondTableCheckId,
  taxAmount
) {
  try {
    //for updating the current check
    var temp = currentDetail;

    temp.quantity = (temp.quantity - transferDetail.quantity).toFixed(3);
    temp.subtotal = Math.ceil(temp.itemprice * temp.quantity);
    temp.taxAmount = Math.ceil(temp.subtotal * (taxAmount / 100));
    temp.amount = Math.ceil(temp.subtotal + temp.taxAmount);
    const updateDetail = await pool.query(
      `
        UPDATE checkdetail SET quantity = $1, subtotal = $2, taxamount = $3, amount = $4 WHERE id = $5;
      `,
      [
        temp.quantity,
        temp.subtotal,
        temp.taxAmount,
        temp.amount,
        currentDetail.id,
      ]
    );

    //for insert/transfer to the new check
    var temp1 = currentDetail;
    temp1.quantity = transferDetail.quantity.toFixed(3);
    temp1.subtotal = Math.ceil(temp.itemprice * temp.quantity);
    temp1.taxAmount = Math.ceil(temp.subtotal * (taxAmount / 100));
    temp1.amount = Math.ceil(temp.subtotal + temp.taxAmount);
    const transfer = await pool.query(
      `INSERT INTO checkdetail(checkid,itemid,itemprice,quantity,subtotal,taxamount,amount,status,starttime,isreminded) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,false) RETURNING id`,
      [
        secondTableCheckId,
        temp1.itemid,
        temp1.itemprice,
        temp1.quantity,
        temp1.subtotal,
        temp1.taxAmount,
        temp1.amount,
        temp1.status,
        temp1.starttime,
      ]
    );

    const specialRequest = await pool.query(
      `SELECT specialrequestid FROM checkdetailspecialrequest WHERE checkdetailid = $1`,
      [currentDetail.id]
    );

    for (var i = 0; i < specialRequest.rows.length; i++) {
      var insertSpecialRequest = await pool.query(
        `INSERT INTO checkdetailspecialrequest(checkdetailid,specialrequestid) VALUES($1,$2)`,
        [transfer.rows[0].id, specialRequest.rows[i].specialrequestid]
      );
    }
  } catch (error) {
    console.log(error);
  }
}

async function updateCheckInfo(idCheck1, idCheck2, req) {
  try {
    const newCheckValue1 = await pool.query(
      `
      SELECT coalesce(SUM(D.subtotal),0) AS subtotal , coalesce(SUM(D.taxamount),0) AS taxamount, coalesce(SUM(D.amount),0) AS totalamount
      FROM checkdetail AS D
      JOIN "check" AS C
      ON D.checkid = C.id AND D.status != 'VOID'
      WHERE C.id = $1;
      `,
      [idCheck1]
    );
    if (newCheckValue1.rows) {
      const updateCheckValueTable2 = await pool.query(
        `
            UPDATE "check"
            SET subtotal = $1, totaltax = $2,totalamount = $3,updaterid = $4,updatetime = CURRENT_TIMESTAMP
            WHERE id = $5;
            `,
        [
          newCheckValue1.rows[0].subtotal,
          newCheckValue1.rows[0].taxamount,
          newCheckValue1.rows[0].totalamount,
          req.session.user.id,
          idCheck1,
        ]
      );

      const newCheckValue2 = await pool.query(
        `
      SELECT coalesce(SUM(D.subtotal),0) AS subtotal , coalesce(SUM(D.taxamount),0) AS taxamount, coalesce(SUM(D.amount),0) AS totalamount
      FROM checkdetail AS D
      JOIN "check" AS C
      ON D.checkid = C.id AND D.status != 'VOID'
      WHERE C.id = $1;
      `,
        [idCheck2]
      );
      if (newCheckValue2.rows) {
        const updateCheckValueTable2 = await pool.query(
          `
            UPDATE "check"
            SET subtotal = $1, totaltax = $2,totalamount = $3,updaterid = $4,updatetime = CURRENT_TIMESTAMP
            WHERE id = $5;
            `,
          [
            newCheckValue2.rows[0].subtotal,
            newCheckValue2.rows[0].taxamount,
            newCheckValue2.rows[0].totalamount,
            req.session.user.id,
            idCheck2,
          ]
        );
      }
    }

    const updateCheckFrom = await pool.query(
      `UPDATE "check" SET updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
      [req.session.user.id, idCheck1]
    );
    const updateCheckTo = await pool.query(
      `UPDATE "check" SET updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
      [req.session.user.id, idCheck2]
    );
  } catch (error) {
    console.log(error);
  }
}

//detailid, quantity
router.put(
  '/transfer/item',
  canItemTransfer,
  isCheckActiveForTransfer,
  isSecondTableInUse,
  async (req, res) => {
    try {
      const { id1, id2, detaillist } = req.body;

      const firstTableCheck = await pool.query(
        `SELECT C.id, T.locationid FROM "check" AS C JOIN "table" AS T ON C.tableid = T.id WHERE C.id = $1 AND C.status = 'ACTIVE' LIMIT 1;`,
        [id1]
      );

      const secondTableCheck = await pool.query(
        `SELECT C.id, T.locationid FROM "check" AS C JOIN "table" AS T ON C.tableid = T.id WHERE C.tableId = $1 AND C.status = 'ACTIVE' LIMIT 1`,
        [id2]
      );

      const tax = await pool.query(
        `SELECT COALESCE(taxValue,0) AS taxvalue  FROM systemsetting LIMIT 1`
      );

      for (var i = 0; i < detaillist.length; i++) {
        var transferDetail = detaillist[i];
        var currentDetail = await pool.query(
          `
      SELECT id, checkid,itemid,itemprice,quantity,subtotal,taxamount,note,starttime,completiontime,status
      FROM checkdetail
      WHERE id = $1
      LIMIT 1;
      `,
          [transferDetail.id]
        );

        transferDetail.itemid = currentDetail.rows[0].itemid;

        if (currentDetail.rows[0].quantity <= transferDetail.quantity) {
          await transferDetailInFull(
            secondTableCheck.rows[0].id,
            currentDetail.rows[0].id
          );
        } else {
          await transferDetailSingle(
            currentDetail.rows[0],
            transferDetail,
            secondTableCheck.rows[0].id,
            tax.rows[0].taxvalue,
            req
          );
        }
      }
      await updateCheckInfo(
        firstTableCheck.rows[0].id,
        secondTableCheck.rows[0].id,
        req
      );
      await massViewUpdate(firstTableCheck.rows[0].locationid, req, res);
      if (
        firstTableCheck.rows[0].locationid !=
        secondTableCheck.rows[0].locationid
      ) {
        await overviewUpdate(secondTableCheck.rows[0].locationid, req, res);
      }
      res.status(200).json({ msg: 'Món đã được tách' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
  }
);

async function transferPercent(
  checkdetail,
  percent,
  taxAmount,
  secondTableCheckId,
  req
) {
  try {
    //remain;
    const retainValue = checkdetail.quantity;
    Object.freeze(retainValue);
    var temp = checkdetail;
    temp.quantity = (temp.quantity - temp.quantity * (percent / 100)).toFixed(
      3
    );
    temp.completedquanitity = temp.quantity;
    temp.subtotal = Math.ceil(temp.itemprice * temp.quantity);
    temp.taxAmount = Math.ceil(temp.subtotal * (taxAmount / 100));
    temp.amount = Math.ceil(temp.subtotal + temp.taxAmount);

    const updateDetail = await pool.query(
      `
        UPDATE checkdetail SET quantity = $1, subtotal = $2, taxamount = $3, amount = $4 WHERE id = $5;
      `,
      [
        temp.quantity,
        temp.subtotal,
        temp.taxAmount,
        temp.amount,
        checkdetail.id,
      ]
    );

    temp.quantity = (retainValue * (percent / 100)).toFixed(3);
    temp.completedquanitity = temp.quantity;
    temp.subtotal = Math.ceil(temp.itemprice * temp.quantity);
    temp.taxAmount = Math.ceil(temp.subtotal * (taxAmount / 100));
    temp.amount = Math.ceil(temp.subtotal + temp.taxAmount);

    const transfer = await pool.query(
      `INSERT INTO checkdetail(checkid,itemid,itemprice,quantity,subtotal,taxamount,amount,status,starttime,isreminded) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,false) RETURNING id`,
      [
        secondTableCheckId,
        temp.itemid,
        temp.itemprice,
        temp.quantity,
        temp.subtotal,
        temp.taxAmount,
        temp.amount,
        temp.status,
        temp.starttime,
      ]
    );

    const specialRequest = await pool.query(
      `SELECT specialrequestid FROM checkdetailspecialrequest WHERE checkdetailid = $1`,
      [checkdetail.id]
    );

    for (var i = 0; i < specialRequest.rows.length; i++) {
      var insertSpecialRequest = await pool.query(
        `INSERT INTO checkdetailspecialrequest(checkdetailid,specialrequestid) VALUES($1,$2)`,
        [transfer.rows[0].id, specialRequest.rows[i].specialrequestid]
      );
    }
  } catch (error) {
    console.log(error);
  }
}

router.put(
  '/transfer/percent',
  isCheckActiveForTransfer,
  isAllItemServed,
  isSecondTableInUse,
  async (req, res) => {
    try {
      const { id1, id2, percent } = req.body;

      const firstTableCheck = await pool.query(
        `SELECT C.id, T.locationid FROM "check" AS C JOIN "table" AS T ON C.tableid = T.id WHERE C.id = $1 AND C.status = 'ACTIVE' LIMIT 1;`,
        [id1]
      );

      const secondTableCheck = await pool.query(
        `SELECT C.id, T.locationid FROM "check" AS C JOIN "table" AS T ON C.tableid = T.id WHERE C.tableId = $1 AND C.status = 'ACTIVE' LIMIT 1`,
        [id2]
      );

      const tax = await pool.query(
        `SELECT COALESCE(taxValue,0) AS taxvalue  FROM systemsetting LIMIT 1`
      );

      const checkDetailList = await pool.query(
        `SELECT id, checkid,itemid,itemprice,quantity,subtotal,taxamount,note,starttime,completiontime,status
      FROM checkdetail
      WHERE checkid = $1 AND status != 'VOID' AND status != 'RECALL'`,
        [firstTableCheck.rows[0].id]
      );
      var detaillist = checkDetailList.rows;

      for (var i = 0; i < detaillist.length; i++) {
        var quantity = (detaillist[i].quantity * (percent / 100)).toFixed(3);
        if (percent == 100 || quantity == 0) {
          await transferDetailInFull(
            secondTableCheck.rows[0].id,
            detaillist[i].id
          );
        } else {
          await transferPercent(
            detaillist[i],
            percent,
            tax.rows[0].taxvalue,
            secondTableCheck.rows[0].id,
            req
          );
        }
      }
      await updateCheckInfo(
        firstTableCheck.rows[0].id,
        secondTableCheck.rows[0].id,
        req
      );
      await massViewUpdate(firstTableCheck.rows[0].locationid, req, res);
      if (
        firstTableCheck.rows[0].locationid !=
        secondTableCheck.rows[0].locationid
      ) {
        await overviewUpdate(secondTableCheck.rows[0].locationid, req, res);
      }
      res.status(200).json({ msg: 'Món đã được tách' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
  }
);

module.exports = router;
