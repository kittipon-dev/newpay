const User = require('../models/User')
const Balance = require('../models/Balance')
const Graph_day = require('../models/Graph_day')
const Graph_month = require('../models/Graph_month')
const Graph_year = require('../models/Graph_year')
const Graph_all = require('../models/Graph_all')
const Customer = require('../models/Customer')
const RUN = require('../models/RUN')
const TransactionKsher = require('../models/TransactionKsher')
const Transactions = require('../models/Transaction')
const Device = require('../models/Device');
const QRcode = require('../models/QRcode');

const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/newpay', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const express = require('express');
const router = express.Router();

const dayjs = require('dayjs')

const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const { body, validationResult } = require('express-validator');
const { fstat } = require('fs')



// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render('user_auth-login');
  }
  next();
}

const ifLoggedin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  next();
}

// LOGIN PAGE
router.post('/', ifLoggedin, async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email })
    bcrypt.compare(req.body.email + req.body.password, user[0].password).then(compare_result => {
      if (compare_result === true) {
        req.session.isLoggedIn = true;
        req.session.user_id = user[0].user_id;
        res.redirect('/');
      }
      else {
        res.redirect('/');
      }
    }).catch(err => {
      if (err) throw err;
    });
  } catch (error) {
    res.redirect('/');
  }
});

router.post('/newpassword', async (req, res) => {
  if (req.body.newpass == req.body.cpass) {
    try {
      const dbUser = await User.findOne({ user_id: req.session.user_id })
      bcrypt.compare(dbUser.email + req.body.oldpass, dbUser.password).then(compare_result => {
        if (compare_result === true) {
          bcrypt.hash(dbUser.email + req.body.newpass, 12).then(async (hash_pass) => {
            const dbUserNew = await User.findOneAndUpdate({ user_id: req.session.user_id },
              {
                $set: {
                  password: hash_pass
                }
              })
            res.redirect('info_customer?alert=เปลี่ยนรหัสผ่านแล้ว OK')
          })
            .catch(err => {
            })
        }
        else {
          res.redirect('info_customer?alert=รหัสผ่านปัจจุบัน ไม่ถูกต้อง')
        }
      }).catch(err => {
        if (err) throw err;
      });
    } catch (error) {
    }
  } else {
    res.redirect('info_customer?alert=รหัสผ่านยืนยัน ไม่ตรงกัน')
  }
});

router.get('/fpassword', (req, res) => {
  res.render('user_forgot-password')
});

router.get('/fpasswordSend', (req, res) => {
  res.redirect('/')
});


// LOGOUT
router.get('/logout', (req, res) => {
  //session destroy
  req.session = null;
  res.redirect('/');
});
// END OF LOGOUT


/* GET home page. */
router.get('/', ifNotLoggedin, async function (req, res, next) {
  try {
    const dbCustomer = await Customer.findOne({ user_id: req.session.user_id })
    res.render('user_home', {
      user_id: req.session.user_id,
      branch: dbCustomer.branch
    });
  } catch (error) {
    res.render('user_home', {
      user_id: req.session.user_id,
      branch: 0
    });
  }
});


/* GET home page. */
router.get('/dashboard_branch', ifNotLoggedin, async function (req, res, next) {
  res.render('user_home2', { data: req.query })
});

/* GET home page. */
router.get('/info_devices', ifNotLoggedin, async function (req, res, next) {
  const dbDevice = await Device.find({ user_id: req.session.user_id })
  res.render('user_infodevices', { data: dbDevice })
});
/* GET home page. */
router.get('/viewqrcode', ifNotLoggedin, async function (req, res, next) {
  const dbQRcode = await QRcode.findOne({ user_id: req.session.user_id, dname: req.query.dname })
  res.render('user_viewqrcode', { data: dbQRcode })
});


/* GET home page. */
router.get('/info_customer', ifNotLoggedin, async function (req, res, next) {
  const dbCustomer = await Customer.findOne({ user_id: req.session.user_id })
  if (req.query) {
    res.render('user_infocustomer', { data: dbCustomer, alert: req.query.alert })
  } else {
    res.render('user_infocustomer', { data: dbCustomer, alert: "" })
  }
});

/* GET home page. */
router.get('/notrun', ifNotLoggedin, async function (req, res, next) {
  const dbRun = await RUN.find({ user_id: req.session.user_id, run: false })
  res.render('user_notrun', { data: dbRun })
});


/* GET home page. */
router.get('/info_transaction', ifNotLoggedin, async function (req, res, next) {
  const dbTransactions = await Transactions.find({ user_id: req.session.user_id })
  res.render('user_infotransaction', { data: dbTransactions })
});


module.exports = router;
