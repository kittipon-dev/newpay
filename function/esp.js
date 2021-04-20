const mqtt = require('mqtt')

const RUN = require('../models/RUN')

const ipmqtt = "35.185.186.11"
const portmqtt = "1883"
const client = mqtt.connect(`mqtt://${ipmqtt}:${portmqtt}`)

function payok(dname, p, ns) {
    client.publish(dname.toString(), `${p}&&${ns}`)
}

function ok(dname) {
    client.publish(dname, 'o')
}

exports.payok = payok;
exports.ok = ok;