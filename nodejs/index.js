var fs = require('fs'),
	util = require('util'),
	// ipList = require('./ipList'),
	pcap = require('pcap'),
	ifconfig,
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
	arduino,
	drivePool = 0,
	oneRound = 0,
	mbPerChoc = 32.3; // 0.121/0.0000000036

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
		sPort = "/dev/tty.usbmodem1411";
	} else {
		util.log('you are on Linux');
		ifconfig = 'wlan5';
		sPort = "/dev/ttyACM0";
	}
	pcap_session = pcap.createSession(ifconfig, "tcp");
	arduino = new SerialPort(sPort, {
		baudrate: 115200
	});
	// ARP
	arp = sudo(['arpspoof', '-i', ifconfig, '192.168.1.1'], options);
	util.log('Spoofing 192.168.1.1');
	arduino.on('open', function() {
		util.log('open port for Arduino');
		forwardIp();
		tcpdump();
		drive();
	});
	arduino.on('error', function(err) {
		util.log('w00ps! ' + err);
	});
}

function tcpdump() {
	util.log('start tcpdump');
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
				bytesTemp += tempGoogle;
				bytesToGoogle += tempGoogle;
				oneRound += tempGoogle;
				arduino.write('BgE');
			}
			if (dst_ip.match('31.13') || dst_ip.match('173.252')) { // facebook
				tempFacebook = data_byte;
				bytesTemp += tempFacebook;
				bytesToFacebook += tempFacebook;
				oneRound += tempFacebook;
				arduino.write('BfE');
			}
			allBytes = bytesToGoogle + bytesToFacebook;
			if (bytesTemp >= 1024) {
				var round = Math.floor(bytesTemp / 1024);
				// turn the motor in round number
				drivePool += round;
				// util.log(allBytes/1000 + ' K sent to Silicon');
				bytesTemp = 0;
			}
			if(oneRound >= 1024*1024*32.3) {
				oneRound = 0;
				// ring the bell

			}
		}

	});
}

function forwardIp() {
	// ubuntu
	util.log('ip forwarded!');
	util.log('ready to rock!');
}

function drive() {
	setInterval(function() {
		if(drivePool >= 1) {
			drivePool--;
			// drive
			arduino.write('B' + 1 + 'E');
			util.log('motor turned ' + 1 * 1.8 + ' degrees.' + ' pool = ' + drivePool);
		}
		if(drivePool >= 100) {
			drivePool -= 3;
			arduino.write('B' + 3 + 'E');
			util.log('motor turned ' + 3 * 1.8 + ' degrees.' + ' pool = ' + drivePool);
		}if(drivePool >= 1000) {
			drivePool -= 5;
			arduino.write('B' + 5 + 'E');
			util.log('motor turned ' + 5 * 1.8 + ' degrees.' + ' pool = ' + drivePool);
		}
		if(drivePool >= 10000) {
			drivePool -= 8;
			arduino.write('B' + 8 + 'E');
			util.log('motor turned ' + 8 * 1.8 + ' degrees.' + ' pool = ' + drivePool);
		}
		if(drivePool == 0) {
		}
	}, 50);
}

process.on('uncaughtException', function (exception) {
   // handle or ignore error
});

startApp();
