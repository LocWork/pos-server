const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const helpers = require('../utils/helpers');
const _ = require('lodash');

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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//router.use(checkRoleWaiterAndCashier);

async function isCheckActiveToVoid(req, res, next) {
  try {
    const { id } = req.params;
    const check = await pool.query(
      `SELECT id from "check" WHERE id = $1 AND status = 'ACTIVE'`,
      [id]
    );
    if (check.rows[0]) {
      next();
    } else {
      res.status(400).json({ msg: 'Không thể cập nhật' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
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
      res.status(400).json({ msg: 'Không thể cập nhật ' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
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

async function overViewUpdate(currentLocationId, req, res) {
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
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function kitchenUpdate(req, res) {
  try {
    req.io
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function isAllItemInStock(req, res, next) {
  try {
    var name = '';
    var flag = true;
    for (var i = 0; i < req.body.itemlist.length; i++) {
      var detail = req.body.itemlist[i];
      var itemCheck = await pool.query(
        `SELECT S.id , I.name 
        FROM itemOutOfStock AS S 
        JOIN item AS I
        ON I.id = S.itemid
        WHERE S.itemid = $1`,
        [detail.itemid]
      );
      if (itemCheck.rows[0]) {
        name = itemCheck.rows[0].name;
        flag = false;
      }
    }
    if (flag) {
      next();
    } else {
      res.status(400).json({ msg: `Món ${name} đã hết hàng` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

router.get('/voidreason/', async (req, res) => {
  try {
    const voidReasonList = await pool.query(
      `
      SELECT id, name
      FROM voidReason
      WHERE status = 'ACTIVE'
      ORDER BY id ASC
      `
    );
    res.status(200).json(voidReasonList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Get TAX value
router.get('/taxvalue/', async (req, res) => {
  try {
    const taxValue = await pool.query(
      `SELECT COALESCE(taxValue,0) AS taxvalue  FROM systemsetting LIMIT 1`
    );
    if (taxValue.rows[0]) {
      res.status(200).json(taxValue.rows[0]);
    } else {
      res.status(200).json({ taxvalue: 0 });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Get Major group
router.get('/majorgroup/', async (req, res) => {
  try {
    const majorGroupList = await pool.query(
      `
      SELECT id, name
      FROM majorgroup
      WHERE status = 'ACTIVE'
      ORDER BY id ASC
      `
    );
    res.status(200).json(majorGroupList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Get Menu list (compoment)
router.get('/menu/', async (req, res) => {
  try {
    const menuList = await pool.query(
      `
      SELECT id, name, isdefault
      FROM "menu"
      WHERE status = 'ACTIVE'
      ORDER BY isDefault = 'true' DESC
      `
    );
    res.status(200).json(menuList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Get check and check detail
router.get('/check/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query(
      `SELECT C.id AS checkid,C.checkno,C.subtotal,C.totalTax, C.totalamount, C.creationtime::timestamp at time zone 'utc' at time zone 'Asia/Bangkok' AS creationtime, L.id AS locationid, T.id AS tableid
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      JOIN "location" AS L
      ON L.id = T.locationid
      WHERE C.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (check.rows[0]) {
      var checkInfo = [];

      for (var i = 0; i < check.rows.length; i++) {
        var checkDetailList = await pool.query(
          `
       SELECT D.id AS checkDetailId, I.name AS itemname, I.id AS itemid, D.quantity, D.note, D.isReminded, D.subtotal, D.status
       FROM "check" AS C
 	     JOIN checkdetail AS D
       ON C.id = D.checkid
       JOIN item AS I
       ON D.itemid = I.id
       WHERE D.status != 'VOID' AND C.id = $1
       ORDER BY D.id ASC;
       `,
          [check.rows[0].checkid]
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
      checkInfo = _.merge(check.rows[0], { checkdetail: temp });
      res.status(200).json({ check: checkInfo });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View guestname and cover
router.get(`/check/:id/info`, async (req, res) => {
  try {
    const { id } = req.params;
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
    const updateInfomation = await pool.query(
      `UPDATE "check" SET guestName = $1, cover = $2, updaterId = $3, updateTime = CURRENT_TIMESTAMP  WHERE id = $4`,
      [guestname, cover, req.session.user.id, id]
    );

    const updatelocation = await pool.query(
      `SELECT T.locationid AS id
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.id = $1
      LIMIT 1
      ;`,
      [id]
    );
    await overViewUpdate(updatelocation.rows[0].id, req, res);
    res.status(200).json({ msg: 'Đã cập nhật!' });
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
    const updateInfomation = await pool.query(
      `UPDATE "check" SET note = $1, updaterId = $2, updateTime = CURRENT_TIMESTAMP WHERE id = $3`,
      [note, req.session.user.id, id]
    );
    res.status(200).json({ msg: 'Đã cập nhật!' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get(`/view/item/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const getItems = await pool.query(
      `
      SELECT I.id, I.name, I.image, M.price
      FROM menuitem AS M
      JOIN item AS I
      ON M.itemid = I.id
      WHERE I.id = $1 AND I.status != 'INACTIVE'
      `,
      [id]
    );
    if (getItems.rows[0]) {
      res.status(200).json({ item: getItems.rows[0] });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
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
    res.status(200).json({
      specialrequest: specialRequestList.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//POST SEND ORDER
router.post('/check/add', isCheckActive, isAllItemInStock, async (req, res) => {
  try {
    const { checkid, itemlist } = req.body;
    for (var i = 0; i < itemlist.length; i++) {
      var detail = itemlist[i];
      var checkDetailId = await pool.query(
        `INSERT INTO checkdetail(checkid,itemid,itemprice,quantity,subtotal,taxamount,amount,note,isreminded,status,starttime) 
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,false,'WAITING',CURRENT_TIMESTAMP::time) RETURNING id`,
        [
          checkid,
          detail.itemid,
          detail.itemprice,
          detail.quantity,
          detail.subtotal,
          detail.taxamount,
          detail.amount,
          detail.note,
        ]
      );
      for (var x = 0; x < detail.specialrequestlist.length; x++) {
        var detailSpecialRequest = await pool.query(
          `INSERT INTO checkdetailspecialrequest(checkDetailId,specialRequestId) VALUES($1,$2)`,
          [
            checkDetailId.rows[0].id,
            detail.specialrequestlist[x].specialrequestid,
          ]
        );
      }
    }

    const newCheckValue = await pool.query(
      `
      SELECT coalesce(SUM(D.subtotal),0) AS subtotal , coalesce(SUM(D.taxamount),0) AS taxamount, coalesce(SUM(D.amount),0) AS totalamount
      FROM checkdetail AS D
      JOIN "check" AS C
      ON D.checkid = C.id AND D.status != 'VOID'
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

    const updatelocation = await pool.query(
      `SELECT T.locationid AS id
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.id = $1
      LIMIT 1
      ;`,
      [checkid]
    );

    await massViewUpdate(updatelocation.rows[0].id, req, res);
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//void check
router.put(`/check/:id/void`, isCheckActiveToVoid, async (req, res) => {
  try {
    const { id } = req.params;
    const { voidid } = req.body;
    const voidCheck = await pool.query(
      `UPDATE "check" SET status = 'VOID', updaterId = $1, voidreasonid = $2,updateTime = CURRENT_TIMESTAMP WHERE id = $3`,
      [req.session.user.id, voidid, id]
    );

    const voidCheckDetail = await pool.query(
      `UPDATE "checkdetail" SET status = 'VOID', voidreasonid = $1 WHERE checkid = $2`,
      [voidid, id]
    );

    const check = await pool.query(
      `Select tableid from "check" where id = $1`,
      [id]
    );

    const newCheckValue = await pool.query(
      `
      SELECT coalesce(SUM(D.subtotal),0) AS subtotal , coalesce(SUM(D.taxamount),0) AS taxamount, coalesce(SUM(D.amount),0) AS totalamount
      FROM checkdetail AS D
      JOIN "check" AS C
      ON D.checkid = C.id AND D.status != 'VOID'
      WHERE C.id = $1;
      `,
      [id]
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
          id,
        ]
      );
    }

    if (check.rows[0]) {
      const updateTable = await pool.query(
        `UPDATE "table" SET status = 'NOT_USE' WHERE id = $1 AND status = 'IN_USE'`,
        [check.rows[0].tableid]
      );
    }

    const updatelocation = await pool.query(
      `SELECT T.locationid AS id
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.id = $1
      LIMIT 1
      ;`,
      [id]
    );
    await massViewUpdate(updatelocation.rows[0].id, req, res);

    res.status(200).json({ msg: 'Đã hủy đơn' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//void checkdetail
router.put(`/checkdetail/:id/void`, async (req, res) => {
  try {
    const { id } = req.params;
    const { voidid } = req.body;
    const check = await pool.query(
      `SELECT checkid FROM "checkdetail" WHERE id = $1`,
      [id]
    );
    if (check.rows[0]) {
      const voidCheckDetail = await pool.query(
        `UPDATE "checkdetail" SET status = 'VOID', voidreasonid = $1 WHERE id = $2 RETURNING checkid`,
        [voidid, id]
      );

      const newCheckValue = await pool.query(
        `
      SELECT coalesce(SUM(D.subtotal),0) AS subtotal , coalesce(SUM(D.taxamount),0) AS taxamount, coalesce(SUM(D.amount),0) AS totalamount
      FROM checkdetail AS D
      JOIN "check" AS C
      ON D.checkid = C.id AND D.status != 'VOID'
      WHERE C.id = $1;
      `,
        [check.rows[0].checkid]
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
            check.rows[0].checkid,
          ]
        );
      }

      const updateCheck = await pool.query(
        `UPDATE "check" SET updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
        [req.session.user.id, check.rows[0].checkid]
      );

      const updatelocation = await pool.query(
        `SELECT T.locationid AS id
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.id = $1
      LIMIT 1
      ;`,
        [check.rows[0].checkid]
      );

      await massViewUpdate(updatelocation.rows[0].id, req, res);
      res.status(200).json();
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//GET payment method list
router.get('/paymentmethod', async (req, res) => {
  try {
    const list = await pool.query(
      `SELECT id,name from paymentmethod WHERE status='ACTIVE';`
    );
    res.status(200).json(list.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//PUT Serve
router.put('/detail/:id/served', async (req, res) => {
  try {
    const { id } = req.params;

    const getdetail = await pool.query(
      'SELECT status FROM checkdetail WHERE id = $1',
      [id]
    );

    if (getdetail.rows[0]) {
      if (getdetail.rows[0].status == sob.READY) {
        const updateCheckDetail = await pool.query(
          `UPDATE checkdetail SET status = 'SERVED' WHERE id = $1`,
          [id]
        );
        const updatelocation = await pool.query(
          `SELECT T.locationid AS id
          FROM checkdetail AS D
          JOIN "check" AS C
          ON D.checkid = C.id
          JOIN "table" AS T
          ON C.tableid = T.id
          WHERE D.id = $1
          LIMIT 1
          ;`,
          [id]
        );
        await overViewUpdate(updatelocation.rows[0].id, req, res);
        res.status(200).json();
      } else {
        res.status(400).json({ msg: 'Không thể cập nhật' });
      }
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

module.exports = router;
