const {
    app,
    BrowserWindow
} = require('electron');

let demoLight;
let demoDark;
let demoChrome;

app.on('ready', () => {

    demoLight = new BrowserWindow()
    demoLight.loadURL(`file:///${__dirname}/demo-light.html`)
    demoLight.on('close', () => { demoLight = null })

    demoDark = new BrowserWindow()    
    demoDark.loadURL(`file:///${__dirname}/parent-main.html`)
    demoDark.on('close', () => { demoDark = null })  
    
    demoChrome = new BrowserWindow()    
    demoChrome.loadURL(`file:///${__dirname}/demo-chrome.html`)
    demoChrome.on('close', () => { demoChrome = null })    

});