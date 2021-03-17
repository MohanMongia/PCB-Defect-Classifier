const { Timestamp } = require('mongodb');
const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const defectSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    testImage:{
        type: String,
        required: true
    },
    templateImage:{
        type: String,
        required: true
    },
    defects:{
        type:[{
            path: {
             type: String,
             required:true
            },
            result:{
                type:String,
                required: true
            }
        }],
        required: true
    },
    differentiatedImages:{
        type: Array,
        required:true
    },
    counter:{
        type: Array,
        required:true
    }

},{timestamps:true});

module.exports = mongoose.model('Defect',defectSchema);