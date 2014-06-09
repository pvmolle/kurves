"use strict";

angular.module('kurves')
    .controller('GameCtrl', function($scope, SocketFactory, Game, Player, $state, $timeout) {

        // Catch for incorrect routing

        if ($state.is('game.play') && !$scope.game) {
            $state.go('^.lobby');
        }

        // Socket
        var socket = SocketFactory.getNewSocket();

        // Listeners

        $scope.startGame = function() {
            $state.go('^.play');
        };

        $scope.restartGame = function() {
            $scope.game.reset();

            start();
        }

        function start() {
            $timeout(function() {
                $scope.game.lookupCanvas('the-canvas');
                $scope.game.placePlayers();
            }, 0);

            socket.emit('start ready', {
                gameUrl: $scope.game.url
            });

            $timeout(function() {
                $scope.game.start();

                socket.emit('start game', {
                    gameUrl: $scope.game.url
                });
            }, 3000);
        }

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if ('game.play' === toState.name && 'game.lobby' === fromState.name) {
                start();
            }
        });

        $scope.$on('finished', function() {
            socket.emit('end game', {
                gameUrl: $scope.game.url,
                gameWinnerId: $scope.game.winner.id
            });
        });

        // Sockets

        socket.on('connect', function() {
            socket.emit('new game');
        })

        socket.on('new game', function(data) {
            $scope.game = new Game($scope, data.url, 500, 500);

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

        socket.on('delete player', function(data) {
            var player = $scope.game.players[data.playerId];

                $scope.game.playerColors.push(player.color);

            delete $scope.game.players[data.playerId];

            $scope.$apply();
        });
    });