var mongoose = require('mongoose');
var Nodes = mongoose.model('Nodes');
var Utilities = require('../config/utilities');
var async = require('async');
var exec = require('child_process').execFile;

exports.createNode = function(req, res) {
    var node = new Nodes(req.body);
    node.userId = req.user._id;
    node.save(function (err) {
        if(err) {
            res.jsonp(Utilities.response({}, Utilities.getErrorMessage(req, err)));
        } else {
            res.jsonp(Utilities.response({node}));
        }
    });
};

exports.getAllNodes = function (req, res) {

    var userId = req.user._id;
    async.series({
        van: function(cb) {
            Nodes.find({
                $and: [
                { userId: userId },
                { type: 1}
                ]})
            .select('-__v -userId -type')
            .exec(function (err, data) {
                if(err || !data) {
                    return cb(null);
                } else {
                    return cb(null, data);
                }
            });
        },
        pump: function(cb) {
            Nodes.find({
                $and: [
                { userId: userId },
                { type: 0}
                ]})
            .select('_id chanel estimatedTime')
            .exec(function (err, data) {
                if(err || !data) {
                    return cb(null);
                } else {
                    return cb(null, data);
                }
            });
        }
    }, function(err, results) {
        console.log(results.van[1].active);
        if (err) {
            var keys = Object.keys(results);
            var last = keys[keys.length - 1];
            return res.jsonp(Utilities.response({}, results[last]));
        } else {
            return res.jsonp(Utilities.response(results));
        }
    });
}

exports.getPresentNode = function (userId, activityType, estimatedTime, callback) {

    async.series({
        control: function(cb) {
            Nodes.find({
                $and: [
                { userId: userId },
                { type: 1}
                ]})
            .select('-__v -userId -type')
            .exec(function (err, data) {
                if(err || !data) {
                    return cb(null);
                } else {
                    var setType = 0;
                    var iNode = 0;
                    var crtData = "";
                    var control = [];
                    async.forEach(data, function(item) {
                        crtData += "0" + item.chanel + "00";
                        setType++;
                        iNode++;
                        if(setType == activityType || data.length == iNode){
                            setType = 0;
                            var crt = { 
                                estimatedTime: estimatedTime, 
                                node: [
                                {
                                    nodeIp: "01",
                                    crtData: crtData,
                                    nVan: "06"
                                }
                                ] 
                            };
                            control.push(crt);
                            crtData = "";
                        }

                    });
                    return cb(null, control);
                }
            });

        },
        activityType: function (cb) {
            return cb(null, "0" + activityType);
        }
    }, function(err, results) {
        if (err) {
            var keys = Object.keys(results);
            var last = keys[keys.length - 1];
            return callback(results[last]);
        } else {
            return callback(results);
        }
    });
}


exports.setNode = function (req, res) {
    var nodeId = req.body.nodeId;
    var time =  req.body.estimatedTime;
    if (time == null) {
        return res.jsonp(Utilities.response({},"Chua nhap estimatedTime cho node!"));
    } else {
        Nodes.findById(nodeId, function (err, node) {
            if(err || !node) {
                res.jsonp(Utilities.response({},"Khong ton tai node!"));
            } else {
                node.estimatedTime = time;
                node.active = 0;
                node.save(function (err) {
                    if(err) {
                        res.jsonp(Utilities.response({},"Khong cap nhat duoc node!"));
                    } else {
                        res.jsonp(Utilities.response({node},"Cap nhat node thanh cong"));
                    }
                });
            }
        });
    }    
}


exports.test = function (req, res) {
    var io = require('socket.io-client');
    var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzllOWJhMzcxNzgxMWUwMjA3NTI1OGIiLCJ1c2VybmFtZSI6InR1YW4iLCJhdmF0YXIiOiJmZW1hbGUucG5nIiwiaWF0IjoxNDcwMDEzMDU0fQ.wb5Vv6pJc9HVF_YKkZLYHi0zT3EebAMIQz0apobDQq0';
    var socket = io.connect('http://localhost:3000?token=' + token, {reconnect: true});
    Nodes.find({}, function (err, nodes) {
        if(err || !nodes) {
            
        } else {
            async.forEach(nodes, function(node) {

                node.active = 0;
                node.save();
            });

        }
    });

    
   


    socket.emit('chat', {
        activityType:req.body.type,
        estimatedTime:req.body.estimatedTime
    });
    res.jsonp(Utilities.response());
}