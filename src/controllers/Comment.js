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
      if(!post_id) return res.send(response(false, 'post_id is required!'));
      if(!author) return res.send(response(false, 'author is required!'));
      if(!content) return res.send(response(false, 'content is required!'));
      //@ Validate if user has already the same post
      return POST.findById(post_id)
      .then(post => {
        if(!post) return res.send(response(false, `This post doesn\'t exist!`));
        //NEW COMMENT
        const new_comment = new COMMENT({
          content, author, post_id
        });
        //SAVE COMMENT
        return new_comment.save()
        .then(result => {
          if(!result) return res.send((response(false, `Comment not saved`)))
          return res.send((response(true, `Succesfully added comment`, result)))

        })
      })
    },

    editComment: (req, res) => {
      const author = req.POST_VERIFICATION.username
      const {comment_id, content} = req.body;
      if(!comment_id) return res.send(response(false, 'comment_id is required!'));
      if(!content) return res.send(response(false, 'content is required!'));

      return USER.findOne({ username: author })
      .then(user =>{
        if(!user) return res.send((response(false, `User does not exist!`)));
        return COMMENT.findById(comment_id)
        .then(comment => {
          if(!comment) return res.send((response(false, `Comment does not exist!`)));
          return POST.findById(comment.post_id)
          .then(post => {
            if(!post) return res.send((response(false, `Comment does not exist!`)));
            if(comment.author != author) return res.send(response(false, `Cannot edit someone else's comment`));
            else {
              if(comment.content == content) return res.send(response(false, `New content is the same as the old one!`));
              else return comment.updateOne({content}, {new:true}).then(result => res.send(response(true, `Succesfully edited comment`, result)))
            }
          })
        })
      })
    },

    deleteComment: async (req, res) => {
      const {comment_id} = req.body;
      if(!comment_id) return res.send(response(false, `Comment_id is required!`));
      const {username} = req.POST_VERIFICATION

      comment = await COMMENT.findById(comment_id);
      post = await POST.findById(comment.post_id);

      if(!comment) return res.send(response(false, `Comment doesn't  exist`));

      //If comment is made on your wall, you can delete it
      if(username == post.author){
        return COMMENT.findByIdAndDelete(comment_id).then(() => {
          return res.send(response(true, `Comment deleted!`));
        })
      }else{
        if(username == comment.author){
          return COMMENT.findByIdAndDelete(comment_id).then(() => {
            return res.send(response(true, `Comment deleted!`));
          })
        }else{
          return res.send(response(true, `Cannot delete others\' comment in unowned posts!`));
        }
      }
    }
  }
}