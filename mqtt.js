"use strict";

var mqtt = require("mqtt");

const {remote, BrowserWindow} = require('electron');
//const currentWindow = remote.getCurrentWindow();

const test = {
	testout: function (cb){
		console.log("Hello");
		return cb("OKOK");
	},

	mqttConnect: function (ip, port){
		var options = {
			port: port,
			host: ip,
			protocol: 'mqtt'
		}
		var client = mqtt.connect(options);
		client.on('connect', function (){
			console.log("connect ok");
			client.publish("test", "test OK");
		});

		client.on('packetsend', function (packet){
			BrowserWindow.getFocusedWindow().webContents.send('channel-hoge', packet.payload);
			console.log(packet.payload);
		});
		return "PUB_OK"
	}
};

module.exports = test;
