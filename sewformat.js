(function (global) {
    "use strict";
    function sewDecode(inputByte) {
        return (inputByte >= 0x80) ?  ((-(~inputByte & 0xFF)) - 1) : inputByte;
    }
    function sewRead(file, pattern) {
        var i,
            fileLength = 0,
            dx = 0,
            dy = 0,
            flags = 0,
            numberOfColors = 0,
            thisStitchIsJump = 0,
            b0 = 0,
            b1 = 0,
            colors = global.jefColors;

        fileLength = file.byteLength;
        numberOfColors = file.getUint8();
        numberOfColors += (file.getUint8() << 8);

        for (i = 0; i < numberOfColors; i += 1) {
		    var colorIndex = file.getInt16(file.tell(), true);
            pattern.addColor(colors[colorIndex]);
        }
        file.seek(0x1D78);
        for (i = 0; file.tell() < fileLength; i += 1) {
            b0 = file.getUint8();
            b1 = file.getUint8();
            flags = global.stitchTypes.normal;
            if (thisStitchIsJump) {
                flags = global.stitchTypes.trim;
                thisStitchIsJump = 0;
            }
            if (b0 === 0x80) {
                if (b1 === 1) {
                    b0 = file.getUint8();
                    b1 = file.getUint8();
                    flags = global.stitchTypes.stop;
                } else if ((b1 === 0x02) || (b1 === 0x04)) {
                    thisStitchIsJump = 1;
                    b0 = file.getUint8();
                    b1 = file.getUint8();
                    flags = global.stitchTypes.trim;
                } else if (b1 === 0x10) {
                    break;
                }
            }
            dx = sewDecode(b0);
            dy = sewDecode(b1);
            if (Math.abs(dx) === 127 || Math.abs(dy) === 127) {
                thisStitchIsJump = 1;
                flags = global.stitchTypes.trim;
            }
            pattern.addStitchRel(dx, dy, flags, true);
        }
        pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
        pattern.invertPatternVertical();
        return true;
    }
    global.sewRead = sewRead;
}(this));