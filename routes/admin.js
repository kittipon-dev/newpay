const User = require('../models/User')
const Config = require('../models/Config')
const Customer = require('../models/Customer');
const Device = require('../models/Device');
const Balance = require('../models/Balance')
const Graph_day = require('../models/Graph_day')
const Graph_month = require('../models/Graph_month')
const Graph_year = require('../models/Graph_year')
const Graph_all = require('../models/Graph_all')
const RUN = require('../models/RUN')
const TM = require('../models/TM')
const Code_device = require('../models/Code_device')

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/newpay', {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const qr = require('./newqr');

var express = require('express');
var router = express.Router();

const dayjs = require('dayjs')


const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedinAdmin = (req, res, next) => {
  if (!req.session.isLoggedInAdmin) {
    req.session = null;
    return res.render('admin_auth-login');
  }
  next();
}

const ifLoggedinAdmin = (req, res, next) => {
  console.log("aasd");
  if (req.session.isLoggedInAdmin) {
    console.log("aaaaaaa");
    return res.redirect('/admin');
  }
  next();
}

// LOGIN PAGE
router.post('/', ifLoggedinAdmin, async (req, res) => {
  try {
    bcrypt.compare(req.body.password, '$2b$12$J7NcSf9ECrGN8BlV9swbDeAQU1TOdTEtbIMlOVS.V.ohdd9T7qu6C').then(compare_result => {
      if (compare_result === true) {
        req.session.isLoggedInAdmin = true;
        res.redirect('/admin');
      }
      else {
        res.render('admin_auth-login');
      }
    }).catch(err => {
      if (err) throw err;
    });
  } catch (error) {

    res.redirect('/admin');
  }
});



// LOGOUT
router.get('/logout', (req, res) => {
  //session destroy
  req.session = null;
  res.redirect('/admin');
});
// END OF LOGOUT


/* GET home page. */
router.get('/', ifNotLoggedinAdmin, async function (req, res, next) {
  res.render('admin_home');
});

/* GET customer page. */
router.get('/customer', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbCustomer = await Customer.find({})
  res.render('admin_customer', { data: dbCustomer });
});

/* GET customer page. */
router.get('/newcustomer', ifNotLoggedinAdmin, async function (req, res, next) {
  res.render('admin_new-customer', { e: "" });
});


/* GET customer page. */
router.post('/newcustomer', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbConfig = await Config.findOne()
  const dbUser = await User.findOne({ email: req.body.email })
  try {
    if (dbUser == null) {
      bcrypt.hash(req.body.email + req.body.email, 12).then(async (hash_pass) => {
        let newuser_id = Number(dbConfig.user_id) + 1
        const user = new User({
          user_id: newuser_id,
          email: req.body.email,
          password: hash_pass
        })
        const myobj = req.body
        myobj.user_id = newuser_id
        myobj.time = new Date()
        myobj.branch = parseInt(req.body.branch)
        const customer = new Customer(myobj)

        await user.save();
        await customer.save();
        await Config.updateOne({}, { user_id: newuser_id })
        res.redirect('/admin/customer');
      })
        .catch(err => {

        })
    } else {
      res.render('new-customer', { e: "Have a Problem " })
    }
  } catch (error) {
    res.render('admin_new-customer', { e: "Have a Problem " })
  }
});

/* GET customer page. */
router.get('/device', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbCustomer = await Customer.find({})
  const dbDevice = await Device.find({})
  res.render('admin_device', { dataC: dbCustomer, dataD: dbDevice });
});

/* GET customer page. */
router.get('/device_manager', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbDevice = await Device.find({ user_id: req.query.user_id })
  //res.render('admin_deviceM', { dataD: dbDevice, user_id: req.query.user_id, txt: "" });
  res.render('admin_deviceM', { dataD: dbDevice, user_id: req.query.user_id, txt: "" });
});

/* GET customer page. */
router.get('/newdevice', ifNotLoggedinAdmin, async function (req, res, next) {
  res.render('admin_new-device');
});
/* GET customer page. */
router.get('/del_device', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbDevice = await Device.findOneAndRemove({ dname: req.query.dname })
  res.redirect('/admin/device_manager?user_id=' + req.query.user_id)
});
/* GET customer page. */
router.post('/new_device', ifNotLoggedinAdmin, async function (req, res, next) {
  let myobj = req.body
  myobj.time = new Date()
  myobj.status = "new device"
  const dname = myobj.user_id + myobj.group + myobj.name
  let query = { dname: dname },
    options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };

  const dbDevice = await Device.findOneAndUpdate(query, myobj, options)
  const dbQRcode = await QRcode.findOneAndUpdate(query, myobj, options)
  res.redirect('/admin/device_manager?user_id=' + myobj.user_id)
});

