(function (global) {
	"use strict";
    function pecRead(file, pattern)
    {
        var colorChanges,
            i;
        file.seek(0x38);
        colorChanges = file.getUint8();
        for(i = 0; i <= colorChanges; i++) {
            pattern.addColor(global.pecColors[file.getUint8() % 65]);
        }
        file.seek(0x21C);
        global.pecReadStitches(file, pattern);
        return true;
    }
    global.pecRead = pecRead;
}(this));