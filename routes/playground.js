const { Router } = require('express');
const router = Router();
const helper = require('../utils/helpers');
const pool = require('./../db');
const { request } = require('./kitchen');

const randomstring = require('randomstring');

// router.post('/create', async (req, res) => {
//   try {
//     const { username, password, fullname, email, phone, status } = req.body;

//     const hashedPassword = await helper.hashPassword(password);

//     const createUser = await pool.query(
//       'INSERT INTO account(username,password,fullname,email,phone,status,roleid) VALUES($1,$2,$3,$4,$5,$6,(SELECT id FROM account WHERE name = ADMIN ))',
//       [username, hashedPassword, fullname, email, phone, status]
//     );
//     console.log(createUser);
//     res.status(200).json({ msg: 'New user created' });
//   } catch (error) {
//     console.log(error);
//   }
// });

// router.get('/forcast', (req, res) => {
//   req.io.emit('demo', { msg: 'hello world' });
//   res.status(200).json({ msg: 'success' });
// });
// //join a room
// router.get('/location/', async (req, res) => {
//   location0 = `POS-L-0`;
//   req.io.to(location0).emit('update-view-location', 'hello world');
//   if (req.session.locationid != 0) {
//     location = `POS-L-${req.session.locationid}`;
//     req.io.to(location).emit('update-view-location', `hello ${location}`);
//   }
//   // table = `POS-T-${req.session.table}`;
//   // console.log(location );

//   // req.socket.to(table).emit('update-view-table', 'hello world table');
//   res.status(200).json();
// });

// router.get('/uuid', (req, res) => {
//   const uniqeId = randomstring.generate(8);
//   console.log(uniqeId);
//   res.status(200).json({ msg: 'success' });
// });

// router.put('/process/check/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const checkdetail = await pool.query(
//       `SELECT D.id, I.name AS itemname, D.itemid,D.itemprice, D.quantity, D.subtotal, D.taxamount, D.amount
//       FROM "checkdetail" AS D
//       JOIN "item" AS I
//       ON D.itemid = I.id
//       WHERE D.status != 'VOID' AND D.status = 'SERVED' AND D.checkid = $1`,
//       [id]
//     );
//     var detailList = checkdetail.rows;
//     var itemidList = [];

//     for (var i = 0; i < detailList.length; i++) {
//       if (
//         !itemidList.some(
//           (x) =>
//             x.itemid === detailList[i].itemid &&
//             x.itemprice === detailList[i].itemprice
//         )
//       ) {
//         itemidList.push({
//           itemid: detailList[i].itemid,
//           itemname: detailList[i].itemname,
//           itemprice: detailList[i].itemprice,
//         });
//       }
//     }
//     var finaldetail = [];
//     var tempdetail = {
//       itemid: '',
//       itemname: '',
//       itemprice: 0,
//       quantity: 0,
//       subtotal: 0,
//       taxamount: 0,
//       amount: 0,
//     };
//     for (var x = 0; x < itemidList.length; x++) {
//       tempdetail = {
//         itemid: null,
//         itemname: null,
//         itemprice: 0,
//         quantity: 0,
//         subtotal: 0,
//         taxamount: 0,
//         amount: 0,
//       };

//       tempdetail.itemid = itemidList[x].itemid;
//       tempdetail.itemname = itemidList[x].itemname;
//       tempdetail.itemprice = itemidList[x].itemprice;
//       if (tempdetail.itemprice == null) {
//         tempdetail.itemprice = 0;
//       }
//       if (tempdetail.itemid != null && tempdetail.itemname != null) {
//         for (var j = 0; j < detailList.length; j++) {
//           if (tempdetail.itemid == detailList[j].itemid) {
//             tempdetail.quantity = tempdetail.quantity + detailList[j].quantity;
//             tempdetail.subtotal = tempdetail.subtotal + detailList[j].subtotal;
//             tempdetail.taxamount =
//               tempdetail.taxamount + detailList[j].taxamount;
//             tempdetail.amount = tempdetail.amount + detailList[j].amount;
//           }
//         }
//         finaldetail.push(tempdetail);
//       }
//     }
//     //console.log(finaldetail);
//     res.json(finaldetail);
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ msg: 'Lỗi hệ thống' });
//   }
// });

// router.get('/avg/completiontime/', async (req, res) => {
//   try {
//     //GET total average of each check;
//     const checkAVG =
//       await pool.query(`SELECT C.id, coalesce(AVG(D.completiontime),'00:00:00') AS check_avg
//       FROM "check" AS C
//       LEFT JOIN checkdetail AS D
//       ON C.id = D.checkid
//       WHERE C.status = 'CLOSED' AND D.status = 'SERVED' AND creationtime::date = CURRENT_DATE
//       GROUP BY
//       C.id,
//       D.checkid
//       ORDER BY
//       C.id DESC;`);
//     res.status(200).json(totalcheck);
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ msg: 'Lỗi hệ thống' });
//   }
// });
const https = require('https');

router.post(`/`, async (req, res) => {
  try {
    const data = req.body;
    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (body) => {
        console.log('Body: ');
        console.log(body);
        console.log('payUrl: ');
        console.log(JSON.parse(body).payUrl);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });
  } catch (error) {}
});

module.exports = router;

// try {
//   const data = req.body;
//   const options = {
//     hostname: 'test-payment.momo.vn',
//     port: 443,
//     path: '/v2/gateway/api/create',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Content-Length': Buffer.byteLength(data),
//     },
//   };

//   const req = https.request(options, (res) => {
//     console.log(`Status: ${res.statusCode}`);
//     console.log(`Headers: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (body) => {
//       console.log('Body: ');
//       console.log(body);
//       console.log('payUrl: ');
//       console.log(JSON.parse(body).payUrl);
//     });
//     res.on('end', () => {
//       console.log('No more data in response.');
//     });
//   });
// } catch (error) {
//   console.log(error);
//   res.status(400).json({ msg: 'Lỗi hệ thống' });
// }
