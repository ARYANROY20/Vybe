import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    post_id:{type:String,ref:'Post',required:true},
    user_id:{type:String,ref:'User',required:true},
    text:{type:String,required:true},
},{timestamps:true,minimize:false})

const Comment=mongoose.model('Comment',commentSchema)

export default Comment;
