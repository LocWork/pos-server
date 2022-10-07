const express = require('express');
const session = request('express-session');
const app = express();
const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });
const loginRoute = require('./routes/login');
const mainPageRoute = require('./routes/mainPage');
const cors = require('cors');

//Basic express middelware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Session
app.use(
  session({
    secret: 'POSRES',
    resave: false,
    saveUnitialized: false,
  })
);

//ROUTES
app.use('/login', loginRoute);
app.use('/mainPage', mainPageRoute);

server.listen(PORT, () => {
  console.log('Server running...');
});
