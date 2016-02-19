# micro-app-electron-launcher

This project provides a launcher for applications built with 
the micro-app framework (https://github.com/mhdawson/micro-app-framework)
using electron (http://electron.atom.io/).  This provides the following 
advantages over simply opening the applications in a brower:

* It eliminates the browser address bar and makes the app look like 
  a native application
* You can configure the starting positions for the windows
* You can start all of your micro apps with a simple npm start

This is an example of the visual difference:

![electron/non-electron visual comparison](https://raw.githubusercontent.com/mhdawson/micro-app-electron-launcher/master/pictures/electron-launch-example.jpg)


Of course you can access the same micro app using either the
electron launch method or a browers so you can have a native
look at fell on some machines and still be able to remotely
access the app from other machines with only the browser
installed.


# Installation

You will need Node.js 4.X or higher installed on on the path

The easiest way is to install is using:

<PRE>
npm install micro-app-electron-launcher
</PRE>

Alternatively you can clone this repo and then run npm install

# Configuration

To configure the micro-apps started you specify them in the file
called config.json.

For example this is my config :

<PRE>
{ "apps": [
    { "name": "home dashboard",
      "hostname": "X.X.X.X",
      "port": "8081",
      "options": { "x": 3350, "y": 10, "resizable": false }
    },
    { "name": "phone",
      "hostname": "X.X.X.X",
      "port": "8083",
      "options": { "x": 15, "y": 1850, "sizable": false }
    },
    { "name": "Alert Dashboard",
      "hostname": "X.X.X.X",
      "port": "8084",
      "options": { "x": 3065, "y": 10, "sizable": false }
    },
    { "name": "totp",
      "tls": true,
      "hostname": "X.X.X.X",
      "port": "8082",
      "auth": "asdkweivnaliwerld8welkasdfiuwerasdkllsdals9=",
      "options": { "x": 2920, "y": 10, "sizable": false }
    }
  ]
}
</PRE>

The values you can configure for each micro-app are as follows:

* name - any name you want to assign to the entry
* hostname - hostname where the microapp is running
* port - port on which micro-app is listening
* tls - true if the micro-app requires tls for connections,
        false othewise
* options - any of the electron window options.  In particular
            x and y let you specify the starting position and
            sizable lets you set whether the window can be
            resized or not.
* auth - if the micro-app requires authentication then you
         must provide the password for the micro-app
         encrypted using the enc_config_value.js utility
         When you start the launcher you will be prompted
         for the password used to generate the key for the
         encryption. 

# Running

To run use:

<PRE>
  npm run
</PRE>

You will be prompted for a password that must match
the one used to encrypt any of the "auth" values in 
config.json



