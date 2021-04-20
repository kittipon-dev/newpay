const express = require('express')
const router = express.Router()
const mqtt = require('mqtt')

const Device = require('../models/Device')
const Code_device = require('../models/Code_device')


const ipmqtt = "35.185.186.11"
const portmqtt = "1883"
const client = mqtt.connect(`mqtt://${ipmqtt}:${portmqtt}`)


router.get('/get_dname', async (req, res) => {
    const dbCodedeviceUse = await Code_device.findOne({ status: "use" })

    if (dbCodedeviceUse.ver == req.query.ver) {
        const dbDevice = await Device.findOne({ dname: req.query.dname })
        res.send({
            "ip-mqtt": ipmqtt,
            "port-mqtt": portmqtt,
            "pr1": dbDevice.price1,
            "pu1": dbDevice.pulse1,
            "pr2": dbDevice.price2,
            "pu2": dbDevice.pulse2,
            "pr3": dbDevice.price3,
            "pu3": dbDevice.pulse3,
        })
    } else {
        res.sendStatus(222)
    }
})
const path = require('path')
const Run = require('../models/RUN')
router.get('/getbin', async (req, res) => {
    const dbCodedeviceUse = await Code_device.findOne({ status: "use" })
    console.log(dbCodedeviceUse);
    await res.sendFile(path.join(__dirname, '../public/code_bin', `${dbCodedeviceUse.ver}.bin`));
})





router.get('/esp_ok', async function (req, res, next) {
    esp_ok(req.query.dname)
    setTimeout(() => {
        res.redirect('/info_devices')
    }, 5000);
});
router.get('/esp_okAdmin', async function (req, res, next) {
    esp_ok(req.query.dname)
    setTimeout(() => {
        res.redirect('/admin/device_manager?user_id=' + req.query.user_id)
    }, 5000);
});
router.get('/esp_okAll', async function (req, res, next) {
    const dbDevice = await Device.find({ user_id: req.session.user_id })
    dbDevice.forEach(element => {
        esp_ok(element.dname.toString())
    });
    setTimeout(() => {
        res.redirect('/info_devices')
    }, 5000);
});
router.get('/esp_okAdminAll', async function (req, res, next) {
    const dbDevice = await Device.find({ user_id: req.query.user_id })
    dbDevice.forEach(element => {
        esp_ok(element.dname.toString())
    });
    setTimeout(() => {
        res.redirect('/admin/device_manager?user_id=' + req.query.user_id)
    }, 5000);
});
router.get('/esp_r', async function (req, res, next) {
    esp_r(req.query.dname)
    setTimeout(() => {
        res.redirect('/info_devices')
    }, 5000);
});
router.get('/esp_rAdmin', async function (req, res, next) {
    esp_r(req.query.dname)
    setTimeout(() => {
        res.redirect('/admin/device_manager?user_id=' + req.query.user_id)
    }, 5000);
});
router.get('/esp_rAll', async function (req, res, next) {
    const dbDevice = await Device.find({ user_id: req.session.user_id })
    dbDevice.forEach(element => {
        esp_r(element.dname.toString())
    });
    setTimeout(() => {
        res.redirect('/info_devices')
    }, 5000);
});
router.get('/esp_rAdminAll', async function (req, res, next) {
    const dbDevice = await Device.find({ user_id: req.query.user_id })
    dbDevice.forEach(element => {
        esp_r(element.dname.toString())
    });
    setTimeout(() => {
        res.redirect('/admin/device_manager?user_id=' + req.query.user_id)
    }, 5000);
});


async function esp_ok(dname) {
    client.publish(dname, 'o')
    await Device.findOneAndUpdate({ dname: dname }, {
        $set: { status: "test connect" }
    })
}
async function esp_r(dname) {
    client.publish(dname, 'r')
    await Device.findOneAndUpdate({ dname: dname }, {
        $set: { status: "restart" }
    })
}

client.on('connect', function () {
    client.subscribe('payok', function (err) {
        if (!err) {
            // client.publish('test', 'Hello mqtt')
        }
    })
    client.subscribe('MainServerOK', function (err) {
        if (!err) {
            // client.publish('test', 'Hello mqtt')
        }
    })
})


client.on('message', async function (topic, message) {
    if (topic == "payok") {
        const str = message.toString().split('&&')
        const dbRun = await Run.findOneAndUpdate(
            { nonce_str: str[1] },
            { $set: { run: true } })
    } else if (topic == "MainServerOK") {
        returnOK(message)
    }
})


async function returnOK(d) {
    console.log("ok");
    await Device.findOneAndUpdate({ dname: d }, {
        $set: { status: "online" }
    })
}




module.exports = router;


