"use strict";

angular.module('kurves')
    .factory('socket', function() {
       var socket = io('/', { secure: true });

        return socket;
    });