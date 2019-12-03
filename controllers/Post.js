const POST = require('../models/entities/Post');
const USER = require('../models/entities/User');

const {response} = require('../utilities/helpers');
const {reactions} = require('../utilities/statics');

module.exports = {
  queries: {
    getAllPosts: (req, res) => {
      return POST.find()
      .then(result =>{
        return res.send(response(true, `Succefully queried posts`, result))
      })
    },

    getPostsByUserId: (req, res) => {
      const {user_id} = req.body;
      if(!user_id) return res.send(response(false, 'User id is required!'));
      return POST.find({user_id}).sort({createdAt: -1})
      .then(result => {
        if(!result) return res.send(response(true, `User has not posts yet`));
        else return res.send(response(true, `Succesfully queried posts`, result));
      })
    }
  },
  mutations: {
    createPost: (req, res) => {
      const {user_id, content} = req.body;

      //@ Validate if user has already the same post
      return POST.findOne({content})
      .then(post => {
        if(post) return res.send(response(false, `You have already posted this!`));
        const new_post = new POST({
          user_id, content
        });
        return new_post.save()
        .then(result => {
          return res.send(response(true, 'Succesfully added post!', result));
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

    },

    editPost: (req, res) => {

    },

    deletePost: (req, res) => {

    }
  },
}