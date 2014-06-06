"use strict";

angular.module('kurves')
    .factory('socket', function() {
       var socket = io();

        return socket;
    });