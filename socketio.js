var Config = require('./config/config');
var Utilities = require('./config/utilities');

var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var Nodes = mongoose.model('Nodes');
var NodesControllers = require('./controllers/nodes');
var async = require('async');

function connectIO(server) {
    global.io = require('socket.io')(server);
    var socketioJwt = require('socketio-jwt');
    var redis = require('socket.io-redis');
    var store = require('redis').createClient();

    global.io.adapter(redis({
        host: Config.Env[process.env.NODE_ENV].Redis.Host,
        port: Config.Env[process.env.NODE_ENV].Redis.Port
    }));

    global.io.use(socketioJwt.authorize({
        secret: Config.JWTSecret,
        handshake: true
    }));

    // On connect
    global.io.on('connection', function (socket) {
        var userInfo = socket.decoded_token;
        userInfo.iat = undefined;
        delete userInfo.iat;
        var deviceInfo = {};
        console.log('********** socket id ' + socket.id + ' with username ' + userInfo.username + ' connected');

        // Save client data to redis with key is userId
        updateRedisData();

        /* *************************** EVENTS ******************************** */

        // On send message chat
        socket.on('chat', function (data) {
            var activityType = data.activityType;
            var estimatedTime = data.estimatedTime;
            NodesControllers.getPresentNode(userInfo._id, activityType, estimatedTime, function (data) {
                console.log(data);
                socket.broadcast.emit('chat', data);
            });
            
        });


        socket.on('updateNode', function (data) {
            console.log("Log data", data);
            var callback = parseInt(data);


            if(callback == 81){
                console.log('Anten mat ket noi');
                socket.broadcast.emit('updateNode', callback);
            } else 
            {
                var nodeIp = parseInt(data.substring(0, 2));
                var detailData = data.substring(2);
                for (i = 0; i < 4; i++) { 
                    var nodeChanel = detailData.substring(i*4, i*4+2);
                    console.log("nodeChanel", nodeChanel);
                    if(parseInt(nodeChanel)!= 0){
                        finishNode(nodeIp);
                        updateNode(nodeChanel, nodeIp);
                    }
                } 
            }

            
        });


        // On disconnect app
        socket.on('disconnect', function() {
            console.log('********** socket id ' + socket.id + ' with username ' + userInfo.username + ' disconnected');
            updateUser(userInfo._id);
        });

        /* *************************** ACTIONS ******************************** */


        function updateNode(nodeChanel, nodeIp) {
            Nodes.findOne({
                $and: [
                { userId: userInfo._id },
                { chanel: nodeChanel},
                { nodeIp: nodeIp}
                ]})
            .select('-__v')
            .exec(function (err, node) {
                if(err || !node) {
                    console.log('Node ko ton tai!');
                    socket.broadcast.emit('updateNode', -3);
                } else {

                    if (node.active == 0) {
                        console.log("Cap nhat active node");
                        node.active = 1;
                        node.isOn = true;
                    } 
                    node.save(function (err) {
                        if(err) {
                            console.log('Cap nhat node that bai');
                            socket.broadcast.emit('updateNode', 1);
                        } else {
                            console.log('Cap nhat node thanh cong');
                            socket.broadcast.emit('updateNode', 1);
                        }
                    });

                }
            });
        }

        function finishNode(nodeIp) {

            Nodes.findOne({
                $and: [
                { userId: userInfo._id },
                { nodeIp: nodeIp},
                { active: 1}
                ]})
            .select('-__v')
            .exec(function (err, node) {
                if(err || !node) {
                    console.log('Node ko ton tai!');
                    socket.broadcast.emit('updateNode', -3);
                } else {

                    console.log("Finish node");
                    node.active = 10;
                    node.isOn = true;
                    node.save(function (err) {
                        if(err) {
                            console.log('Cap nhat node that bai');
                            socket.broadcast.emit('updateNode', -2);
                        } else {
                            console.log('Cap nhat node thanh cong');
                            socket.broadcast.emit('updateNode', -1);
                        }
                    });

                }
            });
        }
        // Update redis data
        function updateRedisData() {
            store.get(userInfo._id, function (err, data) {
                var clientData;
                if (data) {
                    clientData = JSON.parse(data);
                    clientData.socketId.push(socket.id);
                } else {
                    clientData = {
                        'socketId': [socket.id],
                        'userInfo': JSON.stringify(userInfo)
                    };
                }
                store.set(userInfo._id, JSON.stringify(clientData));
            });
        }



        // Update user latest active time
        function updateUser(userId) {
            async.series({
                updateRedis: function(cb) {
                    store.get(userInfo._id, function (err, data) {
                        if (data) {
                            var clientData = JSON.parse(data);

                            // If have only 1 socket, delete key
                            if (clientData.socketId.length === 1) {
                                store.del(userInfo._id);
                            } else {
                                // Find current user index
                                var index = clientData.socketId.indexOf(socket.id);
                                // Remove out of array
                                clientData.socketId.splice(index, 1);
                                store.set(userInfo._id, JSON.stringify(clientData));
                            }
                        }
                        return cb();
                    });
                }
            });
        }
    });
}

exports = module.exports = connectIO;
