(function (global) {
    "use strict";
    function tapDecode(b2) {
        if(b2 === 0xF3)
            return global.stitchTypes.end;
        switch(b2 & 0xC3)
        {
            case 0x03:
                return global.stitchTypes.normal;
            case 0x83:
                return global.stitchTypes.trim;
            case 0xC3:
                return global.stitchTypes.stop;
            default:
                return global.stitchTypes.normal;
        }
    }

    function tapRead(file, pattern) {
        var flags,
            x,
            y,
            b = [],
            byteCount = file.byteLength;

        while (file.tell() < (byteCount - 3)) {
            b[0] = file.getUint8();
            b[1] = file.getUint8();
            b[2] = file.getUint8();
            x = 0;
            y = 0;
            if (b[0] & 0x01)
                x += 1;
            if (b[0] & 0x02)
                x -= 1;
            if (b[0] & 0x04)
                x += 9;
            if (b[0] & 0x08)
                x -= 9;
            if (b[0] & 0x80)
                y += 1;
            if (b[0] & 0x40)
                y -= 1;
            if (b[0] & 0x20)
                y += 9;
            if (b[0] & 0x10)
                y -= 9;
            if (b[1] & 0x01)
                x += 3;
            if (b[1] & 0x02)
                x -= 3;
            if (b[1] & 0x04)
                x += 27;
            if (b[1] & 0x08)
                x -= 27;
            if (b[1] & 0x80)
                y += 3;
            if (b[1] & 0x40)
                y -= 3;
            if (b[1] & 0x20)
                y += 27;
            if (b[1] & 0x10)
                y -= 27;
            if (b[2] & 0x04)
                x += 81;
            if (b[2] & 0x08)
                x -= 81;
            if (b[2] & 0x20)
                y += 81;
            if (b[2] & 0x10)
                y -= 81;

            flags = tapDecode(b[2]);
            pattern.addStitchRel(x, y, flags, true); //TODO: I removed the divide by 10 scaling here. Renders like other formats but is it right?
            if(flags === global.stitchTypes.end)
                break;
        }
        pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
        pattern.invertPatternVertical();
    }
    global.tapRead = tapRead;

}(this));
