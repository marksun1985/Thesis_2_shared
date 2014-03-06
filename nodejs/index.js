var fs = require('fs'),
	util = require('util'),
	ipList = require('./ipList'),
	pcap = require('pcap'),
	pcap_session = pcap.createSession('en0', "tcp"),
	exec = require('child_process').exec,
	sudo = require('sudo'),
	options = {
		cachePassword: true,
		prompt: 'gimme password',
		spawnOptions: ''
	},
	SerialPort = require("serialport").SerialPort,
	// ls /dev/tty.*
	sPort = "/dev/tty.usbmodem1411",
	arduino = new SerialPort(sPort, {
		baudrate: 9600
	});

arduino.on('open', function() {
	util.log('open port for Arduino');
	forwardIp();
	setInterval(function() {
		arduino.write('B10E');
	}, 1000 / 60);
});

arduino.on('error', function(err) {
	util.log('w00ps! ' + err);
});

function forwardIp() {
	fw = sudo(['sysctl', '-w', 'net.inet.ip.forwarding=1', 'net.inet.ip.fw.enable=1'], options);
}