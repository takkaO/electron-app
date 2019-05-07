"use strict";

const {remote, BrowserWindow} = require('electron');
var mainWindow = BrowserWindow.getFocusedWindow();
const serialPort = require("serialport");
const Readline = require('@serialport/parser-delimiter');
var sp = null;
var parser = null;
/*
function(err, ports) {
	//console.log(ports);
	ports.forEach(function(port){
	  console.log(port.comName);
	});
}
*/
function callbackSerialPortInfo(ports){
	//console.log(ports);
	// レンダに送る
	mainWindow.webContents.send('ch_serialport_info', ports);
}

var getSerialPortInfo = function(callback) {
	serialPort.list(function(err, ports){
		callback(ports);
	});
}

const serialUtils = {
	testout: function (){
		console.log("Hello");
		
		getSerialPortInfo(callbackSerialPortInfo);

		return "OKOK";
	},

	fetchSerialPortInfo: function (){
		getSerialPortInfo(callbackSerialPortInfo);
	},

	attachSerialPort: function(port, baud){
		sp = new serialPort(port, {
			baudRate: baud,
			dataBits: 8,
			stopBits: 1,
			parity: "none",
		});
		
		//portの方がいい？
		parser = sp.pipe(new Readline({delimiter: '\n'}));

		parser.on('data', data => mainWindow.webContents.send('ch_serialport_show', "data", String(data)));
		
		sp.on("open", function(){
			var msg = "Serial port open.";
			mainWindow.webContents.send('ch_serialport_show', "open", msg);
		});

		sp.on("close", function(){
			var msg = "Serial port close.";
			mainWindow.webContents.send('ch_serialport_show', "close", msg);
		});

		sp.on("error", function(err){
			mainWindow.webContents.send('ch_serialport_show', "error", err.message);
			//console.log(err.message);
		});
		
	},

	detachSerialPort: function(){
		if (sp === null){
			return;
		}
		sp.close();
		sp = null; //必要ないかも
		//console.log("close");
	}
};

module.exports = serialUtils;
