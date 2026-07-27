import { BadgeCheck, Copy, Heart, MessageCircle, Send, Share2, Trash2 } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { addComment, deleteComment, fetchComments } from "../features/comments/commentsSlice.js";

const PostCard = ({ post }) => {
  const postWithHashtags = (post.content || "").replace(
    /(#\w+)/g,
    '<span class="text-indigo-600">$1</span>',
  );

  const [likes, setLikes] = useState(post.likes_count);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [shareOpen, setShareOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.value);
  const comments = useSelector((state) => state.comments.byPostId[post._id] || []);
  const commentsLoading = useSelector((state) => state.comments.loadingByPostId[post._id]);
  const dispatch = useDispatch();

  const { getToken } = useAuth();
  const navigate = useNavigate();
  const postUrl = `${window.location.origin}/post/${post._id}`;
  const shareText = post.content || "Check out this post on Vybe";

  const handleLike = async () => {
    try {
      const { data } = await api.post(
        "/api/post/like",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );

      if (data.success) {
        toast.success(data.message);
        setLikes((prev) => {
          if (prev.includes(currentUser._id)) {
            return prev.filter((id) => id !== currentUser._id);
          } else {
            return [...prev, currentUser._id];
          }
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleComments = async () => {
    const nextOpen = !commentsOpen;
    setCommentsOpen(nextOpen);

    if (nextOpen && !comments.length) {
      try {
        dispatch(fetchComments({ postId: post._id, token: await getToken() }));
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const text = commentText.trim();
    const token = await getToken();

    await toast.promise(
      dispatch(addComment({ postId: post._id, text, token })).unwrap(),
      {
        loading: "Adding comment...",
        success: (result) => {
          if (result) {
            setCommentText("");
            setCommentCount((prev) => prev + 1);
          }
          return "Comment added";
        },
        error: "Comment not added",
      },
    );
  };

  const handleDeleteComment = async (commentId) => {
    const token = await getToken();
    const result = await dispatch(deleteComment({ commentId, token })).unwrap();

    if (result) {
      setCommentCount((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const copyPostLink = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(postUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setShareOpen(false);
    toast.success("Post link copied");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Vybe post",
          text: shareText,
          url: postUrl,
        });
        toast.success("Post shared");
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    setShareOpen((prev) => !prev);
  };

  const shareLinks = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}` },
    { label: "Twitter/X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}` },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
      {/* User Info */}
      <div
        onClick={() => navigate("/profile/" + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img
          src={post.user.profile_picture}
          alt=""
          className="w-10 h-10 rounded-full shadow"
        />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Images */}

      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img, index) => (
          <img
            src={img}
            key={index}
            className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"} `}
            alt=""
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && "text-red-500 fill-red-500"} `}
            onClick={handleLike}
          />
          <span>{likes.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4 cursor-pointer" onClick={handleToggleComments} />
          <span>{commentCount}</span>
        </div>
        <div className="relative flex items-center gap-1">
          <Share2 className="w-4 h-4 cursor-pointer" onClick={handleShare} />
          {shareOpen && (
            <div className="absolute bottom-6 left-0 z-20 w-44 rounded-lg bg-white p-2 text-xs shadow-lg ring-1 ring-gray-200 transition-all">
              <button onClick={copyPostLink} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-100">
                <Copy className="w-3.5 h-3.5" />
                Copy Post Link
              </button>
              {shareLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="block rounded-md px-3 py-2 hover:bg-slate-100">
                  Share via {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {commentsOpen && (
        <div className="space-y-3 border-t border-gray-200 pt-3">
          {commentsLoading ? (
            <p className="text-xs text-gray-500">Loading comments...</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="flex items-start gap-2">
                  <img src={comment.user_id.profile_picture} alt="" className="w-8 h-8 rounded-full" />
                  <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{comment.user_id.full_name}</p>
                        <p className="truncate text-xs text-gray-500">@{comment.user_id.username} - {moment(comment.createdAt).fromNow()}</p>
                      </div>
                      {comment.user_id._id === currentUser?._id && (
                        <Trash2 onClick={() => handleDeleteComment(comment._id)} className="w-3.5 h-3.5 shrink-0 cursor-pointer text-gray-400 hover:text-red-500" />
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none"
            />
            <button onClick={handleAddComment} className="flex size-9 items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
