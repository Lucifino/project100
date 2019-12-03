const POST = require('../models/entities/Post');
const USER = require('../models/entities/User');
const COMMENT = require('../models/entities/Comment')

const {response} = require('../utilities/helpers');
const {reactions} = require('../utilities/statics');

module.exports = {
  queries: {
    getAllCommentsfromPost: (req, res) => {
      const {post_id} = req.body;
      if(!post_id) return res.send(response(false, 'ID is required!'));
      return POST.findById(post_id)
      .then(post => {
        if(!post) return res.send(response(false, `POST does not exist`));
        else COMMENT.find({post_id})
        .then(result => {
          if(!result) return res.send(response(false, `COMMENTS does not exist`))
          return res.send(response(true, `Queried COMMENTS Sent`, result))
        })
      })
    }
  },

  mutations: {
    commentToPost: (req, res) => {

      const author = req.POST_VERIFICATION.username
      const {post_id, content} = req.body;
      if(!post_id) return res.send(response(false, '_id is required!'));
      if(!author) return res.send(response(false, 'author is required!'));
      //@ Validate if user has already the same post
      return POST.findById(post_id)
      .then(post => {
        if(!post) return res.send(response(false, `This Post Does Not Exists!`));
        //NEW COMMENT
        const new_comment = new COMMENT({
          content, author, post_id
        });
        //SAVE COMMENT
        return new_comment.save()
        .then(result => {
          if(!result) return res.send((response(false, `Comment not Saved`)))
          return res.send((response(true, `Comment Saved`, result)))

        })
      })
    },

    editComment: (req, res) => {
      const author = req.POST_VERIFICATION.username
      const {comment_id, content, post_id} = req.body;
      if(!comment_id) return res.send(response(false, 'Post verification is required!'));
      if(!post_id) return res.send(response(false, 'Post verification is required!'));
      if(!content) return res.send(response(false, 'Content is required!'));

      return USER.findOne({ username: author })
      .then(user =>{
        if(!user) return res.send((response(false, `User does not exist!`)));
        return POST.findById(post_id)
        .then(post => {
          if(!post) return res.send((response(false, `Post does not exist!`)));
          return COMMENT.findByIdAndUpdate(comment_id, {content}, {new: true})
          .then(result => {
            if(!result) return res.send((response(false, `Comment not updated!`)));
            return res.send((response(true, `Comment updated!`, result)));
          })
        })
      })
    },

    deleteComment: (req, res) => {
      const comment_id = req.body;
      if(!comment_id) return res.send(response(false, `Comment_id is required!`));

      return COMMENT.findOneAndDelete(comment_id)
      .then(comment => {
        if(!comment) return res.send(response(false, `Comment not Deleted!`));
        return res.send(response(true, `Comment Deleted!`));
      })
    }
  }
}