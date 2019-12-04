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
router.get('/getUsers', verifyToken, USER.queries.getUsers)
router.get('/getUserById', verifyToken, USER.queries.getUserById);
router.post('/createUser', USER.mutations.createUser);
router.post('/login', USER.mutations.login);
router.post('/updateUserPassword', verifyToken, USER.mutations.updateUserPassword)
router.post('/updateUserInformation', verifyToken, USER.mutations.updateUserInformation)
router.post('/processFriendRequest', verifyToken, USER.mutations.processFriendRequest)
router.post('/declineFriendRequest', verifyToken, USER.mutations.declineFriendRequest)
router.post('/acceptFriendRequest', verifyToken, USER.mutations.acceptFriendRequest)
router.post('/unFriend', verifyToken, USER.mutations.unFriend)
router.delete('/deleteUser', verifyToken, USER.mutations.deleteUser);


//@ POST FUNCTIONS
router.get('/getNewsFeed', verifyToken, POST.queries.getNewsFeed);
router.get('/getPostsByOwner', verifyToken, POST.queries.getPostsByOwner)
router.post('/createPost', verifyToken, POST.mutations.createPost);
router.post('/reactToPost', verifyToken, POST.mutations.reactToPost);
router.post('/editPost', verifyToken, POST.mutations.editPost);
router.delete('/deletePost', verifyToken, POST.mutations.deletePost)

//@ COMMENT FUNCTIONS
router.get('/getAllCommentsfromPost', verifyToken, COMMENT.queries.getAllCommentsfromPost)
router.post('/commentToPost', verifyToken, COMMENT.mutations.commentToPost)
router.post('/editComment', verifyToken, COMMENT.mutations.editComment)
router.delete('/deleteComment', verifyToken, COMMENT.mutations.deleteComment)

module.exports = router;