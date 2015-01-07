(function (global) {
    "use strict";
    function decodeExp(b2) {
        var returnCode = 0;
        if (b2 === 0xF3) {
            return global.stitchTypes.end;
        }
        if ((b2 & 0xC3) === 0xC3) {
            return global.stitchTypes.trim | global.stitchTypes.stop;
        }
        if (b2 & 0x80) {
            returnCode |= global.stitchTypes.trim;
        }
        if (b2 & 0x40) {
            returnCode |= global.stitchTypes.stop;
        }
        return returnCode;
    }

    function dstRead(file, pattern) {
        var flags,
            x,
            y,
            prevJump = false,
            thisJump = false,
            b = [],
            byteCount = file.byteLength;
        file.seek(512);
        while (file.tell() < (byteCount - 3)) {
            b[0] = file.getUint8();
            b[1] = file.getUint8();
            b[2] = file.getUint8();
            x = 0;
            y = 0;
            if (b[0] & 0x01) {
                x += 1;
            }
            if (b[0] & 0x02) {
                x -= 1;
            }
            if (b[0] & 0x04) {
                x += 9;
            }
            if (b[0] & 0x08) {
                x -= 9;
            }
            if (b[0] & 0x80) {
                y += 1;
            }
            if (b[0] & 0x40) {
                y -= 1;
            }
            if (b[0] & 0x20) {
                y += 9;
            }
            if (b[0] & 0x10) {
                y -= 9;
            }
            if (b[1] & 0x01) {
                x += 3;
            }
            if (b[1] & 0x02) {
                x -= 3;
            }
            if (b[1] & 0x04) {
                x += 27;
            }
            if (b[1] & 0x08) {
                x -= 27;
            }
            if (b[1] & 0x80) {
                y += 3;
            }
            if (b[1] & 0x40) {
                y -= 3;
            }
            if (b[1] & 0x20) {
                y += 27;
            }
            if (b[1] & 0x10) {
                y -= 27;
            }
            if (b[2] & 0x04) {
                x += 81;
            }
            if (b[2] & 0x08) {
                x -= 81;
            }
            if (b[2] & 0x20) {
                y += 81;
            }
            if (b[2] & 0x10) {
                y -= 81;
            }
            flags = decodeExp(b[2]);
            thisJump = flags & global.stitchTypes.jump;
            if (prevJump) {
                flags |= global.stitchTypes.jump;
            }
            pattern.addStitchRel(x, y, flags, true);
            prevJump = thisJump;
        }
        pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
        pattern.invertPatternVertical();
    }

    global.dstRead = dstRead;

}(this));
