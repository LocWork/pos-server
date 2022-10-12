const { Router } = require('express');
const router = Router();
const pool = require('./../db');

router.get('/table/', async (req, res) => {
  try {
    const locations = await pool.query(
      `SELECT id, name FROM "location" WHERE status != 'INACTIVE'`
    );
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
    if (locations.rows && tables.rows) {
      res.status(200).json({ locations: locations.rows, tables: tables.rows });
    } else {
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/table/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locations = await pool.query(
      `SELECT id, name FROM "location" WHERE status != 'INACTIVE'`
    );
    if (id) {
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
      if (locations.rows && tables.rows) {
        res
          .status(200)
          .json({ locations: locations.rows, tables: tables.rows });
      } else {
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
      }
    } else {
      res.status(400).json({ msg: 'Không tìm thấy location' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.get('/table/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locations = await pool.query(
      `SELECT id, name FROM "location" WHERE status != 'INACTIVE'`
    );
    if (id) {
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
      if (locations.rows && tables.rows) {
        res
          .status(200)
          .json({ locations: locations.rows, tables: tables.rows });
      } else {
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
      }
    } else {
      res.status(400).json({ msg: 'Không tìm thấy location' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
