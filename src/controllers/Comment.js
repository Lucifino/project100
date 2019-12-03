const POST = require('../models/entities/Post');
const USER = require('../models/entities/User');
const COMMENT = require('../models/prerequisites/Comment')

const {response} = require('../utilities/helpers');
const {reactions} = require('../utilities/statics');

module.exports = {
  queries: {
    getAllCommentsfromPost: (req, res) => {
      const {collection_id} = req.body;
      if(!collection_id) return res.send(response(false, 'ID is required!'));
      return COMMENT.findOne({collection_id})
      .then(result => {
        if(!result) return res.send(response(false, `POST does not exist`));
        else return res.send(response(true, `Succesfully queried comments`, result));
      })
    }
  },

  mutations: {
    commentToPost: (req, res) => {

      const author = req.POST_VERIFICATION.username
      const {_id, destination_wall, content} = req.body;
      if(!_id) return res.send(response(false, '_id is required!'));
      if(!destination_wall) return res.send(response(false, 'Destination is required!'));
      if(!author) return res.send(response(false, 'author is required!'));
      //@ Validate if user has already the same post
      return POST.findById({_id})
      .then(post => {
        if(post) return res.send(response(false, `This POST Already Exists!`));
        const collection_id = _id
        //NEW COMMENT
        const new_comment = new Comment({
          content, author, destination_wall, collection_id 
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
      const {_id, author, content_input} = req.body;
      if(!_id) return res.send(response(false, 'Post verification is required!'));
      if(!content_input) return res.send(response(false, 'Content is required!'));

      return USER.findOne({ username: author })
      .then(user =>{
        if(!user) return res.send((response(false, `User does not exist!`)));
        return USER.findOne({ username: author, personal_information : { posts: _id } })
        .then(post => {
          if(!post) return res.send((response(false, `Post does not exist!`)));
          return POST.findByIdAndUpdate(_id, {content: content_input})
          .then(result => {
            if(!result) return res.send((response(false, `Post not updated!`)));
            return res.send((response(true, `Post not updated!`, result)));
          })
        })
      })
    },

    deleteComment: (req, res) => {
      const {_id} = req.body;
      if(!_id) return res.send(response(false, `_id is required!`));

      return COMMENT.deleteOne({_id})
      .then(comment => {
        if(!comment) return res.send(response(false, `Comment not Deleted!`));
        return res.send(response(true, `Comment Deleted!`));
      })
    }
  }
}