(function (global) {
    "use strict";
    function zskRead(file, pattern) {
        var rr,
            gg,
            bb,
            b = [],
            stitchType,
            colorNumber = 0,
            byteCount = file.byteLength,
            Color = global.Color;

        file.seek(0x230);
        colorNumber = file.getUint8();
        while (colorNumber !== 0) {
            rr = file.getUint8();
            gg = file.getUint8();
            bb = file.getUint8();
            pattern.addColor(new Color(rr, gg, bb, ""));
            file.seek(file.tell() + 0x48);
            colorNumber = file.getUint8();
        }
        file.seek(file.tell() + 0x2E);

        while (file.tell() < (byteCount - 3)) {
            b[0] = file.getUint8();
            b[1] = file.getUint8();
            b[2] = file.getUint8();
            stitchType = global.stitchTypes.normal;
            if (b[0] & 0x4) {
                b[2] = -b[2];
            }
            if (b[0] & 0x8) {
                b[1] = -b[1];
            }
            if (b[0] & 0x02) {
                stitchType = global.stitchTypes.jump;
            }
            if (b[0] & 0x20) {
                if (b[1] === 2) {
                    stitchType = global.stitchTypes.trim;
                } else {
                    if (b[1] === -1) {
                        break;
                    }
                    if (b[2] !== 0) {
                        colorNumber = b[2];
                    }
                    stitchType = global.stitchTypes.stop;
                    //pattern.changeColor(pattern, colorNumber - 1); //TODO: port this function
                }
                b[1] = 0;
                b[2] = 0;
            }
            pattern.addStitchRel(b[1] / 10.0, b[2] / 10.0, stitchType, true);
        }
        pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
        pattern.invertPatternVertical();
        return true;
    }
    global.zskRead = zskRead;
}(this));