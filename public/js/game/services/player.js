"use strict";

angular.module('kurves')
    .factory('Player', function() {
        function Player(id, game) {
            this.id = id;
            this.game = game;
            this.name = 'Nameless';
            this.direction = null;
            this.x = Math.floor(Math.random() * (game.width - 60)) + 30;
            this.y = Math.floor(Math.random() * (game.height - 60)) + 30;
            this.angle = Math.random() * Math.PI * 2;
            this.alive = true;
            this.color = (function() {
                var length = game.playerColors.length;
                var color = game.playerColors.splice(Math.floor(Math.random() * length), 1)[0];
                game.activeColors.push(color);
                return color;
            })();
            this.ready = false;
        }

        Player.prototype.reset = function() {
            this.direction = null;
            this.x = Math.floor(Math.random() * (this.game.width - 60)) + 30;
            this.y = Math.floor(Math.random() * (this.game.height - 60)) + 30;
            this.angle = Math.random() * Math.PI * 2;
            this.alive = true;
        };

        return Player;
    });