"use strict";

angular.module('kurves')
    .controller('GameCtrl', function($scope, socket, Game, Player) {
        // Listeners

        $scope.startGame = function() {
            socket.emit('start ready', {
                gameUrl: $scope.game.url
            });

            setTimeout(function() {
                $scope.game.start();

                socket.emit('start game', {
                    gameUrl: $scope.game.url
                });
            }, 3000);
        };

        // Sockets

        socket.on('connect', function() {
            socket.emit('new game');
        })

        socket.on('new game', function(data) {
            $scope.game = new Game(data.url, 500, 500, 'the-canvas');
            $scope.game.ctx.fillRect(0, 0, $scope.game.width, $scope.game.height, $scope.game.color);

            $scope.$apply();
        });

        socket.on('new player', function(data) {
            var player = new Player(data.playerId, $scope.game);
            $scope.game.players[player.id] = player;

            socket.emit('player confirmed', {
                gameUrl: $scope.game.url,
                playerId: player.id,
                playerColor: player.color
            });

            $scope.$apply();
        });

        socket.on('name player', function(data) {
            var player = $scope.game.players[data.playerId];
            if (!player) {
                return;
            }

            player.name = data.playerName;

            $scope.$apply();
        });

        socket.on('ready player', function(data) {
            var player = $scope.game.players[data.playerId];
            if (!player) {
                return;
            }

            player.ready = true;

            $scope.$apply();
        });

        socket.on('move player', function(data) {
            $scope.game.players[data.playerId].direction = data.playerDirection;

            $scope.$apply();
        });
    });