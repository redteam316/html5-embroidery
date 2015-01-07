(function (global) {
	"use strict";
    Color = global.Color;
    
    function pcsDecode(a1, a2, a3) {
        var res = a1 + (a2 << 8) + (a3 << 16);
        if(res > 0x7FFFFF) {
            return (-((~(res) & 0x7FFFFF) - 1));
        }
        return res;
    }

    // function pcsEncode(file, dx, dy, flags) {
        // var flagsToWrite = 0;
        // if(!file) { embLog_error("format-pcs.c pcsEncode(), file argument is null\n"); return; }
        // binaryWriteByte(file, (unsigned char)0);
        // binaryWriteByte(file, (unsigned char)(dx & 0xFF));
        // binaryWriteByte(file, (unsigned char)((dx >> 8) & 0xFF));
        // binaryWriteByte(file, (unsigned char)((dx >> 16) & 0xFF));

        // binaryWriteByte(file, (unsigned char)0);
        // binaryWriteByte(file, (unsigned char)(dy & 0xFF));
        // binaryWriteByte(file, (unsigned char)((dy >> 8) & 0xFF));
        // binaryWriteByte(file, (unsigned char)((dy >> 16) & 0xFF));
        // if(flags & STOP)
        // {
            // flagsToWrite |= 0x01;
        // }
        // if(flags & TRIM)
        // {
            // flagsToWrite |= 0x04;
        // }
        // binaryWriteByte(file, flagsToWrite);
    // }

    function pcsRead(file, pattern) {
        var allZeroColor = 1,
            i,
            r,
            g,
            b,
            b = [],
            dx = 0,
            dy = 0,
            flags = 0,
            st = 0,
            version,
            hoopSize,
            colorCount,
            t = { color: {}};
        if (!pattern) {
            embLog("format-pcs.c readPcs(), pattern argument is null\n");
            return 0;
        }
        version = file.getUint8();
        hoopSize = file.getUint8();  /* 0 for PCD, 1 for PCQ (MAXI), 2 for PCS with small hoop(80x80), */
                                          /* and 3 for PCS with large hoop (115x120) */

        switch (hoopSize) {
        case 2:
            pattern.hoop.width = 80.0;
            pattern.hoop.height = 80.0;
            break;
        case 3:
            pattern.hoop.width = 115;
            pattern.hoop.height = 120.0;
            break;
        }

        colorCount = file.getUint16(file.tell(), true);

        for(i = 0; i < colorCount; i += 1) {
            r = file.getUint8();
            g = file.getUint8();
            b = file.getUint8();
            if(r || g || b) {
                allZeroColor = 0;
            }
            pattern.addColor(new Color(r,g,b,""));
            file.getUint8();
        }
        if (allZeroColor) {
            pattern.loadExternalColorFile(pattern, fileName);
        }
        st = file.getUint16(file.tell(), true);
        /* READ STITCH RECORDS */
        for(i = 0; i < st; i += 1) {
            flags = global.stitchTypes.normal;
            b = file.getBytes(9);
            if ((b[8] & 0x01) == 0x01) {
                flags = global.stitchTypes.stop;
            } else if ((b[8] & 0x04) === 0x04) {
                flags = global.stitchTypes.trim;
            }
            else if(b[8] !== 0) {
                /* TODO: ONLY INTERESTED IN THIS CASE TO LEARN MORE ABOUT THE FORMAT */
            }
            dx = pcsDecode(b[1], b[2], b[3]);
            dy = pcsDecode(b[5], b[6], b[7]);
            if (dx === 0 && dy === 0) {
                pattern.addStitchRel(dx, dy, flags, true);
            } else {
                pattern.addStitchAbs(dx, dy, flags, true);
            }
        }
        pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
        pattern.invertPatternVertical();
        return true;
    }

    // function writePcs(EmbPattern* pattern, const char* fileName) {
        // EmbStitchList* pointer = 0;
        // EmbThreadList* threadPointer = 0;
        // FILE* file = 0;
        // int i;
        // unsigned char colorCount;
        // double xx = 0.0, yy = 0.0;

        // if(!pattern) { embLog_error("format-pcs.c writePcs(), pattern argument is null\n"); return 0; }
        // if(!fileName) { embLog_error("format-pcs.c writePcs(), fileName argument is null\n"); return 0; }

        // file = fopen(fileName, "wb");
        // if(!file)
        // {
            // embLog_error("format-pcs.c writePcs(), cannot open %s for writing\n", fileName);
            // return 0;
        // }

        // binaryWriteByte(file, (unsigned char)'2');
        // binaryWriteByte(file, 3); /* TODO: select hoop size defaulting to Large PCS hoop */
        // colorCount = (unsigned char)embThreadList_count(pattern->threadList);
        // binaryWriteUShort(file, (unsigned short)colorCount);
        // threadPointer = pattern->threadList;
        // i = 0;
        // while (threadPointer) {
            // EmbColor color = threadPointer->thread.color;
            // binaryWriteByte(file, color.r);
            // binaryWriteByte(file, color.g);
            // binaryWriteByte(file, color.b);
            // binaryWriteByte(file, 0);
            // threadPointer = threadPointer->next;
            // i++;
        // }

        // for (; i < 16; i += 1) {
            // binaryWriteUInt(file, 0); /* write remaining colors to reach 16 */
        // }

        // binaryWriteUShort(file, (unsigned short)embStitchList_count(pattern->stitchList));
        // /* write stitches */
        // xx = yy = 0;
        // pointer = pattern->stitchList;
        // while (pointer) {
            // pcsEncode(file, roundDouble(pointer->stitch.xx * 10.0), roundDouble(pointer->stitch.yy * 10.0), pointer->stitch.flags);
            // pointer = pointer->next;
        // }
        // return true;
    // }

	global.pcsRead = pcsRead;

}(this));