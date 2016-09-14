var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NodeSchema = new Schema({
    userId: { 
        required: true,
        type: Schema.Types.ObjectId, 
        ref: 'Users' 
    },
    chanel: {
        type: Number,
        required: true
    },
    nodeIp: {
        type: Number,
        required: true
    },
    estimatedTime: {
        type: Number,
        default: 0
    },
    humidity: {
       type: Number,
       default: 0
   },
   active: {
    type: Number,
    default: 0
},
type: {
    required: true,
    type: Number
},
isOn: {
    type: Boolean,
    default:false
}
}, {
    collection: 'nodes'
});

module.exports = mongoose.model('Nodes', NodeSchema);

