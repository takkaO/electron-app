"use strict";

var mqtt = require("mqtt");

const {remote, BrowserWindow} = require('electron');
var client;
var mainWindow = BrowserWindow.getFocusedWindow();

const mqttUtils = {
	testout: function (){
		console.log("Hello");
		client.publish("test", "test OK");
		return "OKOK";
	},

	Connect: function (ip, port){
		var options = {
			port: port,
			host: ip,
			protocol: 'mqtt'
		};
		client = mqtt.connect(options);

		client.on('connect', function (){
			//console.log("connect ok");
			mainWindow.webContents.send('ch_mqtt_clear');
			var msg = "[Info] Successful connect to broker!\n";
			msg += "Host     : " + options.host + "\n";
			msg += "Port     : " + options.port + "\n";
			msg += "Protocol : " + options.protocol + "\n";
			msg += "----------\n";
			mainWindow.webContents.send('ch_mqtt', msg);
			//client.publish("test", "test OK");
			//setInterval(mqttUtils.testout, 1000);
		});

		client.on('end', function (){
			var msg = "[Info] Disconnect from broker.\n";
			mainWindow.webContents.send('ch_mqtt', msg);
		});

		client.on('packetsend', function (packet){
			//console.log(packet);
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
			mainWindow.webContents.send('ch_mqtt', msg);
			//console.log(packet.payload);
		});
	},

	Disconnect: function (){
		console.log(client.connected);
		if (client.connected === true){
			client.end();
		}
	},

	Publish: function (topic, payload){
		client.publish(topic, payload);
	},

	IsConnected: function (){
		return client.connected;
	}
};

module.exports = mqttUtils;
