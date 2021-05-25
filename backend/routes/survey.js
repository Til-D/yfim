var express = require("express");
var router = express.Router();
var path = require("path");

/* GET SURVEY PAGE. */

router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "/public/survey/template.html"));
});

module.exports = router;
