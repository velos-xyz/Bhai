const EventEmitter = require('events');
const axios = require('axios');
const ChildProcess = require('child_process');
const OS = require('os');
const events = new EventEmitter();

const sent = [];
const sendable = {};
const received = [];

const broadcast_addrs = 
    ChildProcess
        .execSync("ifconfig | grep 'inet '")
        .toString('utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .map(
            line =>
                line
                    .split(' ')
                    .filter(chunk => chunk.length)
                    .map(chunk => chunk.toLowerCase())
        ).filter(
            line =>
                line.indexOf('broadcast') >= 0
        ).map(
            line => line[line.indexOf('broadcast') + 1]
        );

const PORT = 46860;
const HOST = '0.0.0.0';

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const client = dgram.createSocket('udp4');
const receptionSet = new Set();

let name = OS.hostname();
let counter = 0;

server.on('message', (message, remote) => {
    const msg = message.toString('utf8');

    if (msg.substr(0, 5) !== 'bhai:') {
        return;
    }

    const ip = remote.address;
    const id = parseInt(msg.substr(5));
    const hash = `${ip}#${id}`;

    if (receptionSet.has(hash)) {
        return;
    }

    receptionSet.add(hash);

    axios.get(`http://${id}:${PORT+1}/details?id=${id}`).then(res => {
        received.push(res.data);
        events.emit('new', res.data);
    }).catch(err => {
        console.log(err);
    });
});

server.bind(PORT, HOST);

function send(share) {
    let i = 0;
    const count = count++;
    const message = new Buffer(`bhai:${count}`);

    const sharable = {
        name,
        share
    }

    sent.push(share);
    sendable[count] = sharable;

    setTimeout(() => {
        delete sendable[count];
    }, 65*1000);
    
    const transmit = () => {
        broadcast_addrs.forEach(addr => {
            client.send(message, 0, message.length, PORT, addr);
        });

        i++;

        if (i < 30) {
            setTimeout(() => {
                transmit();
            }, 2000);
        }
    }

    transmit();
}

module.exports = {
    setName: (n_name) => {
        name = n_name;
    },
    getName: () => {
        return name;
    },
    bus: events,
    send,
    get: () => {
        return received;
    }
};