const { Router } = require('express');
const router = Router();
const pool = require('./../db');
const helpers = require('./../utils/helpers');
const sob = require('./.././staticObj');

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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//GET USER session
router.get('/session', async (req, res) => {
  try {
    if (req.session.user && req.session.shiftId) {
      const currentShift = await pool.query(
        "SELECT S.id FROM shift AS S JOIN worksession AS W ON S.worksessionid = W.id WHERE S.isOpen = true AND S.status = 'ACTIVE' AND W.workdate = CURRENT_DATE AND W.isOpen = true LIMIT 1"
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
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

async function validateUserKitchen(req, res, next) {
  try {
    const { username, password } = req.body;
    const userInformation = await pool.query(
      'SELECT A.id, A.username, A.password, A.fullname,R.name AS role FROM "account" AS A JOIN "role" AS R ON A.roleid = R.id WHERE A.username = $1 LIMIT 1',
      [username]
    );
    if (userInformation.rows[0]) {
      if (
        await helpers.validatePassword(
          password,
          userInformation.rows[0].password
        )
      ) {
        //Determine the user role;
        const userRole = userInformation.rows[0].role;
        if (userRole != sob.KITCHEN) {
          res.status(400).json({ msg: 'Vai trò của người dùng không phù hợp' });
        } else {
          req.session.user = userInformation.rows[0];
          next();
        }
      } else {
        res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai' });
      }
    } else {
      res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function validateUserWaiterCashier(req, res, next) {
  try {
    const { username, password } = req.body;
    const userInformation = await pool.query(
      'SELECT A.id, A.username, A.password, A.fullname,R.name AS role FROM "account" AS A JOIN "role" AS R ON A.roleid = R.id WHERE A.username = $1 LIMIT 1',
      [username]
    );
    if (userInformation.rows[0]) {
      if (
        await helpers.validatePassword(
          password,
          userInformation.rows[0].password
        )
      ) {
        //Determine the user role;
        const userRole = userInformation.rows[0].role;
        if (userRole != sob.CASHIER && userRole != sob.WAITER) {
          res.status(400).json({ msg: 'Vai trò của người dùng không phù hợp' });
        } else {
          req.session.user = userInformation.rows[0];
          next();
        }
      } else {
        res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai' });
      }
    } else {
      res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function validateKitchen(req, res, next) {
  try {
    if (req.session.user.role == sob.KITCHEN) {
      const currentShift = await pool.query(
        "SELECT S.id FROM shift AS S JOIN worksession AS W ON S.worksessionid = W.id WHERE S.isOpen = true AND S.status = 'ACTIVE' AND W.workdate = CURRENT_DATE AND W.isOpen = true LIMIT 1"
      );
      if (currentShift.rows[0]) {
        req.session.shiftId = currentShift.rows[0].id;
        next();
      } else {
        req.session.destroy();
        res.status(400).json({ msg: 'Ca làm việc chưa mở' });
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function validateWaiter(req, res, next) {
  try {
    if (req.session.user.role == sob.WAITER) {
      const currentShift = await pool.query(
        "SELECT S.id FROM shift AS S JOIN worksession AS W ON S.worksessionid = W.id WHERE S.isOpen = true AND S.status = 'ACTIVE' AND W.workdate = CURRENT_DATE AND W.isOpen = true LIMIT 1"
      );
      if (currentShift.rows[0]) {
        req.session.shiftId = currentShift.rows[0].id;
        next();
      } else {
        req.session.destroy();
        res.status(400).json({ msg: 'Ca làm việc chưa mở' });
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//
async function validateCashier(req, res, next) {
  try {
    if (req.session.user.role == sob.CASHIER) {
      const otherCashier = await pool.query(
        `SELECT A.id
        FROM "account" AS A
        JOIN "role" AS R
        ON A.roleid = R.id
        WHERE A.status = 'ONLINE' AND R.name = 'CASHIER' AND A.id != $1 LIMIT 1`,
        [req.session.user.id]
      );
      if (otherCashier.rows[0]) {
        req.session.destroy();
        res.status(400).json({ msg: 'Đã có thu ngân đang làm việc' });
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//UC LOGIN
router.post(
  '/pos',
  validateUserWaiterCashier,
  validateWaiter,
  validateCashier,
  async (req, res) => {
    try {
      //Get user information
      if (req.session.user) {
        const updateUserStatus = await pool.query(
          'Update "account" SET status = \'ONLINE\' WHERE id=$1',
          [req.session.user.id]
        );
        res.status(200).json({ role: req.session.user.role });
      } else {
        req.session.destroy();
        res.status(400).json({ msg: 'Lỗi hệ thống' });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
  }
);

router.post('/kds', validateUserKitchen, validateKitchen, async (req, res) => {
  try {
    if (req.session.user) {
      const updateUserStatus = await pool.query(
        'Update "account" SET status = \'ONLINE\' WHERE id=$1',
        [req.session.user.id]
      );
      res.status(200).json({ role: req.session.user.role });
    } else {
      req.session.destroy();
      res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//GET SHIFT list
router.get(`/shift`, async (req, res) => {
  try {
    const shiftList = await pool.query(`
    SELECT S.id, S.name, S.starttime, S.endtime 
    FROM shift AS S 
    JOIN worksession AS W 
    ON S.worksessionid = W.id 
    WHERE W.isopen = true AND W.workdate = CURRENT_DATE AND 
	  ((NOW()::time < S.endtime)) 
	  AND (S.starttime >= COALESCE(
		(SELECT MAX(S1.endtime) as time FROM "shift" AS S1 
		JOIN worksession AS W1 
    ON S1.worksessionid = W1.id 
		WHERE S1.openerid IS NOT NULL
		AND W1.workdate = CURRENT_DATE
		AND W1.isopen = true
		GROUP BY S1.endtime
		ORDER BY S1.endtime DESC LIMIT 1),'00:00:00')
		)
    AND S.openerid IS NULL AND S.status = 'ACTIVE' AND S.isopen = false
    ORDER BY
    S.starttime
    ASC;
    `);
    if (shiftList.rows) {
      res.status(200).json({ shiftList: shiftList.rows });
    } else {
      req.session.destroy();
      res.status(200).json({ shiftList: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});
//CURRENT_TIMESTAMP::time at time zone 'utc' at time zone 'Asia/Bangkok'
router.put(`/cashieropen/:shiftid`, async (req, res) => {
  try {
    const { shiftid } = req.params;
    const { amount } = req.body;

    const selectedShift = await pool.query(
      `SELECT (endtime > CURRENT_TIMESTAMP::time at time zone 'utc' at time zone 'Asia/Bangkok') as result FROM "shift" WHERE id = $1`,
      [shiftid]
    );
    if (selectedShift.rows[0]) {
      if (selectedShift.rows[0].result == false) {
        res.status(400).json({ msg: 'Không thể mở ca' });
      } else {
        const updateShift = await pool.query(
          `UPDATE "shift" SET isOpen = true, openerid = $1 WHERE id = $2 AND status = 'ACTIVE' returning id`,
          [req.session.user.id, shiftid]
        );

        if (updateShift.rows[0]) {
          const open = await pool.query(
            `
      INSERT INTO cashierlog(accountid, shiftid,creationtime,type,amount, isverify) VALUES($1,$2,NOW()::timestamp,'OPEN',$3,false) RETURNING id
      `,
            [req.session.user.id, updateShift.rows[0].id, amount]
          );
          if (open.rows[0]) {
            req.session.shiftId = updateShift.rows[0].id;
            res.status(200).json();
          } else {
            res.status(400).json({ msg: 'Không thể lưu thông tin' });
          }
        } else {
          res.status(400).json({ msg: 'Không thể mở ca' });
        }
      }
    } else {
      res.status(400).json({ msg: 'Không thể mở ca' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

module.exports = router;
