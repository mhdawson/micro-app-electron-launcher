// Copyright 2016 the project authors as listed in the AUTHORS file.
// All rights reserved. Use of this source code is governed by the
// license that can be found in the LICENSE file.
'use strict';
var http = require('http');
var https = require('https');
var os = require('os');
var util = require('util');
var path = require('path');
var CryptoJS = require('crypto-js');
var prompt = require('prompt');

// get configuration options
prompt.start();
prompt.get({ properties: { password: { hidden: true } } },
           (err, passwordPrompt) => {

  var config = require(path.join(__dirname, 'config.json'));

  var decryptConfigValue = function(value) {
    var passphrase = passwordPrompt.password + passwordPrompt.password;
    return CryptoJS.AES.decrypt(value, passphrase).toString(CryptoJS.enc.Utf8);
  }

  // object used to keep global reference to window objects alive
  // until window is closed
  var windows = new Object();

  const electron = require('electron');
  const app = electron.app;
  const BrowserWindow = electron.BrowserWindow;

  // for now don't verify the certificates as we know they 
  // simply the self-signed certificate for our server
  app.on('certificate-error', (event, webContents, url, error, certificate, callback ) => {
    event.preventDefault();
    callback(true);
  });

  // OS X specific stuff as recommended in the electron start guide
  app.on('window-all-closed', () => {
    // When all windows are closed, then quit
    if ('darwin' !== process.platform ) {
      app.quit();
    }
  });

  // There are some differences across the platforms so tweak windows
  // sizes as needed
  var platformHeightAdjust = -20;
  if (os.platform() === 'win32') {
    // on windows compensate for the menu bar we are removing but 
    // which seems to take up part of the space
    platformHeightAdjust = 20;
  }

  //function createWindow (urlPrefix, hostname, port, auth) {
  function createWindow (appConfig) {
    // setup based on configured options
    var httpHandler = http;
    var urlPrefix = "http://";
    if (appConfig.tls === true) {
      httpHandler = https;
      urlPrefix = "https://";
    }

    // setup the options for the window that will be created
    var windowOptions = appConfig.options;
    if (windowOptions === undefined) {
      windowOptions = new Object();
    }
    if (windowOptions.webPreferences === undefined) {
      windowOptions.webPreferences = new Object();
    }
    if (windowOptions.webPreferences.nodeIntegration === undefined) {
      // disable Node integration by default as its more secure
      // to not allow the application to access the environment
      windowOptions.webPreferences.nodeIntegration = false;
    } 
 
    var extraHeadersString = '';
    var extraHeadersObject;
    if (appConfig.auth !== undefined) {
      // the app must use basic authentication so set up the required
      // objects need to add the authentication header to the requests
      extraHeadersObject = { 'Authorization': 'Basic ' +
                              new Buffer(decryptConfigValue(appConfig.auth)).toString('base64') };
      extraHeadersString = 'Authorization: ' + extraHeadersObject.Authorization;
    }

    // first make the request to get the size of the window for the app 
    var req = httpHandler.request({ 'hostname': appConfig.hostname,
                                    'port': appConfig.port,
                                     path: '/?size',
                                     rejectUnauthorized: false,
                                     headers: extraHeadersObject }, (res) => {
      var sizeData = '';
      res.on('data', (chunk) => {
        sizeData = sizeData + chunk;
      });

      res.on('end', () => {
        var sizes = JSON.parse(sizeData);
        windowOptions.width = sizes.width;
        windowOptions.height = sizes.height + platformHeightAdjust;
        var mainWindow = new BrowserWindow(windowOptions);
        windows[mainWindow] = mainWindow;

        // work around what looks like a bug in respecting the config
        if (windowOptions.resizable !== undefined) {
           mainWindow.setResizable(windowOptions.resizable); 
        }

        // we want minimal window without the menus
        mainWindow.setMenu(null);

        // ok all set up open the window now
        mainWindow.loadURL(urlPrefix + appConfig.hostname + ':' + appConfig.port + '?windowopen=y', 
                           { extraHeaders: extraHeadersString });

        // clean up
        mainWindow.on('closed', () => {
          windows[mainWindow] = null;
        });

        app.on('ready', () => { createWindow(appConfig) });

        // os specific stuff recommended by electron quickstart
        app.on('activate', () => {
          if (null === mainWindow) {
            createWindow(appConfig);
          }; 
        });

      });
    });
    req.end();
  };

  // launch all of the configured applications
  for (var i = 0; i < config.apps.length; i++) {
    createWindow(config.apps[i]);
  }
});
