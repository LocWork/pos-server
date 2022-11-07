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
const tableOverview = require('./routes/tabloverview');
const orderRoute = require('./routes/order');
const orderProcessRoute = require('./routes/orderprocess.js');
const playRoute = require('./routes/playground');
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

const knex = Knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'qwe',
    database: 'restaurant',
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
    console.log(`you have join pos location: ${location}`);
  });

  socket.on('join-kds-location', (room) => {
    var kds = `KDS-L-${room}`;
    socket.join(kds);
    console.log(`you have join kds location: ${kds}`);
  });
});

app.use('/login', loginRoute);
app.use('/logout', logoutRoute);

async function checkUserSession(req, res, next) {
  try {
    if (req.session.user && req.session.shiftId) {
      next();
    } else {
      res.status(400).json({ msg: 'Xin đăng nhập lại vào hệ thống' });
    }
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ msg: 'Lỗi hệ thống, không thể kiểm tra người dùng!' });
  }
}

app.use(checkUserSession);
app.use('/tableoverview', tableOverview);
app.use('/order', orderRoute);
app.use('/orderprocess', orderProcessRoute);
app.use('/kitchen', kitchenRoute);
app.use('/playground', playRoute);
app.use('/search', searchRoute);
app.use('/transferdetail', transferDetailRoute);
app.use('/cashierlog', cashierlogRoute);

server.listen(PORT, () => {
  console.log('Server running...');
});

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Connected at port ${PORT}`);
// });
