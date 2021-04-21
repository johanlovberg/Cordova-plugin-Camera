
document.addEventListener('deviceready', onDeviceReady, false);
document.getElementById("buttonStart").onclick = startFileCreation;
document.getElementById("buttonStop").onclick = stopCamera;
var globalFileEntry = "";
var timeStamp = 0;
let options  = {
    CameraFacing:"back",
    fps:30,
    flashMode:true,
    use:'data',
canvas: {
    width:150,height:150
    },
capture: { 
    width:150,height:150
    },
    onBeforeDraw:function(frame) { 

        },
    onAfterDraw:function(frame) {
    getAverageRGB(frame.element.getContext("2d"));

    }
};

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    var objcanvas = document.getElementById("canvas");
    window.plugin.CanvasCamera.initialize(objcanvas);
}

function startFileCreation(){
    var storageLocation = "";
    if (window.cordova && cordova.platformId !== "browser") {
        switch (device.platform) {
          case "Android":
            console.log("Android");
            storageLocation = cordova.file.externalDataDirectory;
            break;
          case "iOS":
            console.log("IOS");
            storageLocation = cordova.file.documentsDirectory;
            break;
        }

        var folderPath = storageLocation;
        window.resolveLocalFileSystemURL(folderPath,function(dirEntry) {
            console.log('file system open: ' + dirEntry.name);
            var tempName = Date.now();
            console.log(tempName);
            createFile(dirEntry, tempName + ".txt");
            startCamera();
         }, function (err) {
             console.error(err);
         });

    }
}
function createFile(dirEntry, fileName) {
    console.log(fileName);
dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
    globalFileEntry = fileEntry;
    console.log(fileEntry);
    console.log("I create file");
}, function (err) {
    console.error(err);
});

}

function startCamera(){
    console.log("I start camera")
    let flashlight = false;
    CanvasCamera.start(options,function(err){
        console.error(err);

    },function(data){
        timeStamp = Date.now();
         if(flashlight == false) {      //Workaround to get flashlight to start on iPhone.
             window.plugin.CanvasCamera.flashMode(true);
             flashlight = true;
         }
         
    });
}


 function writeFile(dataObj) {
    var isAppend=true;
    globalFileEntry.createWriter(function (fileWriter) {

    fileWriter.onerror = function (e) {
        console.log("Failed file read: " + e.toString());
    };

    if (isAppend) {
        try {
            fileWriter.seek(fileWriter.length);
        }
        catch (e) {
            console.log("file doesn't exist!");
        }
    }
    fileWriter.write(dataObj);
});
}

function readFile() { //Currenlty not used.

globalFileEntry.file(function (file) {
    var reader = new FileReader();

    reader.onloadend = function() {
/*         console.log("Successful file read: " + this.result); */
    };

    reader.readAsText(file);
}, console.log("Fel vid läsningen av fil"));
}


function getAverageRGB(frameElement){
    let R = 0;
    let G = 0;
    let B = 0;
    let count = 0;
    imgData = frameElement.getImageData(0, 0, 150, 150);
    let arr = imgData.data;
    let length = imgData.data.length;
    let avg = 0;
    for (let i = 0; i< length; i+= 4) {
        count ++;
        R = arr[i] * 0.299;
        G = arr[i + 1] * 0.587;
        B = arr[i + 2] * 0.114;
        avg += R+G+B;
    }
    avg = avg / count;
    dataObj = new Blob([avg+" "+ timeStamp+ "\n"], { type: 'text/plain' });
    writeFile(dataObj);
    
}

function stopCamera(){
    window.plugin.CanvasCamera.stop(function(error) {
        console.log('[CanvasCamera stop]', 'error', error);
    }, function(data) {
        console.log('[CanvasCamera stop]', 'data', data);
    });
}