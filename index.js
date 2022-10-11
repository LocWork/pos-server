// express setups
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 5000;
// socket
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });
// route
const loginRoute = require('./routes/login');
const logoutRoute = require('./routes/logout');
const mainPageRoute = require('./routes/mainPage');
const playRoute = require('./routes/playground');
//other
// const cors = require('cors');

//Basic express middelware
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Session
app.use(
  session({
    secret: 'POSRES',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

//IO
app.use(function (request, response, next) {
  request.io = io;
  next();
});

app.use('/login', loginRoute);
app.use('/logout', logoutRoute);

// async function checkUserSession(req, res, next) {
//   try {
//     if (req.session.user) {
//       next();
//     } else {
//       res.status(401).json({ msg: 'Xin đăng nhập lại vào hệ thống' });
//     }
//   } catch (error) {
//     console.log(error);
//     res
//       .status(400)
//       .json({ msg: 'Lỗi hệ thống, không thể kiểm tra người dùng!' });
//   }
// }

// app.use(checkUserSession);
app.use('/mainpage', mainPageRoute);
app.use('/playground', playRoute);

io.on('connection', (socket) => {
  console.log('A new user just connected');
});

server.listen(PORT, () => {
  console.log('Server running...');
});

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Connected at port ${PORT}`);
// });
