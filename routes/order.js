const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const helpers = require('../utils/helpers');

async function isTableInUse(req, res, next) {
  try {
    const { id } = req.params;
    const tableStatus = await pool.query(
      `SELECT status FROM "table" WHERE id = $1`,
      [id]
    );
    if (tableStatus.rows[0].status) {
      if (tableStatus.rows[0].status == sob.IN_USE) {
        next();
      } else {
        const shiftId = req.session.shiftId;
        const waiterId = req.session.user.id;
        const checkno = await helpers.randomCheckString(8);
        const createCheck = await pool.query(
          `INSERT INTO "check"(shiftid,waiterid,tableid,checkno,subtotal,totaltax,totalamount,creatorid,creationtime,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,'ACTIVE') RETURNING id;`,
          [shiftId, waiterId, id, checkno, 0, 0, 0, waiterId]
        );
        if (createCheck.rows[0].id) {
          const updateTable = await pool.query(
            `UPDATE "table" SET status = 'IN_USE' WHERE id = $1`,
            [id]
          );
          next();
        } else {
          res.status(400).json({ msg: 'Không thể tạo đơn' });
        }
      }
    } else {
      res.status(400).json({ msg: 'Không tìm được bàn!' });
    }
  } catch (error) {
    console.log(error);
  }
}

async function updateTableOverview(id) {
  try {
    if (id != 0) {
      const tables = await pool.query(
        `SELECT T.id, T.status, T.name AS tableName, C.totalamount, C.cover, SUM(CASE WHEN D.status = 'WAITING' THEN 1 ELSE 0 END) > 0 AS isWaiting, SUM(CASE WHEN D.status = 'READY' THEN 1 ELSE 0 END) > 0 AS isReady,SUM(CASE WHEN D.status = 'RECALL' THEN 1 ELSE 0 END) > 0 AS isRecall
        FROM "location" AS L
        LEFT JOIN "table" AS T
        ON L.id = T.locationid
        LEFT JOIN (SELECT id,tableid,totalamount,cover FROM "check" WHERE status ='ACTIVE') AS C
        ON T.id = C.tableid
        LEFT JOIN checkdetail AS D
        ON C.id = D.checkid
        WHERE T.status != 'INACTIVE' AND L.status != 'INACTIVE' AND L.id = $1
        GROUP BY
        T.id, C.totalamount, C.cover
        ORDER BY
        T.id
        ;`,
        [id]
      );
      return tables.rows;
    } else {
      const tables =
        await pool.query(`SELECT T.id, T.status, T.name AS tableName, C.totalamount, C.cover, SUM(CASE WHEN D.status = 'WAITING' THEN 1 ELSE 0 END) > 0 AS isWaiting, SUM(CASE WHEN D.status = 'READY' THEN 1 ELSE 0 END) > 0 AS isReady,SUM(CASE WHEN D.status = 'RECALL' THEN 1 ELSE 0 END) > 0 AS isRecall
        FROM "location" AS L
        LEFT JOIN "table" AS T
        ON L.id = T.locationid
        LEFT JOIN (SELECT id,tableid,totalamount,cover FROM "check" WHERE status ='ACTIVE') AS C
        ON T.id = C.tableid
        LEFT JOIN checkdetail AS D
        ON C.id = D.checkid
        WHERE T.status != 'INACTIVE' AND L.status != 'INACTIVE'
        GROUP BY
        T.id, C.totalamount, C.cover
        ORDER BY
        T.id
        ;`);
      return tables.rows;
    }
  } catch (error) {
    console.log(error);
  }
}

async function updateOrder(tableid) {
  try {
    const getCheck = await pool.query(
      `SELECT C.id,C.checkno,C.subtotal,C.totalTax, C.totalamount, C.creationtime::time(0)
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.status = 'ACTIVE' AND T.status = 'IN_USE' AND T.id = $1
      LIMIT 1
      `,
      [tableid]
    );
    const getCheckDetail = await pool.query(
      `
      SELECT D.id, I.name AS itemname, D.quantity, D.amount, D.note, D.isReminded, D.status, 
      (
      SELECT STRING_AGG(S.name,', ') AS specialrequestname
      FROM checkitemspecialrequest AS CSP
      JOIN checkdetail AS D
      ON CSP.checkdetailid = D.id
      JOIN specialrequest AS S
      ON CSP.specialrequestid = S.id
      )
      FROM "check" AS C
      JOIN checkdetail AS D
      ON c.id = D.checkid
      JOIN item AS I
      ON D.itemid = I.id
      WHERE D.status != 'VOID' AND C.id = $1
      `,
      [getCheck.rows[0].id]
    );

    return { check: getCheck.rows[0], checkDetail: getCheckDetail.rows };
  } catch (error) {
    console.log(error);
  }
}

