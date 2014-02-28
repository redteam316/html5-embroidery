(function (global) {
    "use strict";
    function xxxDecodeByte(inputByte) {
        if (inputByte >= 0x80) {
            return (inputByte > 0x80) ?  -(((~inputByte) + 1) & 0xFF) : inputByte;
        }
        return inputByte;
    }

    function xxxRead(file, pattern) {
        var b0,
            b1,
            dx = 0,
            dy = 0,
            flags,
            endOfStream = 0,
            numberOfColors,
            paletteOffset,
            i,
            r,
            g,
            b,
            thisStitchJump = 0,
            lastStitch = 0,
            secondLast = 0,
            thread;

        if (!pattern) {
            embLog("format-xxx.c readXxx(), pattern argument is null\n");
            return 0;
        }

        file.seek(0x27);
        numberOfColors = file.getInt16(file.tell(), true);
        file.seek(0xFC);
        paletteOffset = file.getInt32(file.tell(), true);
        file.seek(paletteOffset + 6);

        for (i = 0; i < numberOfColors; i += 1) {
            file.getUint8();
            r = file.getUint8();
            g = file.getUint8();
            b = file.getUint8();
            pattern.addColor(new Color(r, g, b, ""));
        }
        file.seek(0x100);

        for (i = 0; !endOfStream && file.tell() < paletteOffset; i += 1) {
            flags = global.stitchTypes.normal;
            if (thisStitchJump) {
                flags = global.stitchTypes.trim;
            }
            thisStitchJump = 0;
            b0 = file.getUint8();
            b1 = file.getUint8();

            if (b0 === 0x7E || b0 === 0x7D) /* TODO: ARE THERE OTHER BIG JUMP CODES? */
            {
                dx = b1 + (file.getUint8() << 8);
                if ((dx & 0x8000) !== 0) {
                    dx = -~(dx & 0xFFFF) - 1;
                }
                dy = file.getInt16();
                flags = global.stitchType.trim;
            } else if (b0 === 0x7F) {
                if(b1 !== 0x17 && b1 != 0x46 && b1 >= 8) {
                    b0 = 0;
                    b1 = 0;
                    thisStitchJump = 1;
                    flags = global.stitchTypes.stop;
                } else if (b1 === 1) {
                    flags = global.stitchTypes.trim;
                    b0 = file.getUint8();
                    b1 = file.getUint8();
                } else {
                    continue;
                }
                dx = xxxDecodeByte(b0);
                dy = xxxDecodeByte(b1);
            } else {
                dx = xxxDecodeByte(b0);
                dy = xxxDecodeByte(b1);
            }
            pattern.addStitchRel(dx, dy, flags, true);
        }
        lastStitch = pattern.stitchList;
        secondLast = 0;
        if (lastStitch) {
            while (lastStitch.next !== null) {
                secondLast = lastStitch;
                lastStitch = lastStitch.next;
            }
            if ((!pattern.stitchList) && lastStitch.stitch.flags == global.stitchTypes.stop && secondLast) {
                lastStitch = 0;
                secondLast.next = NULL;
                pattern.changeColor(pattern, pattern.currentColorIndex - 1);
            }
        }
        pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
        pattern.invertPatternVertical();
        return true;
    }
    global.xxxRead = xxxRead;

}(this));