(function (global) {
    "use strict";
    function vp3ReadString(file) {
        var stringLength = file.getInt16();
        return file.getString(stringLength);
    }

    function vp3Decode(inputByte) {
        return (inputByte > 0x80) ?  -(((~inputByte) + 1) & 0xFF) : inputByte;
    }

    function vp3DecodeInt16(inputByte) {
        return ((inputByte & 0xFFFF) >= 0x8000) ? -(((~inputByte) + 1) & 0xFFFF) : inputByte;
    }

    function vp3ReadHoopSection(file) {
        var hoop = {
            right : file.getInt32(),
            bottom : file.getInt32(),
            left : file.getInt32(),
            top : file.getInt32(),

            unknown1 : file.getInt32(),
            unknown2 : file.getInt32(),
            unknown3 : file.getInt32(),
            numberOfBytesRemaining : file.getInt32(),

            xOffset : file.getInt32(),
            yOffset : file.getInt32(),

            byte1 : file.getUint8(),
            byte2 : file.getUint8(),
            byte3 : file.getUint8(),

            /* Centered hoop dimensions */
            right2 : file.getInt32(),
            left2 : file.getInt32(),
            bottom2 : file.getInt32(),
            top2 : file.getInt32(),

            width : file.getInt32(),
            height : file.getInt32()
        };
        return hoop;
    }

    function vp3Read(file, pattern) {
        var magicString,
            some,
            someString = 0,
            unknownString3 = 0,
            numberOfColors,
            colorSectionOffset,
            magicCode,
            someShort,
            someByte,
            bytesRemainingInFile,
            unknownByteString = 0,
            hoopConfigurationOffset,
            unknownString2 = 0,
            stitchTypes = global.stitchTypes,
            i,
            r,
            g,
            b,
            tableSize,
            unknownX,
            unknownY,
            unknownX2,
            unknownY2,
            str1,
            str2,
            str3,
            unknownThreadString,
            numberOfBytesInColor,
            x,
            y;

        if (!pattern) {
            embLog("format-vp3.c readVp3(), pattern argument is null\n");
            return 0;
        }

        magicString = file.getBytes(5); /* %vsm% */

        some = file.getUint8(); /* 0 */
        someString = vp3ReadString(file);
        someShort = file.getInt16();
        someByte = file.getUint8();
        bytesRemainingInFile = file.getInt32();
        unknownByteString = vp3ReadString(file);
        hoopConfigurationOffset = file.tell();

        vp3ReadHoopSection(file);

        unknownString2 = vp3ReadString(file);
        file.seek(file.tell() + 18);

        magicCode = file.getBytes(6); /* 0x78 0x78 0x55 0x55 0x01 0x00 */

        unknownString3 = vp3ReadString(file);

        numberOfColors = file.getInt16();
        colorSectionOffset = file.tell();

        for (i = 0; i < numberOfColors; i += 1) {
            file.seek(0x03 + colorSectionOffset);
            colorSectionOffset = file.getInt32();
            colorSectionOffset += file.tell();
            unknownX = file.getInt32();
            unknownY = file.getInt32();
            tableSize = file.getUint8();
            file.getUint8(); // changed this
            r = file.getUint8();
            g = file.getUint8();
            b = file.getUint8(); // added this
            pattern.addColor(new Color(r,b,g, ""));
            file.seek(file.tell() + 6 * tableSize - 1); // changed this

            str1 = vp3ReadString(file);
            str2 = vp3ReadString(file);
            str3 = vp3ReadString(file);

            unknownX2 = file.getInt32();
            unknownY2 = file.getInt32();
            unknownThreadString = file.getInt16();
            file.seek(file.tell() + unknownThreadString);
            numberOfBytesInColor = file.getInt32();
            file.seek(file.tell() + 0x3);
            while (file.tell() < colorSectionOffset - 1) {
                x = vp3Decode(file.getUint8());
                y = vp3Decode(file.getUint8());
                if (x === 0x80) {
                    switch (y) {
                    case 0x00:
                    case 0x03:
                        break;
                    case 0x01:
                        x = vp3DecodeInt16(file.getInt16());
                        y = vp3DecodeInt16(file.getInt16());
                        file.getInt16();
                        pattern.addStitchRel(x, y, stitchTypes.trim, true);
                        break;
                    default:
                        break;
                    }
                } else {
                    pattern.addStitchRel(x, y, stitchTypes.normal, true);
                }
            }
            if (i + 1 < numberOfColors) {
                pattern.addStitchRel(0, 0, stitchTypes.stop, true);
            }
        }
        pattern.addStitchRel(0, 0, stitchTypes.end, true);
    }

    global.vp3Read = vp3Read;

}(this));