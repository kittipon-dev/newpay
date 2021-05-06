const express = require('express')
const router = express.Router()

const Graph_allDay = require('../models/Graph_allDay')
const Graph_branchDay = require('../models/Graph_branchDay')
const Graph_allMonth = require('../models/Graph_allMonth')
const Graph_branchMonth = require('../models/Graph_branchMonth')
const Graph_allYear = require('../models/Graph_allYear')
const Graph_branchYear = require('../models/Graph_branchYear')
const UidLine = require('../models/UidLine')
const Customer = require('../models/Customer')
const Device = require('../models/Device')

const line = require('@line/bot-sdk');
const dayjs = require('dayjs')

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "x21+3zigNTlwH2FUjH+HPRW4owXClQLvz8E/i5BK/bMGpZap5spNb7I2z9GMmPc3rFmDfzlJJXIC8UXlMiiKpAUn1EMK+rzmE+HKbzQ0k1Bez9pOHQwZheh3RuuuKBJK6VgAJiKZQV9+xJbfASVn/AdB04t89/1O/w1cDnyilFU=",
  channelSecret: "0c09da17862eed05f1bfdfec2b0b4656",
};

// create LINE SDK client
const client = new line.Client(config);


// register a webhook handler with middleware
// about the middleware, please refer to doc
router.post('/callback', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  if (event.message.text == 'uid' || event.message.text == 'Uid') {
    // console.log(event);
    const echo = { type: 'text', text: event.source.userId };
    return client.replyMessage(event.replyToken, echo)
  }

  const uid = await UidLine.findOne({ uid: event.source.userId })

  if (uid) {
    if (event.message.text == 'รายได้') {
      Income(uid.user_id, event)
    }
    if (event.message.text == 'กราฟ' || event.message.text == 'Uid') {
      // console.log(event);
      const echo = { type: 'text', text: event.source.userId };
      return client.replyMessage(event.replyToken, echo)
    }
    if (event.message.text == 'อุปกรณ์' || event.message.text == 'Uid') {
      sendDevice(uid.user_id, event)
    }
  } else {
    const echo = {
      type: 'text',
      text: 'คุณยังไม่ได้เปิดใช้งาน NewPay_BOT\n\nกรุณาติดต่อ _____ เพื่อเปิดการใช้งาน'
    };
    return client.replyMessage(event.replyToken, echo)
  }


  // create a echoing text message

  //client.pushMessage('Ufe6e99510c9aa012be3d116b24127db6', { type: 'text', text: 'hello, world' });

  // use reply API
  //return client.replyMessage(event.replyToken, echo);
  //return client.replyMessage(event.replyToken, echo);
}

async function Income(user_id, event) {

  const now = dayjs()
  let d = 0
  let m = 0

  const dbCustomer = await Customer.findOne({ user_id: user_id })
  console.log(dbCustomer);

  const day = await Graph_allDay.findOne({
    user_id: user_id,
    d: now.date(),
    m: now.month() + 1,
    y: now.year()
  })
  const month = await Graph_allMonth.findOne({
    user_id: user_id,
    m: now.month() + 1,
    y: now.year()
  })

  if (day.amount != null) {
    d = day.amount.value
  }
  if (month.amount != null) {
    m = month.amount.value
  }

  console.log(event);

  const echo = {
    type: 'text', text: `ทั้งหมด\n-วันนี้ : ${d}\n-เดือนนี้ : ${m}\n\nสาขาที่ 1\n-วันนี้ : ${d}\n-เดือนนี้ : ${m}\n\nสาขาที่ 2\n-วันนี้ : ${0}\n-เดือนนี้ : ${0}`
  };
  client.pushMessage(event.source.userId, echo);
}

async function sendDevice(user_id, event) {
  const dbDevice = await Device.find({ user_id: user_id })
  let text = ""
  dbDevice.forEach(e => {
    text += `ชื่ออุปกรณ์ ${e.dname}  : ${e.status}\n`
  });
  client.pushMessage(event.source.userId, { type: 'text', text: text });
}


module.exports = router;