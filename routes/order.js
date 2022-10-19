const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const helpers = require('../utils/helpers');
const _ = require('lodash');

async function createCheck(req, res, next) {
  try {
    const { id } = req.params;
    const shiftId = req.session.shiftId;
    const accountId = req.session.user.id;
    const checkno = await helpers.randomCheckString(8);
    const createCheck = await pool.query(
      `INSERT INTO "check"(shiftid,accountId,tableid,checkno,subtotal,totaltax,totalamount,creatorid,creationtime,runningsince,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'ACTIVE') RETURNING id;`,
      [shiftId, accountId, id, checkno, 0, 0, 0, accountId]
    );
    if (createCheck.rows[0]) {
      const updateTable = await pool.query(
        `UPDATE "table" SET status = 'IN_USE' WHERE id = $1`,
        [id]
      );
      next();
    } else {
      res.status(400).json({ msg: 'Không thể tạo đơn' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function isTableInUse(req, res, next) {
  try {
    const { id } = req.params;
    const tableStatus = await pool.query(
      `SELECT status FROM "table" WHERE id = $1`,
      [id]
    );
    if (tableStatus.rows[0]) {
      if (tableStatus.rows[0].status == sob.IN_USE) {
        const tableCheck = await pool.query(
          `SELECT id FROM "check" WHERE tableId = $1 AND status = 'ACTIVE' LIMIT 1`,
          [id]
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
      res.status(400).json({ msg: 'Không tìm được bàn!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function isCheckActive(req, res, next) {
  try {
    const { checkid } = req.body;
    const check = await pool.query(
      `SELECT id from "check" WHERE id = $1 AND status = 'ACTIVE'`,
      [checkid]
    );
    if (check.rows[0]) {
      next();
    } else {
      res.status(400).json({ msg: 'Không thể thêm món vào hóa đơn' });
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
    if (req.session.locationid && req.session.locationid != 0) {
      req.io
        .to(`POS-L-${req.session.locationid}`)
        .emit(
          'update-pos-tableOverview',
          await helpers.updateTableOverview(req.session.locationid)
        );
    }
    req.io
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function overViewUpdate(req, res) {
  try {
    req.io
      .to('POS-L-0')
      .emit('update-pos-tableOverview', await helpers.updateTableOverview(0));
    if (req.session.locationid && req.session.locationid != 0) {
      req.io
        .to(`POS-L-${req.session.locationid}`)
        .emit(
          'update-pos-tableOverview',
          await helpers.updateTableOverview(req.session.locationid)
        );
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function kitchenUpdate(req, res) {
  try {
    req.io
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function isAllItemInStock(req, res, next) {
  try {
    for (var i = 0; i < req.body.length; i++) {
      var detail = req.body[i];
      var itemCheck = await pool.query(
        `SELECT S.id , I.name 
        FROM itemOutOfStock AS S 
        JOIN item AS I
        ON I.id = S.itemid
        WHERE S.itemid = $1`,
        [detail.itemId]
      );
      if (itemCheck.rows[0] != null) {
        res
          .status(400)
          .json({ msg: `Món "${itemCheck.rows[0].name}" đã hết hàng.` });
      }
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function updateRunningSince(req, res, next) {
  try {
    const { checkid } = req.params;
    const waitingItem = await pool.query(
      `
      SELECT id FROM checkdetail WHERE checkid = $1 AND checkdetail.status = 'WAITING' LIMIT 1 
      `,
      [checkid]
    );
    if (waitingItem.rows[0] == null) {
      const updateCheckTime = await pool.query(
        `
        UPDATE "check" SET runningSince = CURRENT_TIMESTAMP WHERE id = $1
        `,
        [checkid]
      );
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

//OPEN table, GET component, and VIEW check/checkdetail
router.get('/table/:id/check/', isTableInUse, async (req, res) => {
  try {
    //Get system tax value
    const getTax = await pool.query(
      `SELECT taxValue FROM systemsetting LIMIT 1`
    );

    const getMajorGroupList = await pool.query(
      `
      SELECT id, name
      FROM majorgroup
      WHERE status = 'ACTIVE'
      ORDER BY id ASC
      `
    );
    const getMenuList = await pool.query(
      `
      SELECT id, name, isdefault
      FROM "menu"
      WHERE status = 'ACTIVE'
      ORDER BY isDefault = 'true' DESC
      `
    );

    const { id } = req.params;
    req.session.tableid = id;
    const getCheck = await pool.query(
      `SELECT C.id AS checkid,C.checkno,C.subtotal,C.totalTax, C.totalamount, C.creationtime::time(0), L.id AS locationid
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      JOIN "location" AS L
      ON L.id = T.locationid
      WHERE C.status = 'ACTIVE' AND T.status = 'IN_USE' AND T.id = $1
      LIMIT 1
      `,
      [id]
    );
    req.session.locationid = getCheck.rows[0].locationid;
    req.session.checkid = getCheck.rows[0].checkid;
    var checkInfo = [];

    for (var i = 0; i < getCheck.rows.length; i++) {
      var checkDetailList = await pool.query(
        `
       SELECT D.id AS checkDetailId, I.name AS itemname, D.quantity, D.note, D.isReminded, D.amount
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
          FROM checkitemspecialrequest AS CSP
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
      taxValue: getTax.rows[0].taxvalue,
      majorGroupList: getMajorGroupList.rows,
      menuList: getMenuList.rows,
      check: checkInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Get check and check detail for reload;
router.get('/check/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const getCheck = await pool.query(
      `SELECT C.id AS checkid,C.checkno,C.subtotal,C.totalTax, C.totalamount, C.creationtime::time(0)
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.status = 'ACTIVE' AND T.status = 'IN_USE' AND C.id = $1
      LIMIT 1
      `,
      [id]
    );

    var checkInfo = [];

    for (var i = 0; i < getCheck.rows.length; i++) {
      var checkDetailList = await pool.query(
        `
       SELECT D.id AS checkDetailId, I.name AS itemname, D.quantity, D.note, D.isReminded, D.amount
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
          FROM checkitemspecialrequest AS CSP
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

//View guestname and cover
router.get(`/check/:id/info`, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.session.checkid);
    const checkInfo = await pool.query(
      `SELECT guestName, cover FROM "check" WHERE id = $1`,
      [id]
    );
    res.status(200).json(checkInfo.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//UPDATE guestname and cover
router.put(`/check/:id/info`, async (req, res) => {
  try {
    const { id } = req.params;
    const { guestname, cover } = req.body;
    if (req.session.user) {
      const updateInfomation = await pool.query(
        `UPDATE "check" SET guestName = $1, cover = $2, updaterId = $3, updateTime = CURRENT_TIMESTAMP  WHERE id = $4`,
        [guestname, cover, req.session.user.id, id]
      );
      await overViewUpdate(req, res);
      res.status(200).json({ msg: 'Thông tin đã được cập nhật!' });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin người dùng!' });
    }
    // console.log(updateInfomation);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View check note
router.get(`/check/:id/note`, async (req, res) => {
  try {
    const { id } = req.params;
    const checkNote = await pool.query(
      `SELECT note FROM "check" WHERE id = $1`,
      [id]
    );
    res.status(200).json(checkNote.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

// Add check note
router.put(`/check/:id/note`, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (req.session.user) {
      const updateInfomation = await pool.query(
        `UPDATE "check" SET note = $1, updaterId = $2, updateTime = CURRENT_TIMESTAMP WHERE id = $3`,
        [note, req.session.user.id, id]
      );
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin người dùng!' });
    }

    res.status(200).json({ msg: 'Đã cập nhật thông tin' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//GET specialrequest list
router.get(`/view/specialrequest/:itemid`, async (req, res) => {
  try {
    const { itemid } = req.params;
    const specialRequestList = await pool.query(
      `
    SELECT S.id, S.name
    FROM item AS I
    JOIN specialrequest AS S
    ON I.majorgroupid = S.majorgroupid
    WHERE I.status = 'ACTIVE' AND S.status = 'ACTIVE' AND I.id = $1    
    `,
      [itemid]
    );
    res.status(200).json(specialRequestList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//SEND ORDER
router.post(
  '/check/add',
  isCheckActive,
  isAllItemInStock,
  updateRunningSince,
  async (req, res) => {
    try {
      const { checkid, itemlist } = req.body;
      for (var i = 0; i < itemlist.length; i++) {
        var detail = itemlist[i];
        var checkDetailId = await pool.query(
          `INSERT INTO checkdetail(checkid,itemid,itemprice,quantity,subtotal,taxamount,amount,note,isreminded,status) 
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,false,'WAITING') RETURNING id`,
          [
            checkid,
            detail.itemId,
            detail.itemPrice,
            detail.quantity,
            detail.subtotal,
            detail.taxAmount,
            detail.amount,
            detail.note,
          ]
        );
        for (var x = 0; x < detail.specialRequestList.length; x++) {
          var detailSpecialRequest = await pool.query(
            `INSERT INTO checkitemspecialrequest(checkDetailId,specialRequestId) VALUES($1,$2)`,
            [
              checkDetailId.rows[0].id,
              detail.specialRequestList[x].specialRequestId,
            ]
          );
        }
      }

      const newCheckValue = await pool.query(
        `
      SELECT SUM(D.subtotal) AS subtotal, SUM(D.taxamount) AS taxamount, SUM(D.amount) AS totalamount
      FROM checkdetail AS D
      JOIN "check" AS C
      ON D.checkid = C.id
      WHERE C.id = $1;
      `,
        [checkid]
      );
      if (newCheckValue.rows) {
        const updateCheckValue = await pool.query(
          `
      UPDATE "check"
      SET subtotal = $1, totaltax = $2,totalamount = $3,updaterid = $4,updatetime = CURRENT_TIMESTAMP 
      WHERE id = $5;
      `,
          [
            newCheckValue.rows[0].subtotal,
            newCheckValue.rows[0].taxamount,
            newCheckValue.rows[0].totalamount,
            req.session.user.id,
            checkid,
          ]
        );
      }

      await massViewUpdate(req, res);
      res.status(200).json();
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  }
);

//GET menu item list
router.get('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    var getMenuItems = {};
    if (id && id != 0) {
      getMenuItems = await pool.query(
        `
      SELECT M.id AS menuitemid,I.id, I.name,I.majorGroupId, I.image, M.price, I.id NOT IN (SELECT itemid AS id FROM itemoutofstock) AS inStock
      FROM menuitem AS M
      JOIN item AS I
      ON M.itemid = I.id
      WHERE I.status = 'ACTIVE' AND M.menuid = $1
      `,
        [id]
      );
    } else {
      getMenuItems = await pool.query(`
      SELECT M.id AS menuitemid,I.id, I.name, I.majorgroupid, I.image, M.price, I.id NOT IN (SELECT itemid AS id FROM itemoutofstock) AS inStock
      FROM menuitem AS M
      JOIN item AS I
      ON M.itemid = I.id
      WHERE I.status = 'ACTIVE'
      `);
    }
    res.status(200).json(getMenuItems.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/majorgroup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    var getMenuItems = {};
    if (id && id != 0) {
      getMenuItems = await pool.query(
        `
      SELECT M.id AS menuitemid,I.id, I.name, I.majorgroupid, I.image, M.price
      FROM menuitem AS M
      JOIN item AS I
      ON M.itemid = I.id
      JOIN majorgroup AS G
      ON G.id = I.majorgroupid
      WHERE I.status = 'ACTIVE' AND G.id = $1
      `,
        [id]
      );
    } else {
      getMenuItems = await pool.query(`
      SELECT M.id AS menuitemid,I.id, I.name, I.majorgroupid, I.image, M.price
      FROM menuitem AS M
      JOIN item AS I
      ON M.itemid = I.id
      JOIN majorgroup AS G
      ON G.id = I.majorgroupid
      WHERE I.status = 'ACTIVE'
      `);
    }
    res.status(200).json(getMenuItems.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Gửi order reminder
router.put('/detail/:id/remind', async (req, res) => {
  try {
    const { id } = req.params;
    const remind = await pool.query(
      `UPDATE checkdetail SET isReminded = true WHERE id=$1 AND status = 'WAITING'`,
      [id]
    );
    await kitchenUpdate(req, res);
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//void check
router.put(`/check/void`, async (req, res) => {
  try {
    const { id } = req.body;
    if (req.session.user) {
      const voidCheck = await pool.query(
        `UPDATE "check" SET status = 'VOID', updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
        [req.session.user.id, id]
      );

      const voidCheckDetail = await pool.query(
        `UPDATE "checkdetail" SET status = 'VOID' WHERE checkid = $1`,
        [id]
      );
      if (req.session.tableid) {
        const updateTable = await pool.query(
          `UPDATE "table" SET status = 'NOT_USE' WHERE id = $1 AND status = 'IN_USE'`,
          [req.session.tableid]
        );
      }
      await massViewUpdate(req, res);
      res.status(200).json({ msg: 'Đã hủy check' });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin người dùng!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//void checkdetail
router.put(`/checkdetail/:id/void`, async (req, res) => {
  try {
    const { id } = req.params;
    const voidcheckdetail = await pool.query(
      `UPDATE "checkdetail" SET status = 'VOID' WHERE id = $1 RETURNING checkid`,
      [id]
    );
    if (req.session.user) {
      const updateCheck = await pool.query(
        `UPDATE "check" SET updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
        [req.session.user.id, voidcheckdetail.rows[0].checkid]
      );
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin người dùng!' });
    }

    await massViewUpdate(req, res);
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/paymentmethod', async (req, res) => {
  try {
    const list = await pool.query(
      `SELECT id,name from paymentmethod WHERE status='ACTIVE';`
    );
    res.status(200).json(list.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.post('/check/process', async (req, res) => {
  try {
    const { checkid, paymentlist, detaillist } = req.body;
    const billno = await helpers.randomBillString(8);
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
          FROM checkitemspecialrequest AS CSP
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

router.post('/check/refund', async (req, res) => {
  try {
    const { checkid } = req.body;
    const billno = await helpers.randomBillString(8);
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

        const detaillist = await pool.query(
          ` 
        SELECT D.itemid, I.name AS itemname, D.itemprice, D.quantity, (D.subtotal * -1) AS subtotal, (D.taxamount *-1) AS taxamount,(D.amount * -1) AS amount
        FROM checkdetail AS D
        JOIN item AS I
        ON D.itemid = I.id
        WHERE D.checkid = $1 AND D.status != 'VOID';
        `,
          [checkid]
        );

        for (var x = 0; x < detaillist.rows.length; x++) {
          var detail = await pool.query(
            `
            INSERT INTO billdetail(billid,itemid,itemname,itemprice,quantity,subtotal,taxamount,amount) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
          `,
            [
              createBill.rows[0].id,
              detaillist.rows[x].itemid,
              detaillist.rows[x].itemname,
              detaillist.rows[x].itemprice,
              detaillist.rows[x].quantity,
              detaillist.rows[x].subtotal,
              detaillist.rows[x].taxamount,
              detaillist.rows[x].amount,
            ]
          );
        }
        res.status(200).json({ msg: 'Hoàn tiền thành công' });
      } else {
        res.status(400).json({ msg: 'Không thể xử lý hóa đơn' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
