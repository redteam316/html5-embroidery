(function (global) {
	"use strict";

	function expDecode(input) {
		return (input > 128) ? (-(~input & 255) - 1) : input;
	}

	var expRead = function (file, pattern) {
		var b0 = 0,
			b1 = 0,
			dx = 0,
			dy = 0,
			flags = 0,
			i = 0,
			byteCount = file.byteLength;
		while (i < byteCount) {
			flags = global.stitchTypes.normal;
			b0 = file.getInt8(i);
			i += 1;
			b1 = file.getInt8(i);
			i += 1;
			if (b0 === -128) {
				if (b1 & 1) {
					b0 = file.getInt8(i);
					i += 1;
					b1 = file.getInt8(i);
					i += 1;
					flags = global.stitchTypes.stop;
				} else if ((b1 === 2) || (b1 === 4)) {
					b0 = file.getInt8(i);
					i += 1;
					b1 = file.getInt8(i);
					i += 1;
					flags = global.stitchTypes.trim;
				} else if (b1 === -128) {
					b0 = file.getInt8(i);
					i += 1;
					b1 = file.getInt8(i);
					i += 1;
					b0 = 0;
					b1 = 0;
					flags = global.stitchTypes.trim;
				}
			}
			dx = expDecode(b0);
			dy = expDecode(b1);
			pattern.addStitchRel(dx, dy, flags, true);
		}
		pattern.addStitchRel(0, 0, global.stitchTypes.end);
		pattern.invertPatternVertical();
	};

	global.expRead = expRead;

}(this));