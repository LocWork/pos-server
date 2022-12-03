const Router = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const helpers = require('../utils/helpers');
const sob = require('../staticObj');

async function checkRoleKitchen(req, res, next) {
  try {
    if (req.session.user.role == sob.KITCHEN) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

router.use(checkRoleKitchen);

async function massViewUpdate(id, req, res) {
  try {
    req.io
      .to('POS-L-0')
      .emit('update-pos-tableOverview', await helpers.updateTableOverview(0));

    // if (id && id != 0) {
    //   req.io
    //     .to(`POS-L-${id}`)
    //     .emit(
    //       'update-pos-tableOverview',
    //       await helpers.updateTableOverview(id)
    //     );
    // }

    req.io
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function massViewUpdateList(list, req, res) {
  try {
    req.io
      .to('POS-L-0')
      .emit('update-pos-tableOverview', await helpers.updateTableOverview(0));
    for (var i = 0; i < list.length; i++) {
      if (list[i].id && list[i].id != 0) {
        req.io
          .to(`POS-L-${list[i].id}`)
          .emit(
            'update-pos-tableOverview',
            await helpers.updateTableOverview(list[i].id)
          );
      }
    }

    req.io
      .to(`KDS-L-0`)
      .emit('update-kds-kitchen', await helpers.updateKitchen());
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//GET CHECK
router.get('/', async (req, res) => {
  try {
    const checkList = await pool.query(`
    SELECT C.id AS checkid, C.checkno, L.id AS locationid, D.runningsince::time at time zone 'utc' at time zone 'Asia/Bangkok'  AS runningsince
    FROM "check" AS C
    JOIN (SELECT checkid,MIN(starttime) AS runningsince FROM checkdetail WHERE status = 'WAITING' GROUP BY checkid) AS D
    ON C.id = D.checkid
    JOIN "table" AS T
    ON T.id = C.tableid
    JOIN "location" AS L
    ON L.id = T.locationid
    WHERE C.status = 'ACTIVE'
    GROUP BY C.id , T.name, L.id, D.runningsince
    ORDER BY D.runningsince DESC
    ;
    `);

    var checkInfo = [];
    for (var i = 0; i < checkList.rows.length; i++) {
      var checkDetailList = await pool.query(
        `
       SELECT D.id AS checkDetailId, I.name AS itemname, D.quantity, D.note, D.isReminded
       FROM "check" AS C
 	     JOIN checkdetail AS D
       ON C.id = D.checkid
       JOIN item AS I
       ON D.itemid = I.id
       WHERE D.status = 'WAITING' AND C.id = $1
       ORDER BY D.id ASC;
       `,
        [checkList.rows[i].checkid]
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
      checkInfo.push(_.merge(checkList.rows[i], { checkdetail: temp }));
    }
    res.status(200).json(checkInfo);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});
//Get menu list;
router.get('/menu', async (req, res) => {
  try {
    const getMenuList = await pool.query(
      `
      SELECT id, name, isdefault
      FROM "menu"
      WHERE status = 'ACTIVE'
      ORDER BY isDefault = 'true' DESC
      `
    );
    res.status(200).json(getMenuList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

router.get('/majorgroup', async (req, res) => {
  try {
    const getMajorGroupList = await pool.query(
      `
      SELECT id, name
      FROM "majorgroup"
      WHERE status = 'ACTIVE'
      ORDER BY id
      `
    );
    res.status(200).json(getMajorGroupList.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Get menu item list in stock;
router.get('/menu/:id/instock', async (req, res) => {
  try {
    const { id } = req.params;
    var getMenuItems = {};
    if (id && id != 0) {
      getMenuItems = await pool.query(
        `
      SELECT I.id AS itemid, I.name,I.majorGroupId, I.image
      FROM menu AS M
      JOIN menuitem AS MI
      ON MI.menuid = M.id
      JOIN item AS I
      ON MI.itemid = I.id
      WHERE I.status = 'ACTIVE' AND M.id = $1 AND I.id NOT IN (SELECT itemid AS id FROM itemoutofstock)
      `,
        [id]
      );
    } else {
      getMenuItems = await pool.query(`
      SELECT I.id AS itemid, I.name,I.majorGroupId, I.image
      FROM item AS I
      WHERE I.status = 'ACTIVE' AND I.id NOT IN (SELECT itemid AS id FROM itemoutofstock)
      `);
    }
    res.status(200).json(getMenuItems.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//view out of stock;
router.get('/menu/:id/outofstock', async (req, res) => {
  try {
    const { id } = req.params;
    var getMenuItems = {};
    if (id && id != 0) {
      getMenuItems = await pool.query(
        `
      SELECT I.id AS itemid, I.name,I.majorGroupId, I.image
      FROM menu AS M
      JOIN menuitem AS MI
      ON MI.menuid = M.id
      JOIN item AS I
      ON MI.itemid = I.id
      WHERE I.status = 'ACTIVE' AND M.id = $1 AND I.id IN (SELECT itemid AS id FROM itemoutofstock)
      `,
        [id]
      );
    } else {
      getMenuItems = await pool.query(`
      SELECT I.id AS itemid, I.name,I.majorGroupId, I.image
      FROM item AS I
      WHERE I.status = 'ACTIVE' AND I.id IN (SELECT itemid AS id FROM itemoutofstock)
      `);
    }
    res.status(200).json(getMenuItems.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//add item to out of stock
router.post('/add/outofstock/', async (req, res) => {
  try {
    const { itemlist } = req.body;
    for (var i = 0; i < itemlist.length; i++) {
      var checkitem = await pool.query(
        `SELECT itemid FROM itemoutofstock WHERE itemid = $1`,
        [itemlist[i].id]
      );
      if (checkitem.rows[0] == null) {
        var additem = await pool.query(
          `INSERT INTO itemoutofstock(itemid) VALUES($1) `,
          [itemlist[i].id]
        );
      }
    }
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Remove item from out of stock
router.delete('/remove/outofstock/', async (req, res) => {
  try {
    const { itemlist } = req.body;
    for (var i = 0; i < itemlist.length; i++) {
      var deleteitem = await pool.query(
        `DELETE FROM itemoutofstock WHERE itemid = $1`,
        [itemlist[i].id]
      );
    }
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});
router.get('/demo', async (req, res) => {
  massViewUpdate(0, req, res);
  res.status(200).json();
});

//Notify item is done ready;
router.put('/notify/ready/', async (req, res) => {
  try {
    const { detaillist } = req.body;
    var locationlist = [];
    for (var i = 0; i < detaillist.length; i++) {
      var updateDetail = await pool.query(
        `UPDATE checkdetail AS D SET status = 'READY', completiontime = (NOW() - D.starttime::time) WHERE D.id = $1`,
        [detaillist[i].detailid]
      );
      const location = await pool.query(
        `SELECT T.locationid AS id
            FROM checkdetail AS D
            JOIN "check" AS C
            ON D.checkid = C.id
            JOIN "table" AS T
            ON C.tableid = T.id
            WHERE D.id = $1
            LIMIT 1
            ;`,
        [detaillist[i].detailid]
      );
      if (!locationlist.includes(location.rows[0].id)) {
        locationlist.push(location.rows[0].id);
      }
    }
    await massViewUpdateList(locationlist, req, res);
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//notify item recall
router.put('/notify/recall/', async (req, res) => {
  try {
    const { detaillist } = req.body;
    var locationlist = [];
    for (var i = 0; i < detaillist.length; i++) {
      var updatedetail = await pool.query(
        `UPDATE checkdetail SET status = 'RECALL' WHERE id = $1`,
        [detaillist[i].detailid]
      );
      const location = await pool.query(
        `SELECT T.locationid AS id
            FROM checkdetail AS D
            JOIN "check" AS C
            ON D.checkid = C.id
            JOIN "table" AS T
            ON C.tableid = T.id
            WHERE D.id = $1
            LIMIT 1
            ;`,
        [detaillist[i].detailid]
      );
      if (!locationlist.includes(location.rows[0].id)) {
        locationlist.push(location.rows[0].id);
      }
    }
    await massViewUpdateList(locationlist, req, res);
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

module.exports = router;
