var fs = require('fs'),
	util = require('util'),
	// ipList = require('./ipList'),
	pcap = require('pcap'),
	ifconfig,
	pcap_session = pcap.createSession(ifconfig, "tcp"),
	exec = require('child_process').exec,
	SerialPort = require("serialport").SerialPort,
	// ls /dev/tty.*
	sPort,
	sudo = require('sudo'),
	options = {
		cachePassword: true,
		prompt: 'gimme password',
		spawnOptions: ''
	},
	arduino = new SerialPort(sPort, {
		baudrate: 9600
	});

var bytesToGoogle = 0,
	bytesToFacebook = 0,
	bytesTemp = 0,
	allBytes = 0;

function startApp() {
	util.log('STARTING APP');
	var os = process.platform;
	if (os == 'darwin') {
		util.log('you are on OSX');
		ifconfig = 'en0';
		sPort = "/dev/tty.usbmodem1421";
	} else {
		util.log('you are on Linux');
		ifconfig = 'wlan3';
		sPort = "/dev/ttyACM0";
	}
	// ARP
	arp = sudo(['arpspoof', '-i', ifconfig, '192.168.1.1'], options);
	util.log('Spoofing 192.168.1.1');
	arduino.on('open', function() {
		util.log('open port for Arduino');
		forwardIp();
		tcpdump();
	});
}

arduino.on('error', function(err) {
	util.log('w00ps! ' + err);
});

function tcpdump() {
	pcap_session.on('packet', function(raw_packet) {
		var data, data_byte, dst_ip, dst_port, packet, src_ip, src_port;
		packet = pcap.decode.packet(raw_packet);
		src_ip = packet.link.ip.saddr;
		src_port = packet.link.ip.tcp.sport;
		dst_ip = packet.link.ip.daddr;
		dst_port = packet.link.ip.tcp.dport;
		data_byte = packet.link.ip.tcp.data_bytes;
		data = packet.link.ip.tcp.data;

		if (data_byte > 41) {
			var tempGoogle, tempFacebook = 0;
			if (dst_ip.match('173.194') || dst_ip.match('74.125')) { // google
				tempGoogle = data_byte;
				bytesToGoogle += tempGoogle;
				arduino.write('B' + -10 + 'E');
			}
			if (dst_ip.match('31.13') || dst_ip.match('173.252')) { // facebook
				tempFacebook = data_byte;
				bytesToFacebook += tempFacebook;
				arduino.write('B' + -20 + 'E');
			}
			allBytes = bytesToGoogle + bytesToFacebook;
			bytesTemp += tempGoogle + tempFacebook;
			if (bytesTemp >= 1024) {
				var round = Math.round(byteTemp / 1024);
				// turn the motor in round number
				arduino.write('B' + round + 'E');
				util.log('motor turned ' + round * 1.8 + ' degrees');
				bytesTemp = 0;
			}
		}

	});
}

function forwardIp() {
	// ubuntu
	util.log('ip forwarded!');
	util.log('ready to rock!');
}

startApp();