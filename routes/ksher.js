const User = require('../models/User')
const Config = require('../models/Config')
const Customer = require('../models/Customer');
const Device = require('../models/Device');
const Balance = require('../models/Balance')

const Graph_allDay = require('../models/Graph_allDay')
const Graph_branchDay = require('../models/Graph_branchDay')
const Graph_allMonth = require('../models/Graph_allMonth')
const Graph_branchMonth = require('../models/Graph_branchMonth')
const Graph_allYear = require('../models/Graph_allYear')
const Graph_branchYear = require('../models/Graph_branchYear')

const Run = require('../models/RUN')
const TransactionKsher = require('../models/TransactionKsher')
const Transaction = require('../models/Transaction')
const Code_device = require('../models/Code_device')



const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/newpay', {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});


var express = require('express');
var router = express.Router();

const dayjs = require('dayjs')
const mqtt = require('mqtt')

const ipmqtt = "35.185.186.11"
const portmqtt = "1883"
const client = mqtt.connect(`mqtt://${ipmqtt}:${portmqtt}`)



router.post('/', async (req, res) => {
  try {
    const tm = new TransactionKsher(req.body)
    await tm.save()
    if (req.body.data.result == "SUCCESS") {
      const dbDevice = await Device.findOne({ dname: req.body.data.device_id })
      const p = parseFloat(req.body.data.total_fee) / 100
      const now = dayjs()
      const myobj = {
        user_id: dbDevice.user_id,
        dname: dbDevice.dname,
        d: now.date(),
        m: now.month() + 1,
        y: now.year(),
        t: dayjs().format(),
        branch: dbDevice.group,
        amount: p,
        nonce_str: req.body.data.nonce_str,
        run: false
      }
      sendESP(dbDevice, myobj)
      Processing(dbDevice, myobj, req.body)
    }
  } catch (error) {

  }
});


/*
    "code": 0,
    "version": "3.0.0",
    "status_code": "",
    "msg": "ok",
    "time_stamp": "2021-01-22T05: 19: 36.633951+08: 00",
    "status_msg": "",
    "data": {
        "openid": "",
        "channel_order_no": "",
        "operator_id": "33531",
        "cash_fee_type": "THB",
        "ksher_order_no": 90020210122051821465169,
        "nonce_str": "DHqgKHaPbipEbbJ15Y64ZETFJOyefqSL",
        "time_end": "2021-01-22 04: 19: 35",
        "fee_type": "THB",
        "attach": "",
        "rate": "0.000000",
        "result": "SUCCESS",
        "total_fee": 100,
        "appid": "mch35306",
        "order_no": 1611263900970,
        "operation": "NATIVE-PAY",
        "device_id": "10010101",
        "cash_fee": 100,
        "channel": "bbl_promptpay",
        "mch_order_no": 1611263900970
    },
    "sign": "41a7dd3e926d3a0a4b8af75a1ae304fed97c5722fb747c15e58914c9ce2bc111207debd7622c20bfd83ddcaf57b67f98e335a6bb3fc7a7caa22b76243ec4ed44"
    */


async function sendESP(device, myobj) {
  if (myobj.amount == device.price1) {
    client.publish(myobj.dname.toString(), `1&&${myobj.nonce_str}`)
    const run = new Run(myobj)
    await run.save()
  } else if (myobj.amount == device.price2) {
    client.publish(myobj.dname.toString(), `2&&${myobj.nonce_str}`)
    const run = new Run(myobj)
    await run.save()
  } else if (myobj.amount == device.price3) {
    client.publish(myobj.dname.toString(), `3&&${myobj.nonce_str}`)
    const run = new Run(myobj)
    await run.save()
  }
}

