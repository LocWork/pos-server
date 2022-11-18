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
const tableOverview = require('./routes/tableoverview');
const orderRoute = require('./routes/order');
const orderProcessRoute = require('./routes/orderprocess.js');
const searchRoute = require('./routes/search');
const kitchenRoute = require('./routes/kitchen');

const transferDetailRoute = require('./routes/transferdetail');
const cashierlogRoute = require('./routes/cashierlog');
//other

//Basic express middelware
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Session
const KnexSessionStore = require('connect-session-knex')(session);

const Knex = require('knex');

// const knex = Knex({
//   client: 'pg',
//   connection: {
//     host: '127.0.0.1',
//     user: 'postgres',
//     password: 'qwe',
//     database: 'restaurant',
//   },
// });

const knex = Knex({
  client: 'pg',
  connection: {
    host: 'containers-us-west-128.railway.app',
    user: 'postgres',
    password: 'YlwFv6hrsWvEXY5R21Cr',
    database: 'railway',
  },
});

const store = new KnexSessionStore({
  knex,
  tablename: 'sessions', // optional. Defaults to 'sessions'
});

app.use(
  session({
    secret: 'POSRES',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 60 * 1000, // ten seconds, for testing
    },
    store,
  })
);

//IO
app.use(function (req, res, next) {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('A new user just connected');
  socket.on('join-pos-location', (room) => {
    var location = `POS-L-${room}`;
    socket.join(location);
    console.log(`You have join pos location: ${location}`);
  });

  socket.on('join-kds-location', (room) => {
    var kds = `KDS-L-${room}`;
    socket.join(kds);
    console.log(`You have join kds location: ${kds}`);
  });
});

const compression = require('compression');
app.use(compression());

app.use('/login', loginRoute);
app.use('/logout', logoutRoute);

// async function checkUserSession(req, res, next) {
//   try {
//     if (req.session.user && req.session.shiftId) {
//       next();
//     } else {
//       res.status(400).json({ msg: 'Xin đăng nhập lại vào hệ thống' });
//     }
//   } catch (error) {
//     console.log(error);
//     res
//       .status(400)
//       .json({ msg: 'Lỗi hệ thống' });
//   }
// }
// app.use(checkUserSession);

app.use('/tableoverview', tableOverview);
app.use('/order', orderRoute);
app.use('/orderprocess', orderProcessRoute);
app.use('/kitchen', kitchenRoute);
app.use('/search', searchRoute);
app.use('/transferdetail', transferDetailRoute);
app.use('/cashierlog', cashierlogRoute);

server.listen(PORT, () => {
  console.log('Server running...');
});

// app.listen(`0.0.0.0:${PORT}`, () => {
//   console.log(`Connected at port ${PORT}`);
// });
