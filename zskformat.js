(function (global) {
    "use strict";
    function zskRead(file, pattern) {
        var rr,
            gg,
            bb,
            b = [],
            stitchType,
            colorNumber = 0,
            byteCount = file.byteLength;

        file.seek(0x230);
        colorNumber = file.getUint8();
        while(colorNumber != 0)
        {
            rr = file.getUint8();
            gg = file.getUint8();
            bb = file.getUint8();
            pattern.addColor(new Color(rr, gg, bb, ""));
            file.seek(file.tell() + 0x48);
            colorNumber = file.getUint8();
        }
        file.seek(file.tell() + 0x2E);

        while(file.tell() < (byteCount - 3))
        {
            b[0] = file.getUint8();
            b[1] = file.getUint8();
            b[2] = file.getUint8();
            stitchType = global.stitchTypes.normal;
            if(b[0] & 0x4)
                b[2] = -b[2];
            if(b[0] & 0x8)
                b[1] = -b[1];
            if(b[0] & 0x02)
                stitchType = global.stitchTypes.jump;
            if(b[0] & 0x20)
            {
                if(b[1] === 2)
                    stitchType = global.stitchTypes.trim;
                else if(b[1] === -1)
                    break;
                else
                {
                    if(b[2] != 0)
                        colorNumber = b[2];
                    stitchType = global.stitchTypes.stop; //TODO: need to determine what b[1] is used for.
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



/*
//TODO:This is the C code for reference. Remove when everything is fully ported.

int readZsk(EmbPattern* pattern, const char* fileName)
{
    char b[3];
    EmbFile* file = 0;
    int stitchType;
    unsigned char colorNumber;
    if(!pattern) { embLog_error("format-zsk.c readZsk(), pattern argument is null\n"); return 0; }
    if(!fileName) { embLog_error("format-zsk.c readZsk(), fileName argument is null\n"); return 0; }

    file = embFile_open(fileName, "rb");
    if(!file)
    {
        embLog_error("format-zsk.c readZsk(), cannot open %s for reading\n", fileName);
        return 0;
    }

    embFile_seek(file, 0x230, SEEK_SET);
    colorNumber = binaryReadUInt8(file);
    while(colorNumber != 0)
    {
        EmbThread t;
        t.color.r = binaryReadUInt8(file);
        t.color.g = binaryReadUInt8(file);
        t.color.b = binaryReadUInt8(file);
        t.catalogNumber = "";
        t.description = "";
        embPattern_addThread(pattern, t);
        embFile_seek(file, 0x48, SEEK_CUR);
        colorNumber = binaryReadUInt8(file);
    }
    embFile_seek(file, 0x2E, SEEK_CUR);

    while(embFile_read(b, 1, 3, file) == 3)
    {
        stitchType = NORMAL;
        if(b[0] & 0x4)
            b[2] = -b[2];
        if(b[0] & 0x8)
            b[1] = -b[1];
        if(b[0] & 0x02)
            stitchType = JUMP;
        if(b[0] & 0x20)
        {
            if(b[1] == 2)
                stitchType = TRIM;
            else if(b[1] == -1)
                break;
            else
            {
                if(b[2] != 0)
                    colorNumber = b[2];
                stitchType = STOP; //TODO: need to determine what b[1] is used for.
                embPattern_changeColor(pattern, colorNumber - 1);

            }
            b[1] = 0;
            b[2] = 0;
        }
        embPattern_addStitchRel(pattern, b[1] / 10.0, b[2] / 10.0, stitchType, 0);
    }
    embFile_close(file);

    if(pattern->lastStitch->stitch.flags != END)
        embPattern_addStitchRel(pattern, 0, 0, END, 1);

    return 1;
}
*/


