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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

router.use(checkRoleWaiterAndCashier);

async function doesTableHaveCheck(req, res, next) {
  try {
    const { id } = req.params;
    const tableCheck = await pool.query(
      `SELECT id FROM "check" WHERE tableId = $1 AND status = 'ACTIVE' LIMIT 1`,
      [id]
    );
    if (tableCheck.rows[0]) {
      const updateTable = await pool.query(
        `UPDATE "table" SET status = 'IN_USE' WHERE id = $1`,
        [id]
      );

      const getLocation = await pool.query(
        `SELECT locationid AS id
        FROM "table" 
        WHERE id = $1
        LIMIT 1
        ;`,
        [id]
      );
      await massViewUpdate(getLocation.rows[0].id, req, res);

      res.status(200).json({
        checkid: tableCheck.rows[0].id,
      });
    } else {
      next();
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
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function isFirstTableInUse(req, res, next) {
  try {
    const { id1 } = req.body;
    const info = await pool.query(
      `SELECT tableid, status from "check" where id = $1`,
      [id1]
    );
    if (info.rows[0]) {
      if (info.rows[0].status == sob.ACTIVE) {
        const tableStatus = await pool.query(
          `SELECT status FROM "table" WHERE id = $1`,
          [info.rows[0].tableid]
        );
        if (tableStatus.rows[0].status == sob.IN_USE) {
          next();
        } else {
          res.status(400).json({ msg: 'Bàn không còn hoạt động' });
        }
      } else {
        res.status(400).json({ msg: 'Bàn không còn đơn' });
      }
    } else {
      res.status(400).json({ msg: 'Không tìm được thông tin' });
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
      res.status(400).json({ msg: 'Không tìm được thông tin' });
    }
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

//GET list of location
router.get('/', async (req, res) => {
  try {
    const list = await pool.query(
      `SELECT id as locationId, name FROM "location" WHERE status != 'INACTIVE' ORDER BY id ASC`
    );
    res.status(200).json(list.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//GET location table
router.get('/location/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id != 0) {
      const tables = await pool.query(
        `SELECT T.id, T.status, T.name AS tableName,C.id as checkid ,C.totalamount, C.cover, SUM(CASE WHEN D.status = 'WAITING' THEN 1 ELSE 0 END) > 0 AS isWaiting, SUM(CASE WHEN D.status = 'READY' THEN 1 ELSE 0 END) > 0 AS isReady,SUM(CASE WHEN D.status = 'RECALL' THEN 1 ELSE 0 END) > 0 AS isRecall
        FROM "location" AS L
        LEFT JOIN "table" AS T
        ON L.id = T.locationid
        LEFT JOIN (SELECT id,tableid,totalamount,cover FROM "check" WHERE status ='ACTIVE') AS C
        ON T.id = C.tableid
        LEFT JOIN checkdetail AS D
        ON C.id = D.checkid
        WHERE T.status != 'INACTIVE' AND L.status != 'INACTIVE' AND L.id = $1
        GROUP BY
        T.id, C.totalamount, C.cover, C.id
        ORDER BY
        T.id
        ;`,
        [id]
      );
      res.status(200).json({
        tables: tables.rows,
      });
    } else {
      const tables =
        await pool.query(`SELECT T.id, T.status, T.name AS tableName,C.id as checkid ,C.totalamount, C.cover, SUM(CASE WHEN D.status = 'WAITING' THEN 1 ELSE 0 END) > 0 AS isWaiting, SUM(CASE WHEN D.status = 'READY' THEN 1 ELSE 0 END) > 0 AS isReady,SUM(CASE WHEN D.status = 'RECALL' THEN 1 ELSE 0 END) > 0 AS isRecall
        FROM "location" AS L
        LEFT JOIN "table" AS T
        ON L.id = T.locationid
        LEFT JOIN (SELECT id,tableid,totalamount,cover FROM "check" WHERE status ='ACTIVE') AS C
        ON T.id = C.tableid
        LEFT JOIN checkdetail AS D
        ON C.id = D.checkid
        WHERE T.status != 'INACTIVE' AND L.status != 'INACTIVE'
        GROUP BY
        T.id, C.totalamount, C.cover, C.id
        ORDER BY
        T.id
        ;`);
      res.status(200).json({
        tables: tables.rows,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//PUT OPEN table
router.put('/open/table/:id', doesTableHaveCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const shiftId = req.session.shiftId;
    const accountId = req.session.user.id;
    const checkno = await helpers.checkNoString();
    const validate = await pool.query(
      'SELECT id FROM "check" WHERE checkno = $1',
      [checkno]
    );
    if (validate.rows[0]) {
      res.status(400).json({
        msg: 'Lỗi hệ thống',
      });
    } else {
      const createCheck = await pool.query(
        `INSERT INTO "check"(shiftid,accountId,tableid,checkno,subtotal,totaltax,totalamount,creatorid,creationtime,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,'ACTIVE') RETURNING id;`,
        [shiftId, accountId, id, checkno, 0, 0, 0, accountId]
      );
      if (createCheck.rows[0]) {
        const updateTable = await pool.query(
          `UPDATE "table" SET status = 'IN_USE' WHERE id = $1`,
          [id]
        );

        const getLocation = await pool.query(
          `SELECT locationid AS id
        FROM "table" 
        WHERE id = $1
        LIMIT 1
        ;`,
          [id]
        );

        await massViewUpdate(getLocation.rows[0].id, req, res);

        res.status(200).json({
          checkid: createCheck.rows[0].id,
        });
      } else {
        res.status(400).json({ msg: 'Không thể tạo đơn' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Get check detail from table;
//Transfer table
router.put(
  '/transfer/table/',
  isFirstTableInUse,
  isSecondTableInUse,
  async (req, res) => {
    try {
      const { id1, id2 } = req.body;

      const info = await pool.query(
        `SELECT tableid from "check" where id = $1`,
        [id1]
      );

      const secondTableCheck = await pool.query(
        `SELECT id FROM "check" WHERE tableid = $1 AND status = 'ACTIVE' LIMIT 1`,
        [id2]
      );

      if (secondTableCheck.rows[0]) {
        const transferTable = await pool.query(
          `UPDATE checkdetail SET checkid = $1 WHERE checkid = $2`,
          [secondTableCheck.rows[0].id, id1]
        );
        const updateCheckToVoid = await pool.query(
          `UPDATE "check" SET status = 'VOID' WHERE id = $1`,
          [id1]
        );

        const newCheckValue = await pool.query(
          `
      SELECT coalesce(SUM(D.subtotal),0) AS subtotal , coalesce(SUM(D.taxamount),0) AS taxamount, coalesce(SUM(D.amount),0) AS totalamount
      FROM checkdetail AS D
      JOIN "check" AS C
      ON D.checkid = C.id AND D.status != 'VOID'
      WHERE C.id = $1;
      `,
          [secondTableCheck.rows[0].id]
        );
        if (newCheckValue.rows) {
          const updateCheckValueTable2 = await pool.query(
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
              secondTableCheck.rows[0].id,
            ]
          );

          const updateCheckValueTable1 = await pool.query(
            `
            UPDATE "check"
            SET subtotal = 0, totaltax = 0,totalamount = 0,updaterid = 0,updatetime = CURRENT_TIMESTAMP 
            WHERE id = $1;
            `,
            [id1]
          );
        }

        const updateCheck = await pool.query(
          `UPDATE "check" SET updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
          [req.session.user.id, secondTableCheck.rows[0].id]
        );

        const updateTable = await pool.query(
          `UPDATE "table" SET status ='NOT_USE' WHERE id = $1`,
          [info.rows[0].tableid]
        );

        const updatelocation = await pool.query(
          `SELECT T.locationid AS id
        FROM "check" AS C
        JOIN "table" AS T
        ON C.tableid = T.id
        WHERE C.id = $1
        LIMIT 1
        ;`,
          [secondTableCheck.rows[0].id]
        );

        await massViewUpdate(updatelocation.rows[0].id, req, res);
        res.status(200).json('Chuyển bàn thành công');
      } else {
        res.status(400).json('Không thể chuyển bàn');
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
  }
);

module.exports = router;
