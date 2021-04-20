const express = require('express')
const router = express.Router()

const line = require('@line/bot-sdk');


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
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  if (event.message.text == 'uid' || event.message.text == 'Uid') {
    // console.log(event);
    const echo = { type: 'text', text: event.source.userId };
    return client.replyMessage(event.replyToken, echo)
  }

  if (event.message.text == 'รายได้' || event.message.text == 'Uid') {
    const today = 10
    const thismonth = 100
    const echo = {
      type: 'text',
      text: `วันนี้: ${today}\nเดือนนี้: ${thismonth}`
    };
    return client.replyMessage(event.replyToken, echo)
  }

  if (event.message.text == 'กราฟ' || event.message.text == 'Uid') {
    // console.log(event);
    const echo = { type: 'text', text: event.source.userId };
    return client.replyMessage(event.replyToken, echo)
  }

  if (event.message.text == 'อุปกร์' || event.message.text == 'Uid') {
    // console.log(event);
    const echo = { type: 'text', text: event.source.userId };
    return client.replyMessage(event.replyToken, echo)
  }

  // create a echoing text message

  //client.pushMessage('Ufe6e99510c9aa012be3d116b24127db6', { type: 'text', text: 'hello, world' });

  // use reply API
  //return client.replyMessage(event.replyToken, echo);
  //return client.replyMessage(event.replyToken, echo);
  console.log("send ok2");

}


module.exports = router;