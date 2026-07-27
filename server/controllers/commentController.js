import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

//Add Comment
export const addComment=async (req,res) => {
    try {
        const {userId}=await req.auth()
        const {post_id,text}=req.body;

        if(!post_id || !text?.trim()){
            return res.json({success:false,message:'Comment text is required'})
        }

        const post=await Post.findById(post_id)
        if(!post){
            return res.json({success:false,message:'Post not found'})
        }

        const comment=await Comment.create({
            post_id,
            user_id:userId,
            text:text.trim()
        })

        await Post.findByIdAndUpdate(post_id,{$inc:{comments_count:1}})

        const populatedComment=await Comment.findById(comment._id).populate('user_id')

        res.json({success:true,message:'Comment added',comment:populatedComment})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//Get Comments
export const getComments=async (req,res) => {
    try {
        const {postId}=req.params;
        const comments=await Comment.find({post_id:postId}).populate('user_id').sort({createdAt:1})

        res.json({success:true,comments})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//Delete Comment
export const deleteComment=async (req,res) => {
    try {
        const {userId}=await req.auth()
        const {commentId}=req.params;

        const comment=await Comment.findById(commentId)

        if(!comment){
            return res.json({success:false,message:'Comment not found'})
        }

        if(comment.user_id !== userId){
            return res.json({success:false,message:'Not authorized'})
        }

        await Comment.findByIdAndDelete(commentId)
        await Post.findByIdAndUpdate(comment.post_id,{$inc:{comments_count:-1}})

        res.json({success:true,message:'Comment deleted',commentId,post_id:comment.post_id})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}
