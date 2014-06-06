"use strict";

angular.module('kurves', ['ui.router'])
	.config(function($stateProvider) {
		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'templates/home.html'
			})
			.state('game', {
				url: '/game',
				templateUrl: 'templates/game.html',
				abstract: true,
				controller: 'GameCtrl'
			})
			.state('game.lobby', {
				url: '/lobby',
				templateUrl: 'templates/game.lobby.html'
			})
            .state('game.play', {
                url: '/play',
                templateUrl: 'templates/game.play.html'
            });
	});