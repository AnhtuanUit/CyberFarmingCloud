var mongoose = require('mongoose');
var Users = mongoose.model('Users');
var Config = require('./config');
var Utilities = require('./utilities');
var jwt = require('jsonwebtoken');

exports.isAuthentication = function(req, res, next) {
	if ((req.user._id === req.userData._id.toString()) || req.user.role === 1) {
		return next();
	} else {
		return res.status(401).jsonp(Utilities.response(false, {}, 'Access denied', 401));
	}
};

exports.isAdmin = function(req, res, next) {
	if (req.user.role === 1) {
		return next();
	} else {
		return res.status(401).jsonp(Utilities.response(false, {}, 'Access denied', 401));
	}
};