/* GET customer page. */
router.get('/new_qr', ifNotLoggedinAdmin, async function (req, res, next) {
  qr.OrderApply({ dname: req.query.dname, user_id: req.query.user_id }, parseInt(req.query.price), req.query.p)
  setTimeout(() => {
    res.redirect('/admin/device_manager?user_id=' + req.query.user_id)
  }, 2000);
});


/* GET customer page. */
router.get('/code', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbCodedevice = await Code_device.find()
  const dbCodedeviceUse = await Code_device.findOne({ status: "use" })
  res.render('admin_codedevice', { data: dbCodedevice.reverse(), dataUse: dbCodedeviceUse });
});
router.get('/use_code_ver', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbCodedeviceUnuse = await Code_device.findOneAndUpdate({
    status: "use"
  }, {
    status: ""
  })
  const dbCodedevice = await Code_device.findOneAndUpdate({
    ver: req.query.ver
  }, {
    status: "use"
  })
  res.redirect('/admin/code/')
});
router.get('/del_code_ver', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbCodedevice = await Code_device.findOneAndDelete({ ver: req.query.ver })
  res.redirect('/admin/code/')
});


const multer = require('multer');
const { find } = require('../models/User');
const QRcode = require('../models/QRcode');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/code_bin/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.ver + '.bin')
  }
})
const upload = multer({ storage: storage })
router.post('/uploadfilecode', upload.single('file'), async function (req, res, next) {
  const dbCodedevice = await Code_device.findOneAndUpdate({
    ver: req.body.ver
  }, {
    ver: req.body.ver,
    date: dayjs(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).format('YYYY-MM-DD H:m:s'),
    description: req.body.description,
    url: req.body.ver + ".bin",
    status: ""
  }, {
    upsert: true, new: true
  })
  res.redirect('/admin/code/')
})




/* GET customer page. */
router.get('/norun', ifNotLoggedinAdmin, async function (req, res, next) {
  res.render('admin_notrun');
});

/* GET customer page. */
router.get('/logrun', ifNotLoggedinAdmin, async function (req, res, next) {
  res.render('admin_logrun');
});

/* GET customer page. */
router.get('/logt', ifNotLoggedinAdmin, async function (req, res, next) {
  res.render('admin_logt');
});






router.get('/get_balance', async function (req, res, next) {
  const now = dayjs()

  let d = 0
  let m = 0
  let y = 0

  const gd = await Graph_day.findOne({
    d: now.date(),
    m: now.month() + 1,
    y: now.year()
  })
  const gm = await Graph_month.findOne({
    m: now.month() + 1,
    y: now.year()
  })
  const gy = await Graph_year.find({

  })

  if (gd != null) {
    d = gd.amount
  }
  if (gm != null) {
    m = gm.amount
  }
  if (gy != null) {
    gy.forEach(e => {
      y += e.amount
    });
  }
  res.send({
    d: d,
    m: m,
    a: y
  })

});

router.get('/g_day', async function (req, res, next) {
  const now = dayjs()

  const gd = await Graph_day.find({
    user_id: req.session.user_id,
    shop: 0
  })
  res.send(gd)

});

router.get('/g_month', async function (req, res, next) {
  const now = dayjs()
  if (req.query.shop > 0) {
    const gm = await Graph_month.find({ user_id: req.session.user_id, shop: req.query.shop })
    res.send(gm)
  } else {
    const gm = await Graph_month.find({
      user_id: req.session.user_id,
      shop: 0,
      m: now.month() + 1,
      y: now.year()
    })
    res.send(gm)
  }
});

router.get('/g_year', async function (req, res, next) {
  const now = dayjs()
  if (req.query.shop > 0) {
    const gy = await Graph_year.find({ user_id: req.session.user_id, shop: req.query.shop })
    res.send(gy)
  } else {
    const gy = await Graph_year.find({
      user_id: req.session.user_id,
      shop: 0,
      y: now.year()
    })
    res.send(gy)
  }
});


/* GET home page. */
router.get('/get_transaction', ifNotLoggedinAdmin, async function (req, res, next) {
  const dbBalance = await Balance.find({ user_id: req.session.user_id })
  res.send(dbBalance)
});



module.exports = router;