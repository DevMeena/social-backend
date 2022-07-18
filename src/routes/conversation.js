const router = require("express").Router();
const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const cors = require('cors');

// new conversation
router.post("/", cors(), auth, async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// find conversaion of a user
router.get("/:userId", cors(), auth, async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conversations includes userId
router.get("/find/:firstUserId/:secondUserId", cors(), auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] }
    });

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
})

module.exports = router;