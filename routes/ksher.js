const User = require('../models/User')
const Config = require('../models/Config')
const Customer = require('../models/Customer');
const Device = require('../models/Device');
const Balance = require('../models/Balance')
const Graph_day = require('../models/Graph_day')
const Graph_month = require('../models/Graph_month')
const Graph_year = require('../models/Graph_year')
const Graph_all = require('../models/Graph_all')
const Graph_branch = require('../models/Graph_branch')
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


var express = require('express');
var router = express.Router();

const dayjs = require('dayjs')
const mqtt = require('mqtt')

const ipmqtt = "35.185.186.11"
const portmqtt = "1883"
const client = mqtt.connect(`mqtt://${ipmqtt}:${portmqtt}`)


// LOGIN PAGE
router.post('/', async (req, res) => {
  const tm = new TM(req.body)
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
  res.end()
});



async function sendESP(device, myobj) {
  if (myobj.amount == device.price1) {
    client.publish(myobj.dname.toString(), `1&&${myobj.nonce_str}`)
    const run = new RUN(myobj)
    await run.save()
  } else if (myobj.amount == device.price2) {
    client.publish(myobj.dname.toString(), `2&&${myobj.nonce_str}`)
    const run = new RUN(myobj)
    await run.save()
  } else if (myobj.amount == device.price3) {
    client.publish(myobj.dname.toString(), `3&&${myobj.nonce_str}`)
    const run = new RUN(myobj)
    await run.save()
  }
}

async function Processing(device, myobj, result) {
  const g = await Graph_all.findOneAndUpdate({
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
  const branch = await Graph_branch.findOneAndUpdate({
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
}


router.get('/getGraph', async function (req, res, next) {
  const now = dayjs()

  const dg = await Graph_all.find({
    user_id: req.session.user_id,
  })

  console.log(dg);
  res.send(dg)

});


async function addG(myobj) {

  const dG = await Graph_day.findOne({
    user_id: myobj.user_id,
    branch: myobj.branch,
    d: myobj.d,
    m: myobj.m,
    y: myobj.y
  })

  const amountD = await Graph_day.findOne({
    user_id: myobj.user_id,
    branch: 0,
    d: myobj.d,
    m: myobj.m,
    y: myobj.y
  })

  if (dG) {
    const a = await Graph_day.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: myobj.branch,
      d: myobj.d,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: dG.amount + myobj.amount } })
  } else {
    const a = await Graph_day.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: myobj.branch,
      d: myobj.d,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: myobj.amount } }, {
      new: true,
      upsert: true
    })
  }
  if (!amountD) {
    const aa = await Graph_day.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: 0,
      d: myobj.d,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: myobj.amount } }, {
      new: true,
      upsert: true
    })
  } else {
    const aa = await Graph_day.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: 0,
      d: myobjd.d,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: amountD.amount + myobj.amount } })
  }

  const mG = await Graph_month.findOne({
    user_id: myobj.user_id,
    branch: myobj.branch,
    m: myobj.m,
    y: myobj.y
  })

  const amountM = await Graph_month.findOne({
    user_id: myobj.user_id,
    branch: 0,
    m: myobj.m,
    y: myobj.y
  })

  if (mG) {
    const a = await Graph_month.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: myobj.branch,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: mG.amount + myobj.amount } })
  } else {
    const a = await Graph_month.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: myobj.branch,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: myobj.amount } }, {
      new: true,
      upsert: true
    })
  }
  if (!amountM) {
    const aa = await Graph_month.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: 0,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: myobj.amount } }, {
      new: true,
      upsert: true
    })
  } else {
    const aa = await Graph_month.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: 0,
      m: myobj.m,
      y: myobj.y
    }, { $set: { amount: amountM.amount + myobj.amount } })
  }

  const yG = await Graph_year.findOne({
    user_id: myobj.user_id,
    branch: myobj.branch,
    y: myobj.y
  })

  const amountY = await Graph_year.findOne({
    user_id: myobj.user_id,
    branch: 0,
    y: myobj.y
  })

  if (yG) {
    const a = await Graph_year.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: myobj.branch,
      y: myobj.y
    }, { $set: { amount: yG.amount + myobj.amount } })
  } else {
    const a = await Graph_year.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: myobj.branch,
      y: myobj.y
    }, { $set: { amount: myobj.amount } }, {
      new: true,
      upsert: true
    })
  }
  if (!amountY) {
    const aa = await Graph_year.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: 0,
      y: myobj.y
    }, { $set: { amount: myobj.amount } }, {
      new: true,
      upsert: true
    })
  } else {
    const aa = await Graph_year.findOneAndUpdate({
      user_id: myobj.user_id,
      branch: 0,
      y: myobj.y
    }, { $set: { amount: amountY.amount + myobj.amount } })
  }

}








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
    branch: 0
  })
  res.send(gd)

});

router.get('/g_month', async function (req, res, next) {
  const now = dayjs()
  if (req.query.branch > 0) {
    const gm = await Graph_month.find({ user_id: req.session.user_id, branch: req.query.branch })
    res.send(gm)
  } else {
    const gm = await Graph_month.find({
      user_id: req.session.user_id,
      branch: 0,
      m: now.month() + 1,
      y: now.year()
    })
    res.send(gm)
  }
});

router.get('/g_year', async function (req, res, next) {
  const now = dayjs()
  if (req.query.branch > 0) {
    const gy = await Graph_year.find({ user_id: req.session.user_id, branch: req.query.branch })
    res.send(gy)
  } else {
    const gy = await Graph_year.find({
      user_id: req.session.user_id,
      branch: 0,
      y: now.year()
    })
    res.send(gy)
  }
});


/* GET home page. */
router.get('/get_transaction', async function (req, res, next) {
  const dbBalance = await Balance.find({ user_id: req.session.user_id })
  res.send(dbBalance)
});



module.exports = router;