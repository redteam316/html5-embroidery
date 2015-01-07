var message = [];
if (!window.FileReader) {
    message = '<p>The ' +
              '<a href="http://dev.w3.org/2006/webapi/FileAPI/" target="_blank">File API</a>s ' +
              'are not fully supported by this browser.</p>' +
              '<p>Upgrade your browser to the latest version.</p>';

    document.querySelector('body').innerHTML = message;
} else {
    document.getElementById('fileDropBox').addEventListener('dragover', handleDragOver, false);
    document.getElementById('fileDropBox').addEventListener('drop', handleFileSelection, false);
    document.getElementById('files').addEventListener('change', handleFileSelection, false);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

var button = document.getElementById('btn-download');
button.addEventListener('click', function (e) {
	var canvas = document.getElementById('mycanvas');
    var dataURL = canvas.toDataURL('image/png');
    button.href = dataURL;
	button.download = 'asdf.png';
});

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function displayFileText(filename, evt) {
    var view = new jDataView(evt.target.result, 0, evt.size);
    var pattern = new Pattern();
    filename = filename.toLowerCase();
    if (filename.endsWith("dst")) {
        dstRead(view, pattern);
	} else if (filename.endsWith("exp")) {            
        expRead(view, pattern);
    } else if (filename.endsWith("exy")) {            
        exyRead(view, pattern);
    } else if (filename.endsWith("jef")) {
        jefRead(view, pattern);
	} else if (filename.endsWith("pcs")) {
        pcsRead(view, pattern);
    } else if (filename.endsWith("pec")) {
        pecRead(view, pattern);
	} else if (filename.endsWith("pes")) {
        pesRead(view, pattern);
	} else if (filename.endsWith("sew")) {
		sewRead(view, pattern);
    } else if (filename.endsWith("vp3")) {            
        vp3Read(view, pattern);
    } else if (filename.endsWith("xxx")) {            
        xxxRead(view, pattern);
    } else if (filename.endsWith("zsk") || filename.endsWith("z00")) { //NOTE: zsk format commonly uses z + 2 numbers starting with 00
        zskRead(view, pattern);
    }
    pattern.moveToPositive();
    pattern.drawShape(document.getElementById('mycanvas'));
}

function handleFileReadAbort(evt) {
    alert("File read aborted.");
}

function handleFileReadError(evt) {
    var message;
    switch (evt.target.error.name) {
        case "NotFoundError":
            alert("The file could not be found at the time the read was processed.");
        break;
        case "SecurityError":
            message = "<p>A file security error occured. This can be due to:</p>";
            message += "<ul><li>Accessing certain files deemed unsafe for Web applications.</li>";
            message += "<li>Performing too many read calls on file resources.</li>";
            message += "<li>The file has changed on disk since the user selected it.</li></ul>";
            alert(message);
        break;
        case "NotReadableError":
            alert("The file cannot be read. This can occur if the file is open in another application.");
        break;
        case "EncodingError":
            alert("The length of the data URL for the file is too long.");
        break;
        default:
            alert("File error code " + evt.target.error.name);
    }
}

function startFileRead(fileObject) {
    var reader = new FileReader();

    // Set up asynchronous handlers for file-read-success, file-read-abort, and file-read-errors:
    reader.onloadend = function (x) { displayFileText.apply(null, [fileObject.name, x]); }; // "onloadend" fires when the file contents have been successfully loaded into memory.
    reader.abort = handleFileReadAbort; // "abort" files on abort.
    reader.onerror = handleFileReadError; // "onerror" fires if something goes awry.

    if (fileObject) { // Safety first.
      reader.readAsArrayBuffer(fileObject); // Asynchronously start a file read thread. Other supported read methods include readAsArrayBuffer() and readAsDataURL().
    }
}

function handleFileSelection(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;

    if (!files) {
      alert("<p>At least one selected file is invalid - do not select any folders.</p><p>Please reselect and try again.</p>");
      return;
    }

    for (var i = 0, file; file = files[i]; i++) {
      if (!file) {
            alert("Unable to access " + file.name); 
            continue;
      }
      if (file.size == 0) {
            alert("Skipping " + file.name.toUpperCase() + " because it is empty.");
            continue;
      }
      startFileRead(file);
    }
}