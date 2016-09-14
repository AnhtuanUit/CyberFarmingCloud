var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActivitySchema = new Schema({
    type: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date, 
        default: Date.now 
    },
    totalTime: Number,
    totalWater: Number,
    averageHumidity: Number
}, {
    collection: 'activities'
});

module.exports = mongoose.model('Activities', ActivitySchema);

