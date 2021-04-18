const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const fs = require('fs');

const Device = require('../models/Device');
const QRcode = require('../models/QRcode');

const qrcode = require('qrcode')
const axios = require('axios');
const dayjs = require('dayjs')

const appid = "mch35306";
const channel = "bbl_promptpay";
const feeType = "THB";
const notify_url = "http://18.140.255.41/notify_pay.php";


const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICYQIBAAKBgQDDvri3e3vw3/dBE8SQxyynfPCbytO0JC83oQt8UtVZsTacslTs
i3kLcF8XCgyi463MypsTH0ay0Cd3nosUCVQPStYWapkUEewRt04qa+raD5258pLG
0Dum2iMDZ+yO9wyG/Z0bGFAY1HDpWjwyn7erhA6cAYs69CJgCpVVqAWqnQIDAQAB
AoGAV6yTO8uZZfhK3OEnx9kOTS6O7pjYXfVfGMGPTW4klXnkhibyFskZvF/ml4Eu
y77C19lfwB7gIbNOGivusaf84GeOyubFgdZJ7s8r3YSG2CJ1KY+6OqhwRhdTmmei
p38/2lyBRp2iwg6W6SZkS3vuRKRI6NUHlpbPft9+lP54+oECRQDIPm91Rf6MsTwZ
+jXaK6toLpAoYjZLAYBTcQq8yt+RmCBHz6epfa7mZowPH9mtVwNyF1zoPQ7qW0u2
ZI95QqBYg8qYMQI9APo/mg9NbQTLsKCCd55Fix+4isDypQrzkkCgF8EEHR+Owh1Y
TlGAp2kV7Y6CTNQUHImvhIPDrbqEpCcKLQJFAKUBbe8BQoTE93WgjQe+vHwZAomE
hKDCF/CqUeLIefoLlW4XW117R8hr8DX2VPVVom09ez2UMtpDaNxfeSq/EEpgL23B
Aj0A5mdwvO4YlfXEZcQ5xitZcJdEiWneszqXSZEczcWv2sJhzwri8P93I7XgxvkJ
K6porAxCAd9EMRq22IrxAkR4JXOxjGzVH65x1Kd+55QfzmJPG3oP7+lpi4vTQV7/
Be4KxkJFNGTANQfDPF1Bve6KIqjkr17aFe2qXJSZQwtJutj1yw==
-----END RSA PRIVATE KEY-----`




function OrderApply(device, price, p) {
    price = price * 100
    let dataG = generator(device.dname, price);

    let config = {
        method: 'post',
        url: 'https://api.mch.ksher.net/KsherPay/native_pay',
        data: querystring.stringify({
            appid: appid,
            channel: channel,
            fee_type: feeType,
            mch_order_no: dataG.mch_order_no,
            nonce_str: dataG.nonce_str,
            notify_url: notify_url,
            device_id: device.dname,
            total_fee: price,
            sign: dataG.sign
        })
    };

    //console.log(config);

    axios(config)
        .then(function (response) {
            if (response.data.data.result == "SUCCESS") {
                addOrderApply(response.data.data, device, p);
            }

        })
        .catch(function (error) {
            console.log(error);
        });

}



async function addOrderApply(result, device, p) {
    const dir = './public/qrimage/' + device.user_id;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const urlFile = './public/qrimage/' + device.user_id + '/' + device.dname + '-p' + p + '.png'
    await qrcode.toFile(urlFile, result.PaymentCode, {
        width: 500,
        type: 'image/png',
        color: {
            light: '#ffffff',
            dark: '#000000' // Transparent backgrounddark
        },
    })
    if (p == '1') {
        const dbQRcode = await QRcode.findOneAndUpdate({ dname: device.dname, user_id: device.user_id }, {
            $set: {
                imgP1: `/qrimage/${device.user_id}/${device.dname}-p1.png`,
                time1: dayjs(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).format('YYYY-MM-DD H:m:s'),
                myobj1: result
            }
        }, {
            upsert: true, new: true
        })
    } else if (p == '2') {
        const dbQRcode = await QRcode.findOneAndUpdate({ dname: device.dname, user_id: device.user_id }, {
            $set: {
                imgP2: `/qrimage/${device.user_id}/${device.dname}-p2.png`,
                time2: dayjs(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).format('YYYY-MM-DD H:m:s'),
                myobj2: result
            }
        }, {
            upsert: true, new: true
        })
    } else if (p == '3') {
        const dbQRcode = await QRcode.findOneAndUpdate({ dname: device.dname, user_id: device.user_id }, {
            $set: {
                imgP3: `/qrimage/${device.user_id}/${device.dname}-p3.png`,
                time3: dayjs(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).format('YYYY-MM-DD H:m:s'),
                myobj3: result
            }
        }, {
            upsert: true, new: true
        })
    }
}


function GetNonceStr(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function generator(device, price) {

    let dataGen = {
        mch_order_no: Date.now(),
        nonce_str: GetNonceStr(32)
    }

    let dataSing = "appid=" + appid +
        "channel=" + channel +
        "device_id=" + device +
        "fee_type=" + feeType +
        "mch_order_no=" + dataGen.mch_order_no +
        "nonce_str=" + dataGen.nonce_str +
        "notify_url=" + notify_url +
        "total_fee=" + price;

    var key = privateKey.toString('ascii');
    var sign = crypto.createSign('RSA-SHA256');
    sign.update(dataSing);
    var sig = sign.sign(key, 'hex');

    var reData = {
        nonce_str: dataGen.nonce_str,
        mch_order_no: dataGen.mch_order_no,
        sign: sig
    }

    return reData;
}

exports.OrderApply = OrderApply;

