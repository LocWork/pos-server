const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const _ = require('lodash');
const pool = require('../db');

const randomCheckString = async (size) => {
  var x = false;
  var result = '';
  try {
    do {
      result = randomstring.generate(size);
      var check = await pool.query(
        `SELECT id FROM "check" WHERE checkno = $1`,
        [result]
      );
      if (check.rows[0] == null) {
        x = true;
      }
    } while (x == false);
  } catch (error) {
    console.log(error);
  }
  return result;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

const validatePassword = async (raw, hash) => {
  const result = await bcrypt.compare(raw, hash);
  return result;
};

const errorMsgHandler = (err) => {
  console.log(err);
  let validationErrors;
  if (err) {
    validationErrors = {};
    err.forEach((error) => {
      validationErrors[error.param] = error.msg;
    });
  }
  return validationErrors;
};

const updateTableOverview = async (id) => {
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
};

const updateKitchen = async () => {
  try {
    const checkList = await pool.query(`
    SELECT id AS checkid, checkno, runningsince
    FROM "check"
    WHERE status = 'ACTIVE';
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
       WHERE D.status != 'VOID' AND C.id = $1
       ORDER BY D.id ASC;
       `,
        [checkList.rows[i].checkid]
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
      checkInfo.push(_.merge(checkList.rows[i], { checkdetail: temp }));
    }
    return checkInfo;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  hashPassword,
  errorMsgHandler,
  validatePassword,
  randomCheckString,
  updateTableOverview,
  updateKitchen,
};
