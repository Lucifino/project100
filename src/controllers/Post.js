const POST = require('../models/entities/Post');
const USER = require('../models/entities/User');
const COMMENT = require('../models/prerequisites/Comment')

const {response} = require('../utilities/helpers');
const {reactions} = require('../utilities/statics');

module.exports = {
  queries: {
    getAllPostsFromWall: (req, res) => {
      const {destination_wall} = req.POST_VERIFICATION.username;
      if(!destination_wall) return res.send(response(false, 'Username is required!'));
      return POST.find({destination_wall}).sort({createdAt: -1})
      .then(result => {
        if(!result) return res.send(response(false, `You hav no posts yet`));
        else return res.send(response(true, `Succesfully queried posts`, result));
      })
    },

    getPostsByOwner: (req, res) => {
      const {author} = req.body;
      if(!author) return res.send(response(false, 'Author is required!'));
      return POST.find({author}).sort({createdAt: -1})
      .then(result => {
        if(!result) return res.send(response(true, `User has not posts yet`));
        else return res.send(response(true, `Succesfully queried posts`, result));
      })
    }
  },
  mutations: {

    createPost: (req, res) => {
      const {author, destination_wall, content} = req.body;

      //@ Validate if user has already the same post
      return USER.findOne({username: destination_wall})
      .then(user => {
        if(user) return res.send(response(false, `User does not exist!`));
        const new_post = new POST({
          author, destination_wall, content
        });
        return new_post.save()
        .then(post => {
          if(!post) return res.send((response(false, `Post not Created!`)));
          return USER.findOneAndUpdate( user._id, { $push: { posts: new_post._id }})
          .then(result =>{
            if(!post) return res.send((response(false, `Post not Added!`)));
            return res.send(response(true, `Succesfully Added Post!`, result))
          })
        })
      })
    },

    reactToPost: (req, res) => {
      const {post_id, user_id, reaction} = req.body;
      if(!reactions.includes(reaction)) return res.send(response(false, `Reaction does not exist`));
      return POST.findById(post_id)
      .then(result => {
        const new_reaction = {_id: false, user_id, type:reaction}
        //@ FIND user_id IN REACTIONS
        const user_reaction = result.reactions.find(data => data.user_id == user_id);
        if(!user_reaction){
          return result.updateOne({$push: {reactions: new_reaction}}, {new: true})
          .then(result => {
            return res.send(response(true, `Succesfully reacted on post!`, result));
          })
        }else{
          //@ IF REACTIONS ARE THE SAME, REMOVE IT
          //@ ELSE UPDATE
          if(user_reaction.type == reaction){
            return result.updateOne({$pull: {reactions: {user_id}}}, {new: true})
            .then(result => {
              return res.send(response(true, `Succesfully unreacted on post!`, result));
            })
          }else{
            return POST.updateOne({_id: post_id, 'reactions.user_id': user_id}, {'reactions.$.type': reaction}, {new: true})
            .then(result => {
              return res.send(response(true, `Succesfully reacted on post!`, result));
            })
          }
        }
      })
    },

    commentToPost: (req, res) => {

      const {_id, author, destination, content} = req.body;

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
        .then(comment => {
          if(!comment) return res.send((response(false, `Comment not Saved`)))
          return POST.findOneAndUpdate( post._id, { $push: { comments: new_comment._id }})
          .then(result => {
           if(!result) return res.send(response(false, `Add Comment Error!`));
           return res.send(response(true, `Succesfully Added Comment to Post!`, result))
          })
        })
      })
    },

      const {username, personal_information} = req.body;
      let information = JSON.parse(personal_information);
      const {first_name, middle_name, last_name, birthday, email_address, about} = information;
      if(!first_name) return res.send(response(false, 'First name is required!'));
      if(!last_name) return res.send(response(false, 'Last name is required!'));
      if(!birthday) return res.send(response(false, 'Birthday is required!'));
      if(!email_address) return res.send(response(false, 'Email address is required!'));

      return USER.findOne({username})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return USER.findByIdAndUpdate(user._id, {personal_information: information}, {new:true})
        .then(result =>{
          if(!result) return res.send((response(false, `Update Error!`)));
          return res.send(response(true, `Succesfully updated user`, result.personal_information))
        })
      })

    editPost: (req, res) => {
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

    deletePost: (req, res) => {

    }
  },
}