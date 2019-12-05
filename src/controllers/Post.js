const POST = require('../models/entities/Post');
const USER = require('../models/entities/User');
const COMMENT = require('../models/entities/Comment')

const {response} = require('../utilities/helpers');
const {reactions} = require('../utilities/statics');

module.exports = {
  queries: {
    getNewsFeed: (req, res) => {
      const {username} = req.POST_VERIFICATION;
      return USER.findOne({username})
      .then(user => {
        const {friends} = user;
        return POST.find({$or: 
          [
            {author: username},
            {destination_wall: username},
            {$and:
              [
                //POSTS OF FRIENDS ON THEIR WALLS
                {$expr: {$eq: ["$destination_wall", "$author"]}},
                {author: {$in: friends}}
              ]
            }
          ]
        }).sort({createdAt: -1})
      })
      .then(result => {
        return res.send(response(true, `Succesfully queried posts!`, result))
      })
    },
    
    getAllPostsFromWall: (req, res) => {
      const {destination_wall} = req.POST_VERIFICATION.username;
      if(!destination_wall) return res.send(response(false, 'Username is required!'));
      return POST.find({destination_wall}).sort({createdAt: -1})
      .then(result => {
        if(!result) return res.send(response(false, `You have no posts yet`));
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
      const author = req.POST_VERIFICATION.username;
      const {destination_wall, content} = req.body;

      //@ Validate if user has already the same post
      return USER.findOne({username: destination_wall})
      .then(user => {
        if(!user) return res.send(response(false, `User does not exist!`));
        if(user.friends.includes(author) || author === destination_wall){
          const new_post = new POST({
            author, destination_wall, content
          });
          return new_post.save()
          .then(post => {
           if(!post) return res.send((response(false, `Post not Created!`)));
           return res.send(response(true, `Succesfully created post`, post));
          })
        }else{
          return res.send(response(false, `Can only post on walls of friends!`));
        }
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

    editPost: (req, res) => {
      const author = req.POST_VERIFICATION.username
      const {post_id, content} = req.body;
      if(!post_id) return res.send(response(false, 'Post verification is required!'));
      if(!content) return res.send(response(false, 'Content is required!'));

      return USER.findOne({ username: author })
      .then(user =>{
        if(!user) return res.send(response(false, `User doesnt exist!`));
        return POST.findById(post_id)
        .then(post => {
          if(post.author != author) return res.send(response(false, `Cannot edit other users post!`)); 
          if(!post) return res.send(response(false, `Post doesnt exist!`));
          if(post.content == content){
            return res.send(response(false, `Edited content same as old!`));
          }else{
            return post.updateOne({content})
            .then(result => {
              return res.send(response(true, `Post successfully edited!`, result));
            })
          }
        })
      })
    },

    deletePost: (req, res) => {
      const {d_post_id} = req.body;
      if(!d_post_id) return res.send(response(false, `_id is required!`));
      const match_name = req.POST_VERIICAITON.username

      console.log("hey")
      return POST.findByIdAndDelete(d_post_id)
      .then(post => {
        console.log("hey")
        if(post.author !== match_name || post.destination_wall != match_name) return res.send(response(false, `Do not have the priveleges to del!`));
        if(!post) return res.send(response(false, `Post not deleted!`));
        return COMMENT.deleteMany({post_id: d_post_id})
        .then(result => {
          if(!result) return res.send(response(false, `Comments not deleted!`));
          return res.send(response(true, `Post and Comments deleted!`, result))
        })
      })
    }
  }
}