const { Router } = require('express');
const router = Router();
const pool = require('./../db');
const helpers = require('./../utils/helpers');
const sob = require('./.././staticObj');
const session = require('express-session');

//GET restaurant image
router.get('/', async (req, res) => {
  try {
    const logo = await pool.query(
      'SELECT restaurantImage FROM systemsetting LIMIT 1'
    );
    if (logo.rows[0]) {
      res.status(200).json(logo.rows[0]);
    } else {
      res.status(200).json({ restaurantimage: null });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Check user has session
router.get('/session', async (req, res) => {
  try {
    if (req.session.user && req.session.shiftId) {
      const currentShift = await pool.query(
        "SELECT S.id FROM shift AS S JOIN worksession AS W ON S.worksessionid = W.id WHERE S.isOpen = true AND S.status = 'ACTIVE' AND w.workdate = CURRENT_DATE LIMIT 1"
      );
      if (req.session.shiftId == currentShift.rows[0].id) {
        res.status(200).json();
      } else {
        const updateUserStatus = await pool.query(
          `Update "account" SET status = 'OFFLINE' WHERE id=$1`,
          [req.session.user.id]
        );
        req.session.destroy();
        res.status(401).json();
      }
    } else {
      res.status(401).json();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//UC LOGIN
router.post('/', async (req, res) => {
  try {
    //Get user information
    const { username, password } = req.body;

    //Check shift is open;
    const currentShift = await pool.query(
      "SELECT S.id FROM shift AS S JOIN worksession AS W ON S.worksessionid = W.id WHERE S.isOpen = true AND S.status = 'ACTIVE' AND w.workdate = CURRENT_DATE LIMIT 1"
    );
    if (!currentShift.rows[0]) {
      res.status(400).json({ msg: 'Ca làm việc chưa mở' });
    } else {
      const userInformation = await pool.query(
        'SELECT A.id, A.username, A.password, A.fullname,R.name AS role FROM "account" AS A JOIN "role" AS R ON A.roleid = R.id WHERE A.username = $1 LIMIT 1',
        [username]
      );
      if (userInformation.rows[0]) {
        const hashedPassword = await helpers.hashPassword(password);
        //Validate password information
        if (
          await helpers.validatePassword(
            password,
            userInformation.rows[0].password
          )
        ) {
          //Determine the user role;
          const userRole = userInformation.rows[0].role;
          if (
            userRole != sob.CASHIER &&
            userRole != sob.WAITER &&
            userRole != sob.KITCHEN
          ) {
            res
              .status(400)
              .json({ msg: 'Người dùng không được quyền vào hệ thống' });
          } else {
            req.session.shiftId = currentShift.rows[0].id;
            req.session.user = userInformation.rows[0];
            const updateUserStatus = await pool.query(
              'Update "account" SET status = \'ONLINE\' WHERE id=$1',
              [req.session.user.id]
            );
            res.status(200).json();
          }
        } else {
          res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai!' });
        }
      } else {
        res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai!' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
