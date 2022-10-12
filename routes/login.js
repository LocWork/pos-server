const { Router } = require('express');
const router = Router();
const pool = require('./../db');
const helpers = require('./../utils/helpers');
const sob = require('./.././staticObj');

//middleware
async function checkUserAndShiftSession(req, res, next) {
  try {
    if (req.session.user && req.session.shiftId) {
      res.status(200).json();
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

async function checkShift(req, res, next) {
  try {
    const currentShift = await pool.query(
      "SELECT S.id FROM shift AS S JOIN worksession AS W ON S.worksessionid = W.id WHERE S.isOpen = true AND S.status = 'ACTIVE' AND w.workdate = CURRENT_DATE LIMIT 1"
    );
    if (currentShift.rows[0]) {
      req.session.shiftId = currentShift.rows[0].id;
      next();
    } else {
      res.status(401).json({ msg: 'Ca làm việc chưa mở' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
}

router.get('/', async (req, res) => {
  try {
    const logo = await pool.query(
      'SELECT restaurantImage FROM systemsetting LIMIT 1'
    );
    if (logo) {
      res.status(200).json(logo.rows[0]);
    } else {
      res.status(200).json({ msg: 'Không thể tìm thấy logo' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

router.post('/', checkUserAndShiftSession, checkShift, async (req, res) => {
  try {
    //Get user information
    const { username, password } = req.body;
    const userInformation = await pool.query(
      'SELECT A.id, A.username, A.password, A.fullname,R.name AS role FROM "account" AS A JOIN "role" AS R ON A.roleid = R.id WHERE A.username = $1',
      [username]
    );
    if (userInformation.rows[0]) {
      const hashedPassword = await helpers.hashPassword(password);
      //Validate password information
      if (await helpers.validatePassword(password, hashedPassword)) {
        //Determine the user role;
        const userRole = userInformation.rows[0].role;
        if (
          userRole != sob.CASHIER &&
          userRole != sob.WAITER &&
          userRole != sob.KITCHEN
        ) {
          res
            .status(401)
            .json({ msg: 'Người dùng không được quyền vào hệ thống' });
        } else {
          req.session.user = userInformation.rows[0];
          const updateUserStatus = await pool.query(
            'Update "account" SET status = \'ONLINE\' WHERE id=$1',
            [req.session.user.id]
          );
          res.status(200).json();
        }
      }
    } else {
      res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai!' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;
