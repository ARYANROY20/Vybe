import {createAsyncThunk,createSlice} from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const initialState={
    byPostId:{},
    loadingByPostId:{}
}

export const fetchComments=createAsyncThunk('comments/fetchComments',async ({postId,token}) => {
    const {data}=await api.get(`/api/comment/${postId}`,{
        headers:{Authorization:`Bearer ${token}`}
    })

    if(!data.success){
        toast.error(data.message)
        return null
    }

    return {postId,comments:data.comments}
})

export const addComment=createAsyncThunk('comments/addComment',async ({postId,text,token}) => {
    const {data}=await api.post('/api/comment/add',{post_id:postId,text},{
        headers:{Authorization:`Bearer ${token}`}
    })

    if(data.success){
        return {postId,comment:data.comment}
    }

    throw new Error(data.message)
})

export const deleteComment=createAsyncThunk('comments/deleteComment',async ({commentId,token}) => {
    const {data}=await api.delete(`/api/comment/${commentId}`,{
        headers:{Authorization:`Bearer ${token}`}
    })

    if(data.success){
        toast.success(data.message)
        return {postId:data.post_id,commentId:data.commentId}
    }

    throw new Error(data.message)
})

const commentsSlice=createSlice({
    name:'comments',
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchComments.pending,(state,action)=>{
            state.loadingByPostId[action.meta.arg.postId]=true
        }).addCase(fetchComments.fulfilled,(state,action)=>{
            state.loadingByPostId[action.meta.arg.postId]=false
            if(action.payload){
                state.byPostId[action.payload.postId]=action.payload.comments
            }
        }).addCase(fetchComments.rejected,(state,action)=>{
            state.loadingByPostId[action.meta.arg.postId]=false
            toast.error(action.error.message)
        }).addCase(addComment.fulfilled,(state,action)=>{
            if(action.payload){
                const comments=state.byPostId[action.payload.postId] || []
                state.byPostId[action.payload.postId]=[...comments,action.payload.comment]
            }
        }).addCase(deleteComment.fulfilled,(state,action)=>{
            if(action.payload){
                state.byPostId[action.payload.postId]=(state.byPostId[action.payload.postId] || []).filter((comment)=>comment._id !== action.payload.commentId)
            }
        }).addCase(deleteComment.rejected,(state,action)=>{
            toast.error(action.error.message)
        })
    }
})

export default commentsSlice.reducer
