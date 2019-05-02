"use strict";

var mqtt = require("mqtt");

const {remote, BrowserWindow} = require('electron');
//const currentWindow = remote.getCurrentWindow();
var client;
var hoge = BrowserWindow.getFocusedWindow();

const test = {
	testout: function (){
		console.log("Hello");
		client.publish("test", "test OK");
		return "OKOK";
	},

	mqttConnect: function (ip, port){
		var options = {
			port: port,
			host: ip,
			protocol: 'mqtt'
		}
		client = mqtt.connect(options);
		client.on('connect', function (){
			console.log("connect ok");
			hoge.webContents.send('ch_mqtt_clear');
			var msg = "[Info] Success to Connect broker!\n";
			msg += "Host     : " + options.host + "\n";
			msg += "Port     : " + options.port + "\n";
			msg += "Protocol : " + options.protocol + "\n";
			msg += "----------\n";
			hoge.webContents.send('ch_mqtt', msg);
			//client.publish("test", "test OK");
			//setInterval(test.testout, 1000);
		});

		client.on('packetsend', function (packet){
			console.log(packet);
			if (packet.cmd !== "publish"){
				// publish以外はスルー
				return;
			}
			var msg = "[Info] Published!\n";
			msg += "QoS    : " + packet.qos + "\n";
			msg += "Topic  : " + packet.topic + "\n";
			msg += "Payload: " + packet.payload + "\n";
			msg += "----------\n"
			//console.log(BrowserWindow.getAllWindows());
			hoge.webContents.send('ch_mqtt', msg);
			//console.log(packet.payload);
		});
		return "PUB_OK"
	}
};

module.exports = test;
