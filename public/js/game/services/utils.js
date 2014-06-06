"use strict";

angular.module('kurves')
    .factory('Utils', function() {
        function matchColor(xy, color, ctx) {
            var p = ctx.getImageData(xy[0], xy[1], 1, 1).data;
            var hex = 0 === p[3] ? '#ffffff' : '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6);

            return hex === color;
        }

        function matchColors(xy, colors, ctx) {
            var match = false;

            colors.forEach(function(color) {
                if (matchColor(xy, color, ctx)) {
                    match = true;
                }
            });

            return match;
        }

        function rgbToHex(r, g, b) {
            return ((r << 16) | (g << 8) | b).toString(16);
        }

        var Utils = {
            matchColor: matchColor,
            matchColors: matchColors,
            rgbToHex: rgbToHex
        };

        return Utils;
    });