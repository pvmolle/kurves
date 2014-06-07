"use strict";

angular.module('kurves')
    .factory('Game', function(Utils, $rootScope) {
        function Game($scope, url, width, height) {
            this.$scope = $scope;
            this.url = url;
            this.width = width;
            this.height = height;
            this.canvas = null;
            this.ctx = null;
            this.players = {};
            this.color = '#000000';
            this.playerColors = ['#ff009e', '#ff2600', '#ff9300', '#87ff00', '#00ff61', '#00fdff', '#0043ff', '#bc00ff'];
            this.activeColors = ['#ffffff'];
            this.state = 'lobby';
            this.rafId =  null;
            this.winner = null;
        }

        Game.prototype.reset = function() {
            var self = this;

            this.playerColors = ['#ff009e', '#ff2600', '#ff9300', '#87ff00', '#00ff61', '#00fdff', '#0043ff', '#bc00ff'];
            this.activeColors = ['#ffffff'];
            this.state = 'playing';
            this.rafId =  null;
            this.winner = null;

            var playersList = Object.keys(this.players);
            playersList.forEach(function(id) {
                var p = self.players[id];

                p.reset();
            });
        };

        Game.prototype.lookupCanvas = function(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');

            this.canvas.width = this.width;
            this.canvas.height = this.height;

            this.ctx.fillRect(0, 0, this.width, this.height, this.color);
        };

        Game.prototype.allPlayersReady = function() {
            var self = this;

            var allPlayersReady = true;

            var playersList = Object.keys(this.players);
            playersList.forEach(function(id) {
                var p = self.players[id];

                allPlayersReady = allPlayersReady && p.ready;
            });

            return allPlayersReady;
        };

        Game.prototype.loop = function() {
            if (this.winner) {
                return;
            }

            var self = this;
            this.rafId = requestAnimationFrame(this.loop.bind(this));

            var playersAlive = [];

            var playersList = Object.keys(this.players);
            playersList.forEach(function(id) {
                var p = self.players[id];

                if (!p.alive) {
                    return;
                }

                // Player position

                if ('left' === p.direction) {
                    p.angle -= Math.PI / 60;
                } else if ('right' === p.direction) {
                    p.angle += Math.PI / 60;
                }

                p.x += Math.cos(p.angle);
                p.y += Math.sin(p.angle);

                var xToMeasure = p.x + (2 * Math.cos(p.angle));
                var yToMeasure = p.y + (2 * Math.sin(p.angle));

                var xy = [xToMeasure, yToMeasure];

                if (Utils.matchColors(xy, self.activeColors, self.ctx)) {
                    p.alive = false;
                }

                // Draw player

                self.ctx.fillStyle = p.color;

                self.ctx.beginPath();
                self.ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI, true);
                self.ctx.fill();

                if (p.alive) {
                    playersAlive.push(p);
                }
            });

            if (playersAlive.length < 2) {
                self.end(playersAlive[0]);
            }

            self.$scope.$apply();
        };

        Game.prototype.placePlayers = function() {
            var self = this;

            var playersList = Object.keys(this.players);
            playersList.forEach(function(id) {
                var p = self.players[id];

                // Draw player

                self.ctx.fillStyle = p.color;

                self.ctx.beginPath();
                self.ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI, true);
                self.ctx.fill();
            });
        };

        Game.prototype.start = function() {
            this.state = 'playing';
            this.loop();
        };

        Game.prototype.end = function(winner) {
            this.state = 'finished';
            cancelAnimationFrame(this.rafId);
            this.winner = winner;
            $rootScope.$broadcast('finished');
        }

        return Game;
    });