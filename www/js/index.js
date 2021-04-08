
document.addEventListener('deviceready', onDeviceReady, false);
document.getElementById("buttonStart").onclick = startFileCreation;
document.getElementById("buttonStop").onclick = stopCamera;
var globalFileEntry = "";
var timeStamp = 0;
var counter =0; 
var counter1 =0;
/* var ctx;  */
var options = {CameraFacing:"back", use: 'data',
canvas: {
    width: 100,height: 100
    },
capture: { 
    width: 100,height: 100
    },
fps:10,
/* flashMode:true, */
onBeforeDraw:function(frame) { 
    timeStamp = Date.now(); 
},
onAfterDraw:function(frame) {
    getAverageRGB(frame.element.getContext("2d"));
    }
};

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    var objcanvas = document.getElementById("canvas");
    /* ctx = objcanvas.getContext("2d"); */
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
    console.log("I create file");
}, function (err) {
    console.error(err);
});

}

function startCamera(){
    
    CanvasCamera.start(options,function(){
        console.log("Fel vid start av kamera");

    },function(data){
        

/*         console.log('[CanvasCamera start]', 'data', data); */
        
    });

}


function writeFile(dataObj) {
    
    var isAppend=true;
    
    globalFileEntry.createWriter(function (fileWriter) {
   /*  var buffer = Buffer(); */
    fileWriter.onwriteend = function() {
        /* console.log("Successful file read..."); */
 /*        readFile(); */
    };

    fileWriter.onerror = function (e) {
        /* console.log("Failed file read: " + e.toString()); */
    };


    if (isAppend) {
        try {
            fileWriter.seek(fileWriter.length);
        }
        catch (e) {
            /* console.log("file doesn't exist!"); */
        }
    }

   fileWriter.write(dataObj);
    /* console.log(this.buffer.toString); */
});

}

function readFile() {

globalFileEntry.file(function (file) {
    var reader = new FileReader();

    reader.onloadend = function() {
/*         console.log("Successful file read: " + this.result); */
/*         displayFileData(globalFileEntry.fullPath + ": " + this.result); */
    };

    reader.readAsText(file);
    /* console.log(this.result); */

}, console.log("Fel vid läsning"));
}

function getAverageRGB(frameElement){
    let R = 0;
    let G = 0;
    let B = 0;
    let count = 0;
    imgData = frameElement.getImageData(0, 0, 100, 100);
    let arr = imgData.data;
   /*  console.log(arr); */
    let length = imgData.data.length;
/*     console.log(length); */
    let avg = 0;
    for (let i = 0; i< length; i+= 4) {
        count ++;
        R += arr[i];
        G += arr[i +1];
        B += arr[i+2];
    }
/*     R = Math.floor((0.21*R)/count);
    G = Math.floor((0.72*G)/count);
    B = Math.floor((0.07*B)/count); */
    R = Math.round(R/count);
    G =  Math.round(G/count);
    B =  Math.round(B/count);
    avg = ((R+G+B) / 3);
    console.log(R +" "+ G +" "+ B +" "+ avg +" ");
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