async function Processing(device, myobj, result) {
  const dbTransaction = new Transaction({
    user_id: myobj.user_id,
    dname: myobj.dname,
    branch: myobj.branch,
    amount: myobj.amount,
    nonce_str: myobj.nonce_str,
    time: myobj.t
  })
  await dbTransaction.save()
  const ad = await Graph_allDay.findOneAndUpdate({
    user_id: myobj.user_id,
    d: myobj.d,
    m: myobj.m,
    y: myobj.y
  }, {
    $inc: { amount: myobj.amount }
  }, {
    new: true,
    upsert: true
  })
  const bd = await Graph_branchDay.findOneAndUpdate({
    user_id: myobj.user_id,
    branch: myobj.branch,
    d: myobj.d,
    m: myobj.m,
    y: myobj.y
  }, {
    $inc: { amount: myobj.amount }
  }, {
    new: true,
    upsert: true
  })
  const am = await Graph_allMonth.findOneAndUpdate({
    user_id: myobj.user_id,
    m: myobj.m,
    y: myobj.y
  }, {
    $inc: { amount: myobj.amount }
  }, {
    new: true,
    upsert: true
  })
  const bm = await Graph_branchMonth.findOneAndUpdate({
    user_id: myobj.user_id,
    branch: myobj.branch,
    m: myobj.m,
    y: myobj.y
  }, {
    $inc: { amount: myobj.amount }
  }, {
    new: true,
    upsert: true
  })
  const ay = await Graph_allYear.findOneAndUpdate({
    user_id: myobj.user_id,
    y: myobj.y
  }, {
    $inc: { amount: myobj.amount }
  }, {
    new: true,
    upsert: true
  })
  const by = await Graph_branchYear.findOneAndUpdate({
    user_id: myobj.user_id,
    branch: myobj.branch,
    y: myobj.y
  }, {
    $inc: { amount: myobj.amount }
  }, {
    new: true,
    upsert: true
  })
}


router.get('/GraphAllDay', async function (req, res, next) {
  const now = dayjs()
  const dg = await Graph_allDay.find({
    user_id: req.session.user_id,
  })
  res.send(dg)
});
router.get('/GraphBranchDay', async function (req, res, next) {
  const now = dayjs()
  const dg = await Graph_branchDay.find({
    user_id: req.session.user_id,
    branch: req.query.branch
  })
  res.send(dg)
});
router.get('/GraphAllMonth', async function (req, res, next) {
  const now = dayjs()
  const dg = await Graph_allMonth.find({
    user_id: req.session.user_id,
  })
  res.send(dg)
});
router.get('/GraphBranchMonth', async function (req, res, next) {
  const now = dayjs()
  const dg = await Graph_branchMonth.find({
    user_id: req.session.user_id,
    branch: req.query.branch,
  })
  res.send(dg)
});
router.get('/GraphAllYear', async function (req, res, next) {
  const now = dayjs()
  const dg = await Graph_allYear.find({
    user_id: req.session.user_id,
  })
  res.send(dg)
});
router.get('/GraphBranchYear', async function (req, res, next) {
  const now = dayjs()
  const dg = await Graph_branchYear.find({
    user_id: req.session.user_id,
    branch: req.query.branch,
  })
  res.send(dg)
});


router.get('/AmountAll', async function (req, res, next) {
  const now = dayjs()
  let d = 0
  let m = 0
  let total = 0
  const day = await Graph_allDay.findOne({
    user_id: req.session.user_id,
    d: now.date(),
    m: now.month() + 1,
    y: now.year()
  })
  const month = await Graph_allMonth.findOne({
    user_id: req.session.user_id,
    m: now.month() + 1,
    y: now.year()
  })
  const year = await Graph_allYear.find({
    user_id: req.session.user_id,
  })
  if (day != null) {
    d = day.amount
  }
  if (month != null) {
    m = month.amount
  }
  if (year != null) {
    year.forEach(e => {
      total += e.amount
    });
  }

  res.send({
    d: d,
    m: m,
    total: total
  })
});
router.get('/AmountBranch', async function (req, res, next) {
  const now = dayjs()
  let d = 0
  let m = 0
  let total = 0
  const day = await Graph_branchDay.findOne({
    user_id: req.session.user_id,
    branch: req.query.branch,
    d: now.date(),
    m: now.month() + 1,
    y: now.year()
  })
  const month = await Graph_branchMonth.findOne({
    user_id: req.session.user_id,
    branch: req.query.branch,
    m: now.month() + 1,
    y: now.year()
  })
  const year = await Graph_branchYear.find({
    user_id: req.session.user_id,
    branch: req.query.branch,
  })
  if (day != null) {
    d = day.amount
  }
  if (month != null) {
    m = month.amount
  }
  if (year != null) {
    year.forEach(e => {
      total += e.amount
    });
  }

  res.send({
    d: d,
    m: m,
    total: total
  })
});

/* GET home page. */
router.get('/get_transaction', async function (req, res, next) {
  const dbRun = await Run.find({ user_id: req.session.user_id })
  //console.log(dbRun);
  res.send(dbRun)
});


module.exports = router;