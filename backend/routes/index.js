var express = require("express");
var router = express.Router();
var path = require("path");

survey_socket = {
  guest: undefined,
  host: undefined,
};
/* GET SURVEY PAGE. */

router.get("*", function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "..", "/dist/index.html"));
  var io = req.io;
  io.sockets.on("connection", (socket) => {
    socket.on("survey-connect", (data) => {
      const { room, user } = data.room;

      socket.join("survey-" + room);
      survey_socket[user] = socket;
    });
  });
});

module.exports = router;
