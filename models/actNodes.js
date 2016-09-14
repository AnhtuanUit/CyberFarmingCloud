var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActNodeSchema = new Schema({
    activityId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Activities' 
    },
    nodeId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Nodes' 
    },
    createdAt: {
        type: Date, 
        default: Date.now 
    },
    time: String,
    humidity: Number
}, {
    collection: 'actNodes'
});

module.exports = mongoose.model('ActNodes', ActNodeSchema);

