const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');
const _ = require('lodash');
const helpers = require('../utils/helpers');
//Get locations
async function isFirstTableInUse(req, res, next) {
  try {
    const { id1 } = req.params;
    const tableStatus = await pool.query(
      `SELECT status FROM "table" WHERE id = $1`,
      [id1]
    );
    if (tableStatus.rows[0]) {
      if (tableStatus.rows[0].status == sob.IN_USE) {
        const tableCheck = await pool.query(
          `SELECT id FROM "check" WHERE tableId = $1 AND status = 'ACTIVE' LIMIT 1`,
          [id1]
        );
        if (tableCheck.rows[0]) {
          next();
        } else {
          res.status(400).json({ msg: 'Bàn không còn check!' });
        }
      } else {
        res.status(400).json({ msg: 'Bàn hiện không hoạt động!' });
      }
    } else {
      res.status(400).json({ msg: 'Không tìm được bàn!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function isSecondTableInUse(req, res, next) {
  try {
    const { id2 } = req.params;
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
      res.status(400).json({ msg: 'Không tìm được bàn!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function createCheck(req, res, next) {
  try {
    const { id2 } = req.params;
    const shiftId = req.session.shiftId;
    const accountId = req.session.user.id;
    const checkno = await helpers.randomCheckString(8);
    const createCheck = await pool.query(
      `INSERT INTO "check"(shiftid,accountId,tableid,checkno,subtotal,totaltax,totalamount,creatorid,creationtime,runningsince,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'ACTIVE') RETURNING id;`,
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
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

router.get('/', async (req, res) => {
  try {
    const locations = await pool.query(
      `SELECT id as locationId, name FROM "location" WHERE status != 'INACTIVE'`
    );
    res.status(200).json(locations.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//join a location and View location’s table
router.get('/location/:id', async (req, res) => {
  try {
    const { id } = req.params;
    req.session.locationid = id;
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
      if (tables.rows) {
        res.status(200).json({
          locationId: id,
          tables: tables.rows,
        });
      } else {
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
      }
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
      if (tables.rows) {
        res.status(200).json({
          locationId: id,
          tables: tables.rows,
        });
      } else {
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Get check detail from table;
router.get(
  `/table1/:id1/table2/:id2`,
  isFirstTableInUse,
  isSecondTableInUse,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;

      const table1Check = await pool.query(
        `SELECT id FROM "check" WHERE tableId = $1 AND status = 'ACTIVE' LIMIT 1`,
        [id1]
      );

      const table2Check = await pool.query(
        `SELECT id FROM "check" WHERE tableId = $1 AND status = 'ACTIVE' LIMIT 1`,
        [id2]
      );

      const checkDetail = await pool.query(
        `
      SELECT D.id, I.name, D.quantity, D.amount, D.status
      FROM "table" AS T
      JOIN "check" AS C
      ON T.id = C.tableid
      JOIN checkdetail AS D
      ON D.checkid = C.id
      JOIN item AS I
      ON I.id = D.itemid
      WHERE T.status = 'IN_USE' AND C.status = 'ACTIVE' AND (D.status != 'VOID' AND D.status != 'RECALL') AND T.id = $1;
      `,
        [id1]
      );
      const table1CheckWithDetail = _.merge(table1Check.rows[0], {
        checkdetail: checkDetail.rows,
      });
      res
        .status(200)
        .json({ table1: table1CheckWithDetail, table2: table2Check.rows[0] });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  }
);

//transfer check detail
router.put('/checkdetail/transfer', async (req, res) => {
  try {
    const { id, checkdetaillist } = req.body;
    for (var i = 0; i < checkdetaillist.length; i++) {
      var transferCheckDetail = await pool.query(
        `UPDATE checkdetail SET checkid = $1 WHERE id = $2 RETURNING checkid`,
        [id, checkdetaillist[i].id]
      );
    }
    if (req.session.user) {
      const updateCheck = await pool.query(
        `UPDATE "check" SET updaterId = $1, updateTime = CURRENT_TIMESTAMP WHERE id = $2`,
        [req.session.user.id, transferCheckDetail.rows[0].checkid]
      );
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin người dùng!' });
    }
    // await massViewUpdate();
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
