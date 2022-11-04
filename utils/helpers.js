const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const _ = require('lodash');
const pool = require('../db');

const checkNoString = async () => {
  var result = '';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0').slice(-2);
  const day = date.getDate().toString().padStart(2, '0').slice(-2);
  var result = [year, month, day].join('');
  try {
    const totalCheck = await pool.query(
      `SELECT COUNT(id) FROM "check" WHERE creationTime::date = CURRENT_DATE`
    );
    var total = parseInt(totalCheck.rows[0].count);
    if (total == 0) {
      total = 1;
    } else {
      total = total + 1;
    }
    total = total.toString();
    if (total.length == 1) {
      total = total.padStart(2, '0').slice(-2);
    }

    result = result.concat(total);
  } catch (error) {
    console.log(error);
  }
  return result;
};

const billNoString = async () => {
  var result = '';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0').slice(-2);
  const day = date.getDate().toString().padStart(2, '0').slice(-2);
  var result = [year, month, day].join('');
  try {
    const totalCheck = await pool.query(
      `SELECT COUNT(id) FROM "bill" WHERE creationTime::date = CURRENT_DATE`
    );
    var total = parseInt(totalCheck.rows[0].count);
    if (total == 0) {
      total = 1;
    } else {
      total = total + 1;
    }
    total = total.toString();
    if (total.length == 1) {
      total = total.padStart(2, '0').slice(-2);
    }

    result = result.concat(total);
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
      return tables.rows;
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
      return tables.rows;
    }
  } catch (error) {
    console.log(error);
  }
};

const updateKitchen = async () => {
  try {
    const checkList = await pool.query(`
    SELECT C.id AS checkid, C.checkno, L.id AS locationid, D.runningsince
    FROM "check" AS C
    JOIN (SELECT checkid,MIN(starttime)::time AS runningsince FROM checkdetail WHERE status = 'WAITING' GROUP BY checkid) AS D
    ON C.id = D.checkid
    JOIN "table" AS T
    ON T.id = C.tableid
    JOIN "location" AS L
    ON L.id = T.locationid
    WHERE C.status = 'ACTIVE'
    GROUP BY C.id , T.name, L.id, D.runningsince;
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
       WHERE D.status != 'VOID' AND D.status = 'WAITING' AND C.id = $1
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
    console.log({ checkInfo });
    return { checkInfo };
  } catch (error) {
    console.log(error);
  }
};

const printBillDetailList = async (detailList) => {
  try {
    var itemidList = [];
    var finaldetail = [];
    for (var i = 0; i < detailList.length; i++) {
      if (
        !itemidList.some(
          (x) =>
            x.itemid === detailList[i].itemid &&
            x.itemprice === detailList[i].itemprice
        )
      ) {
        itemidList.push({
          itemid: detailList[i].itemid,
          itemname: detailList[i].itemname,
          itemprice: detailList[i].itemprice,
        });
      }
    }
    var tempdetail = {
      itemid: '',
      itemname: '',
      itemprice: 0,
      quantity: 0,
      subtotal: 0,
      taxamount: 0,
      amount: 0,
    };
    for (var x = 0; x < itemidList.length; x++) {
      tempdetail = {
        itemid: null,
        itemname: null,
        itemprice: 0,
        quantity: 0,
        subtotal: 0,
        taxamount: 0,
        amount: 0,
      };
      tempdetail.itemid = itemidList[x].itemid;
      tempdetail.itemname = itemidList[x].itemname;
      tempdetail.itemprice = itemidList[x].itemprice;
      if (tempdetail.itemprice == null) {
        tempdetail.itemprice = 0;
      }
      if (tempdetail.itemname == null) {
        tempdetail.itemname = '';
      }
      if (tempdetail.itemid != null && tempdetail.itemname != null) {
        for (var j = 0; j < detailList.length; j++) {
          if (tempdetail.itemid == detailList[j].itemid) {
            tempdetail.quantity = tempdetail.quantity + detailList[j].quantity;
            tempdetail.subtotal = tempdetail.subtotal + detailList[j].subtotal;
            tempdetail.taxamount =
              tempdetail.taxamount + detailList[j].taxamount;
            tempdetail.amount = tempdetail.amount + detailList[j].amount;
          }
        }
        finaldetail.push(tempdetail);
      }
    }
    return finaldetail;
  } catch (error) {
    console.log(error);
    return finaldetail;
  }
};

module.exports = {
  hashPassword,
  errorMsgHandler,
  validatePassword,
  checkNoString,
  billNoString,
  updateTableOverview,
  updateKitchen,
  printBillDetailList,
};
