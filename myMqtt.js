"use strict";

var mqtt = require("mqtt");

const {remote, BrowserWindow} = require('electron');
var client = null;
var mainWindow = BrowserWindow.getFocusedWindow();

const mqttUtils = {
	testout: function (){
		console.log("Hello");
		return "OKOK";
	},

	connect: function (ip, port){
		var options = {
			port: port,
			host: ip,
			protocol: 'mqtt',
			connectTimeout: 5000
		};
		client = mqtt.connect(options);

		client.on('connect', function (){
			//console.log("connect ok");
			var msg = "Successful connect to broker!\n";
			msg += "Host     : " + options.host + "\n";
			msg += "Port     : " + options.port + "\n";
			msg += "Protocol : " + options.protocol + "\n";
			msg += "----------\n";
			mainWindow.webContents.send('ch_mqtt', "connect", msg);
			//client.publish("test", "test OK");
			//setInterval(mqttUtils.testout, 1000);
		});

		client.on('end', function (){
			var msg = "Disconnect from broker.\n";
			mainWindow.webContents.send('ch_mqtt', "disconnect", msg);
		});

		client.on('error', function (err){
			mainWindow.webContents.send('ch_mqtt', "error", err.message);
		});

		client.on('offline', function(){
			var msg = "Cannot connect -> offline error.\n";
			mainWindow.webContents.send('ch_mqtt', "error", msg);
		});

		client.on('packetsend', function (packet){
			//console.log(packet);
			if (packet.cmd !== "publish"){
				// publish以外（ping）はスルー
				return;
			}
			var msg = "Published!\n";
			msg += "QoS    : " + packet.qos + "\n";
			msg += "Topic  : " + packet.topic + "\n";
			msg += "Payload: " + packet.payload + "\n";
			msg += "----------\n"
			//console.log(BrowserWindow.getAllWindows());
			mainWindow.webContents.send('ch_mqtt', "publish", msg);
			//console.log(packet.payload);
		});
	},

	disconnect: function (){
		if (client === null){
			return;
		}
		if (client.connected === true){
			client.end();
			client = null;
		}
	},

	publish: function (topic, payload){
		if (client === null){
			return;
		}
		client.publish(topic, payload);
	},

	isConnected: function (){
		if (client === null){
			return false;
		}
		return client.connected;
	}
};

module.exports = mqttUtils;
