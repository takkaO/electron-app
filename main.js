"use strict";

const { app, BrowserWindow } = require("electron");

let mainWindow = null;


function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {nodeIntegration: true}
	});
	
	mainWindow.loadFile("index.html");
	//mainWindow.webContents.openDevTools();

	mainWindow.on('closed', function(){
		mainWindow = null;
	});
};


app.on('window-all-closed', function(){
	if(process.platform !== 'darwin'){
		app.quit();
	}
});

app.on("ready", createWindow);


app.on('activate', function(){
	if (mainWindow === null){
		createWindow();
	}
});