async function massViewUpdate() {
  try {
    req.io
      .to('POS-L-0')
      .emit('update-pos-tableOverview', await updateTableOverview(0));
    if (req.session.locationid && req.session.locationid != 0) {
      req.io
        .to(`POS-L-${req.session.locationid}`)
        .emit(
          'update-pos-tableOverview',
          await updateTableOverview(req.session.locationid)
        );
    }

    if (req.session.tableid && req.session.tableid != 0) {
      req.io
        .to(`POS-T-${req.session.tableid}`)
        .emit('update-pos-order', await updateOrder(req.session.tableid));
    }
  } catch (error) {
    console.log(error);
  }
}

//Get table component and check
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
      `SELECT C.id,C.checkno,C.subtotal,C.totalTax, C.totalamount, C.creationtime::time(0)
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.status = 'ACTIVE' AND T.status = 'IN_USE' AND T.id = $1
      LIMIT 1
      `,
      [id]
    );

    const getCheckDetail = await pool.query(
      `
      SELECT D.id, I.name AS itemname, D.quantity, D.amount, D.note, D.isReminded, D.status, 
      (
      SELECT STRING_AGG(S.name,', ') AS specialrequestname
      FROM checkitemspecialrequest AS CSP
      JOIN checkdetail AS D
      ON CSP.checkdetailid = D.id
      JOIN specialrequest AS S
      ON CSP.specialrequestid = S.id
      )
      FROM "check" AS C
      JOIN checkdetail AS D
      ON c.id = D.checkid
      JOIN item AS I
      ON D.itemid = I.id
      WHERE D.status != 'VOID' AND C.id = $1
      `,
      [getCheck.rows[0].id]
    );

    res.status(200).json({
      taxValue: getTax.rows[0].taxvalue,
      majorGroupList: getMajorGroupList.rows,
      menuList: getMenuList.rows,
      check: getCheck.rows[0],
      checkDetail: getCheckDetail.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Get check and check detail;
router.get('/check/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const getCheck = await pool.query(
      `SELECT C.id,C.checkno,C.subtotal,C.totalTax, C.totalamount, C.creationtime::time(0)
      FROM "check" AS C
      JOIN "table" AS T
      ON C.tableid = T.id
      WHERE C.status = 'ACTIVE' AND T.status = 'IN_USE' AND T.id = $1
      LIMIT 1
      `,
      [id]
    );

    const getCheckDetail = await pool.query(
      `
      SELECT D.id, I.name AS itemname, D.quantity, D.amount, D.note, D.isReminded, D.status, 
      (
      SELECT STRING_AGG(S.name,', ') AS specialrequestname
      FROM checkitemspecialrequest AS CSP
      JOIN checkdetail AS D
      ON CSP.checkdetailid = D.id
      JOIN specialrequest AS S
      ON CSP.specialrequestid = S.id
      )
      FROM "check" AS C
      JOIN checkdetail AS D
      ON c.id = D.checkid
      JOIN item AS I
      ON D.itemid = I.id
      WHERE D.status != 'VOID' AND C.id = $1
      `,
      [getCheck.rows[0].id]
    );

    res.status(200).json({
      check: getCheck.rows[0],
      checkDetail: getCheckDetail.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Xem thông tin về tên khách và số ghế
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

//Thêm tên và số người trên check
router.put(`/check/:id/info`, async (req, res) => {
  try {
    const { id } = req.params;
    const { guestname, cover } = req.body;
    const updateInfomation = await pool.query(
      `UPDATE "check" SET guestName = $1, cover = $2 WHERE id = $3`,
      [guestname, cover, id]
    );
    // console.log(updateInfomation);
    res.status(200).json({ msg: 'Đã cập nhật thông tin' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Xem check's note của khách
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

// Thêm note vào check của khách
router.put(`/check/:id/note`, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const updateInfomation = await pool.query(
      `UPDATE "check" SET note = $1 WHERE id = $2`,
      [note, id]
    );
    res.status(200).json({ msg: 'Đã cập nhật thông tin' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Xem thông tin của special request để add vào item;
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

//Thêm item và item detail vào check;
router.post('/check/:checkid/add', async (req, res) => {
  try {
    const { checkid } = req.params;
    for (var i = 0; i < req.body.length; i++) {
      var detail = req.body[i];
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
    await massViewUpdate();
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Lấy item từ menu list
router.get('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    var getMenuItems = {};
    if (id && id != 0) {
      getMenuItems = await pool.query(
        `
      SELECT M.id AS menuitemid,I.id, I.name,I.majorGroupId, I.image, M.price
      FROM menuitem AS M
      JOIN item AS I
      ON M.itemid = I.id
      WHERE I.status = 'ACTIVE' AND M.menuid = $1
      `,
        [id]
      );
    } else {
      getMenuItems = await pool.query(`
      SELECT M.id AS menuitemid,I.id, I.name, I.majorgroupid, I.image, M.price
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

//Gửi order reminder: chưa có KDS
// router.put(
//   '/location/:locationid/check/detail/:detailid/remind',
//   async (req, res) => {
//     try {
//       const { locationid, detailid } = req.params;
//       const remind = await pool.query(
//         `UPDATE checkdetail SET isReminded = true WHERE id=$1`,
//         [detailid]
//       );
//       res.status(200).json();
//     } catch (error) {
//       console.log(error);
//       res.status(400).json({ msg: 'Lỗi hệ thống!' });
//     }
//   }
// );

//void check
router.put(`/check/:id/void`, async (req, res) => {
  try {
    const { id } = req.params;
    const voidcheck = await pool.query(
      `UPDATE "check" SET status = 'VOID' WHERE id = $1`,
      [id]
    );

    const voidcheckdetail = await pool.query(
      `UPDATE "checkdetail" SET status = 'VOID' WHERE checkid = $1`,
      [id]
    );
    if (req.session.tableid) {
      const updateTable = await pool.query(
        `UPDATE "table" SET status = 'NOT_USE' WHERE id = $1 AND status = 'IN_USE'`,
        [req.session.tableid]
      );
    }
    await massViewUpdate();
    res.status(200).json();
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
      `UPDATE "checkdetail" SET status = 'VOID' WHERE id = $1`,
      [id]
    );
    await massViewUpdate();
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;

// router.delete('/table/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const checkdetail = await pool.query(
//       `SELECT id FROM "check" WHERE tableid = $1 AND status = 'ACTIVE' LIMIT 1`,
//       [id]
//     );
//     if (checkdetail.rows[0].id) {
//       const deleteCheck = await pool.query(`DELETE FROM "check" where table`, [
//         checkdetail.rows[0].id,
//       ]);
//       const closeTable = await pool.query(
//         `UPDATE "table" SET status = 'NOT_USE' WHERE id=$1`,
//         [id]
//       );
//       res.status(200).json();
//     } else {
//       res.status(400).json({ msg: 'Không thể đóng bàn!' });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ msg: 'Lỗi hệ thống!' });
//   }
// });

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

// View guest check
// router.get('/check/:id/menu/:menuid/', async (req, res) => {
//   try {
//     const { id, menuid } = req.params;

//     //check
//     const getCheck = await pool.query(
//       `SELECT id,checkno,subtotal,totalTax, totalamount, creationtime::time(0)
//       FROM "check"
//       WHERE status = 'ACTIVE' AND id = $1
//       `,
//       [id]
//     );
//     //checkdetail
//     const getCheckDetail = await pool.query(
//       `
//       SELECT D.id, I.name AS itemname, D.quantity, D.amount, D.note, D.isReminded, D.status,
//       (
//       SELECT STRING_AGG(S.name,', ') AS specialrequestname
//       FROM checkitemspecialrequest AS CSP
//       JOIN checkdetail AS D
//       ON CSP.checkdetailid = D.id
//       JOIN specialrequest AS S
//       ON CSP.specialrequestid = S.id
//       )
//       FROM "check" AS C
//       JOIN checkdetail AS D
//       ON c.id = D.checkid
//       JOIN item AS I
//       ON D.itemid = I.id
//       WHERE D.status != 'VOID' AND C.id = $1
//       `,
//       [id]
//     );

//     getMenuItems = {};
//     if (menuid != 0) {
//       getMenuItems = await pool.query(
//         `
//       SELECT M.id AS menuitemid, I.name,I.majorGroupId, I.image, M.price
//       FROM menuitem AS M
//       JOIN item AS I
//       ON M.itemid = I.id
//       WHERE I.status = 'ACTIVE' AND M.menuid = $1
//       `,
//         [menuid]
//       );
//     } else {
//       getMenuItems = await pool.query(`
//       SELECT M.id AS menuitemid, I.name, I.image, M.price
//       FROM menuitem AS M
//       JOIN item AS I
//       ON M.itemid = I.id
//       WHERE I.status = 'ACTIVE'
//       `);
//     }
//     res.status(200).json({
//       menuid,
//       taxValue: getTax.rows[0].taxvalue,
//       check: getCheck.rows[0],
//       checkDetail: getCheckDetail.rows,
//       majorGroupList: getMajorGroupList.rows,
//       menuList: getMenuList.rows,
//       menuItems: getMenuItems.rows,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ msg: 'Lỗi hệ thống!' });
//   }
// });

// router.post('/check/create', isTableInUse, async (req, res) => {
//   try {
//     const shiftId = req.session.shiftId;
//     const { id } = req.body;
//     const waiterId = req.session.user.id;

//     const checkno = await helpers.randomCheckString(8);
//     const createCheck = await pool.query(
//       `INSERT INTO "check"(shiftid,waiterid,tableid,checkno,subtotal,totaltax,totalamount,creatorid,creationtime,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,'ACTIVE') RETURNING id;`,
//       [shiftId, waiterId, id, checkno, 0, 0, 0, waiterId]
//     );
//     if (createCheck.rows[0]) {
//       const updateTable = await pool.query(
//         `UPDATE "table" SET status = 'IN_USE' WHERE id = $1`,
//         [id]
//       );
//       res.status(200).json(createCheck.rows[0]);
//     } else {
//       res.status(400).json({ msg: 'Không thể tạo đơn' });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ msg: 'Lỗi hệ thống!' });
//   }
// });
