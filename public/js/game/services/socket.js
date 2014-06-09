"use strict";

angular.module('kurves')
    .factory('SocketFactory', function() {
        var SocketFactory = {
            getNewSocket: function() {
                var socket = io('/', { secure: true, multiplex: false });
                return socket;
            }
        }

        return SocketFactory;
    });