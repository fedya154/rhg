const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const User = require('./bd/user');

const app = express();

app.set('port', 9000);



app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended:true }));

app.use(cookieParser());

app.use(express.static('public'));

app.use(session({
  key: 'user_sid',
  secret: 'catchthecat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 6000000
  }
}));
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});





const sessionChecker = (req, res, next) => {
  if(req.session.user && req.cookies.user_sid){
    res.redirect('/cabinet');
  } else {
    next();
  }
};



app.get('/', sessionChecker, (req, res) => {
  res.redirect('/main');
});

app.route('/main').get((req,res) => {
  res.sendFile(__dirname + '/public/main.html');
})



app.get('/cabinet', (req,res)=> {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(__dirname + '/public/cabinet.html')
  } else {
    res.redirect('/main');
  }
})


app.route('/signup').get(sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/public/signup.html');
})

app.route('/signup').post((req,res)=> {
  let old = req.body.years;

  if (old < 18) { res.redirect('/signup') } else {

    User.create({
      username: req.body.username,
      email:req.body.email,
      password: req.body.password,
      years: req.body.years
    }).then(user => {
      req.session.user = user.dataValues;
      res.redirect('/cabinet');
    }).catch(error => {console.log(error.message), res.redirect('/signup')})

  }

});

app.route('/login').get((req,res) => {
  res.sendFile(__dirname + '/public/login.html');
})

    .post((req,res)=> {
      const username = req.body.username,
            password = req.body.password;
      User.findOne({ where: { username : username } }).then(function(user){
        if (!user){
          console.log("not found")
          res.redirect('/login');
        } else if (!user.validPassword(password)){
          console.log("wrong password")
          res.redirect('/login');
        } else {
           req.session.user = user.dataValues;
          res.redirect('/cabinet');
        }
      });
    });
app.get('/line',(req, res) => {
  res.sendFile(__dirname + '/public/line.html');
})
app.get('/live', (req, res) => {
  res.sendFile(__dirname + '/public/live.html');
})
app.get('/hockey', (req, res) => {
  res.sendFile(__dirname + '/public/hockey.html');
})
app.get('/hockeylive', (req, res) => {
  res.sendFile(__dirname + '/public/hockeylive.html');
})

  app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
      res.clearCookie('user_sid');
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });


  app.use(function(req,res,next){
    res.status(404).send("Sorry cannot find that !")
  })

  app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));