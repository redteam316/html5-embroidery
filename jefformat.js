(function (global) {
    "use strict";
    var Color = global.Color,
        colors = [
            new Color(0, 0, 0, "Black"),
            new Color(0, 0, 0, "Black"),
            new Color(255, 255, 255, "White"),
            new Color(255, 255, 23, "Yellow"),
            new Color(250, 160, 96, "Orange"),
            new Color(92, 118, 73, "Olive Green"),
            new Color(64, 192, 48, "Green"),
            new Color(101, 194, 200, "Sky"),
            new Color(172, 128, 190, "Purple"),
            new Color(245, 188, 203, "Pink"),
            new Color(255, 0, 0, "Red"),
            new Color(192, 128, 0, "Brown"),
            new Color(0, 0, 240, "Blue"),
            new Color(228, 195, 93, "Gold"),
            new Color(165, 42, 42, "Dark Brown"),
            new Color(213, 176, 212, "Pale Violet"),
            new Color(252, 242, 148, "Pale Yellow"),
            new Color(240, 208, 192, "Pale Pink"),
            new Color(255, 192, 0, "Peach"),
            new Color(201, 164, 128, "Beige"),
            new Color(155, 61, 75, "Wine Red"),
            new Color(160, 184, 204, "Pale Sky"),
            new Color(127, 194, 28, "Yellow Green"),
            new Color(185, 185, 185, "Silver Grey"),
            new Color(160, 160, 160, "Grey"),
            new Color(152, 214, 189, "Pale Aqua"),
            new Color(184, 240, 240, "Baby Blue"),
            new Color(54, 139, 160, "Powder Blue"),
            new Color(79, 131, 171, "Bright Blue"),
            new Color(56, 106, 145, "Slate Blue"),
            new Color(0, 32, 107, "Nave Blue"),
            new Color(229, 197, 202, "Salmon Pink"),
            new Color(249, 103, 107, "Coral"),
            new Color(227, 49, 31, "Burnt Orange"),
            new Color(226, 161, 136, "Cinnamon"),
            new Color(181, 148, 116, "Umber"),
            new Color(228, 207, 153, "Blonde"),
            new Color(225, 203, 0, "Sunflower"),
            new Color(225, 173, 212, "Orchid Pink"),
            new Color(195, 0, 126, "Peony Purple"),
            new Color(128, 0, 75, "Burgundy"),
            new Color(160, 96, 176, "Royal Purple"),
            new Color(192, 64, 32, "Cardinal Red"),
            new Color(202, 224, 192, "Opal Green"),
            new Color(137, 152, 86, "Moss Green"),
            new Color(0, 170, 0, "Meadow Green"),
            new Color(33, 138, 33, "Dark Green"),
            new Color(93, 174, 148, "Aquamarine"),
            new Color(76, 191, 143, "Emerald Green"),
            new Color(0, 119, 114, "Peacock Green"),
            new Color(112, 112, 112, "Dark Grey"),
            new Color(242, 255, 255, "Ivory White"),
            new Color(177, 88, 24, "Hazel"),
            new Color(203, 138, 7, "Toast"),
            new Color(247, 146, 123, "Salmon"),
            new Color(152, 105, 45, "Cocoa Brown"),
            new Color(162, 113, 72, "Sienna"),
            new Color(123, 85, 74, "Sepia"),
            new Color(79, 57, 70, "Dark Sepia"),
            new Color(82, 58, 151, "Violet Blue"),
            new Color(0, 0, 160, "Blue Ink"),
            new Color(0, 150, 222, "Solar Blue"),
            new Color(178, 221, 83, "Green Dust"),
            new Color(250, 143, 187, "Crimson"),
            new Color(222, 100, 158, "Floral Pink"),
            new Color(181, 80, 102, "Wine"),
            new Color(94, 87, 71, "Olive Drab"),
            new Color(76, 136, 31, "Meadow"),
            new Color(228, 220, 121, "Mustard"),
            new Color(203, 138, 26, "Yellow Ochre"),
            new Color(198, 170, 66, "Old Gold"),
            new Color(236, 176, 44, "Honeydew"),
            new Color(248, 128, 64, "Tangerine"),
            new Color(255, 229, 5, "Canary Yellow"),
            new Color(250, 122, 122, "Vermillion"),
            new Color(107, 224, 0, "Bright Green"),
            new Color(56, 108, 174, "Ocean Blue"),
            new Color(227, 196, 180, "Beige Grey"),
            new Color(227, 172, 129, "Bamboo")];

    function jefDecode(inputByte) {
        return (inputByte >= 0x80) ?  ((-(~inputByte & 0xFF)) - 1) : inputByte;
    }

    function jefRead(file, pattern) {
        var flags,
            b0,
            b1,
            dx,
            dy,
            i,
            stitchCount = 0,
            numberOfColors,
            numberOfStitches;

        file.seek(24);
        numberOfColors = file.getInt32(file.tell(), true);
        numberOfStitches = file.getInt32(file.tell(), true);
        file.seek(file.tell() + 84);

        for (i = 0; i < numberOfColors; i += 1) {
            pattern.addColor(colors[file.getUint32(file.tell(), true) % 78]);
        }
        for (i = 0; i < (6 - numberOfColors); i += 1) {
            file.getUint32();
        }

        while (stitchCount < numberOfStitches + 100) {
            flags = global.stitchTypes.normal;
            b0 = file.getUint8();
            b1 = file.getUint8();

            if (b0 === 0x80) {
                if (b1 & 0x01) {
                    b0 = file.getUint8();
                    b1 = file.getUint8();
                    flags = global.stitchTypes.stop;
                } else if (b1 === 0x02 || b1 === 0x04) {
                    b0 = file.getUint8();
                    b1 = file.getUint8();
                    flags = global.stitchTypes.trim;
                } else if (b1 === 0x10) {
                    pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
                    break;
                }
            }
            dx = jefDecode(b0);
            dy = jefDecode(b1);
            pattern.addStitchRel(dx, dy, flags, true);
            stitchCount += 1;
        }
        pattern.invertPatternVertical();
    }

    global.jefRead = jefRead;

}(this));

