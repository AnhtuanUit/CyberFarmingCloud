var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var Config = require('../config/config');
var Utilities = require('../config/utilities');
var jwt = require('jsonwebtoken');
var async = require('async');


// Middleware
exports.queryLeanUser = function(req, res, next, id) {
    Utilities.validateObjectId(id, function(isValid) {
        if (!isValid) {
            return res.status(404).jsonp(Utilities.response({}, 'Invalid user id', 404));
        } else {
            var populateFields = (req.user._id === id) ? Config.Populate.UserFull : Config.Populate.User;
            Users.findOne({
                '_id': id,
                'status': Config.User.Status.Active
            }).lean().select(populateFields).exec(function(err, user) {
                if (err) {
                    return res.jsonp(Utilities.response({}, Utilities.getErrorMessage(req, err)));
                } else if (!user) {
                    return res.status(404).jsonp(Utilities.response({}, 'User not found', 404));
                } else {
                    req.userData = user;
                    return next();
                }
            });
        }
    });
};

exports.queryUser = function(req, res, next, id) {
    Utilities.validateObjectId(id, function(isValid) {
        if (!isValid) {
            return res.status(404).jsonp(Utilities.response({}, 'Invalid user id', 404));
        } else {
            Users.findOne({
                '_id': id,
                'status': Config.User.Status.Active
            }).exec(function(err, user) {
                if (err) {
                    return res.jsonp(Utilities.response({}, Utilities.getErrorMessage(req, err)));
                } else if (!user) {
                    return res.status(404).jsonp(Utilities.response({}, 'User not found', 404));
                } else {
                    req.userData = user;
                    return next();
                }
            });
        }
    });
};

// Register an account
exports.signup = function(req, res) {
    var user;
    async.series({
        createUserObject: function(cb) {
            user = new Users(req.body);
            return cb(null);
        },
        formatPhoneNumber: function(cb) {
            // ABCXYZ
            if (user.phone) {
                user.phone = user.phone.trim();
            }
            return cb(null);
        },
        save: function(cb) {
            user.save(function(err) {
                if (err) {
                    return cb(true, Utilities.getErrorMessage(req, err));
                } else {
                    return cb(null);
                }
            });
        },
        token: function(cb) {
            var profile = {
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                gender: user.gender,
                role: user.role
            };
            // Create token
            token = jwt.sign(profile, Config.JWTSecret);
            return cb(null, token);
        },
        avatar: function(cb) {
            if (user.gender == 1) {
                return cb(null, Config.Env[process.env.NODE_ENV].Image + 'male.png');
            } else {
                return cb(null, Config.Env[process.env.NODE_ENV].Image + 'female.png');
            }

        }
    }, function(err, results) {
        if (err) {
            var keys = Object.keys(results);
            var last = keys[keys.length - 1];
            return res.jsonp(Utilities.response({}, results[last]));
        } else {
            return res.jsonp(Utilities.response({
                '_id': user._id,
                'username': user.username,
                'avatar': results.avatar,
                'token': results.token
            }));
        }
    });
};





// Do login
exports.login = function(req, res) {
    var username = req.body.username ? req.body.username.toString() : '';
    var password = req.body.password ? req.body.password.toString() : '';
    // Trim username (email/phone)
    username = username.trim();

    var user;
    // Do functions in series
    async.series({
        findUser: function(cb) {
            async.parallel({
                findByEmail: function(cb1) {
                    Users.findOne({
                        'email': username
                    })
                    .select('-__v -createdAt')
                    .exec(function(err, u) {
                        if (u) {
                            user = u;
                        }
                        return cb1();
                    });
                },
                findByPhoneNumber: function(cb1) {
                    Users.findOne({
                        'username': username
                    })
                    .select('-__v -createdAt')
                    .exec(function(err, u) {
                        if (u) {
                            user = u;
                        }
                        return cb1();
                    });
                }
            }, function() {
                return cb(!user, 'Incorrect email/phone number or password');
            });
        },
        checkPassword: function(cb) {
            return cb(!user.checkLogin(password), 'Incorrect email/phone number or password');
        },
        getUserInformations: function(cb) {
            Users.getFullInformations(user, null, function(data) {
                user = data;
                return cb(null);
            });
        },
        createToken: function(cb) {
            var profile = {
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
            };
            // Create token
            var token = jwt.sign(profile, Config.JWTSecret);
            user.token = token;
            return cb(null);
        }
    }, function(err, results) {
        if (err) {
            var keys = Object.keys(results);
            var last = keys[keys.length - 1];
            return res.jsonp(Utilities.response({}, results[last]));
        } else {
            return res.jsonp(Utilities.response(user));
        }
    });
};

