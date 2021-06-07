var express = require("express");
var router = express.Router();
var path = require("path");

/* GET SURVEY PAGE. */

router.get("/:user", function (req, res, next) {
  let user = req.params.user;

  if (user == "host") {
    res.sendFile(
      path.join(__dirname, "..", "/public/projection/projectionGIFHost.html")
    );
    //res.sendFile(path.join(__dirname, "..", "/public/projection/projectionHost.html"));
  } else {
    res.sendFile(
      path.join(__dirname, "..", "/public/projection/projectionGIFGuest.html")
    );
  }
});

module.exports = router;
