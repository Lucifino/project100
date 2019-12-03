const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {verifyToken} = require('./utilities/helpers');


router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

const USER = require('./controllers/User');
const POST = require('./controllers/Post');
const COMMENT = require('./controllers/Comment')

const secureConection = (req, res, next) => {
  res.send('Connection is clear');
}

//@ USER FUCTIONS
router.get('/', secureConection);
router.get('/getAllUsers', verifyToken, USER.queries.getAllUsers);
router.get('/getUserById', verifyToken, USER.queries.getUserById);
router.post('/createUser', USER.mutations.createUser);
router.post('/login', USER.mutations.login);
router.post('/updatepass', verifyToken, USER.mutations.updateUserPassword)
router.post('/updateinfo', verifyToken, USER.mutations.updateUserInformation)
router.post('/processFriendRequest', verifyToken, USER.mutations.processFriendRequest)
router.post('/deleteFriendRequest', verifyToken, USER.mutations.deleteFriendRequest)
router.post('/acceptFriendRequest', verifyToken, USER.mutations.acceptFriendRequest)
router.delete('/deleteUser', verifyToken, USER.mutations.deleteUser);


//@ POST FUNCTIONS
router.get('/getAllPosts', verifyToken, POST.queries.getAllPosts);
router.get('/getPostsByUserId', verifyToken, POST.queries.getPostsByUserId)
router.post('/createPost', verifyToken, POST.mutations.createPost);
router.post('/reactToPost', verifyToken, POST.mutations.reactToPost);
router.post('/editPost', verifyToken, POST.mutations.editPost);
router.delete('deleteComment', verifyToken, POST.mutations.deletePost)

//@ COMMENT FUNCTIONS
router.get('/getAllCommentsfromPost', verifyToken, COMMENT.queries.getAllCommentsfromPost)
router.post('/commentToPost', verifyToken, COMMENT.mutations.commentToPost)
router.post('/editComment', verifyToken, COMMENT.mutations.commentToPost)
router.delete('deleteComment', verifyToken, COMMENT.mutations.deleteComment)

module.exports = router;