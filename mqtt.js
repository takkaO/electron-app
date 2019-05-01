"use strict";

var mqtt = require("mqtt");

const test = {
	testout: function (cb){
		console.log("Hello");
		return cb("OKOK");
	},

	mqttConnect: function (ip){
		var options = {
			port: 60000,
			host: ip,
			protocol: 'mqtt'
		}
		var client = mqtt.connect(options);
		client.on('connect', function (){
			console.log("connect ok");
			client.publish("test", "test OK");
		});
		return "PUB_OK"
	}
};

module.exports = test;
