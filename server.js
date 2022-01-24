const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const sio = require("socket.io");
const favicon = require("serve-favicon");
const compression = require("compression");
const bodyParser = require("body-parser");
require("dotenv").config();
var hash = require("object-hash");
const { SingleEntryPlugin } = require("webpack");

// CouchDB
// const nano = require("nano")("http://admin:admin@localhost:5984");
const nano = require("nano")(process.env.COUCHDB_URL);
const tableName = "occlusion_mask";

// const db = nano.db.use(tableName);

nano.db
  .create(process.env.DB_NAME)
  .then((data) => {
    // success - response is in 'data'
    console.log("New database created: " + process.env.DB_NAME);
    couch = nano.use(process.env.DB_NAME);
    app.set("couch", couch);
  })
  .catch((err) => {
    // failure - error information is in 'err'
    console.log("Connected to existing database: " + process.env.DB_NAME);
    couch = nano.use(process.env.DB_NAME);
    app.set("couch", couch);
  });

const app = express(),
  options = {
    key: fs.readFileSync(__dirname + "/rtc-video-room-key.pem"),
    cert: fs.readFileSync(__dirname + "/rtc-video-room-cert.pem"),
  },
  port = process.env.PORT || 3000,
  server =
    process.env.NODE_ENV === "production"
      ? http.createServer(app).listen(port)
      : https.createServer(options, app).listen(port),
  io = sio(server);

chatio = io.of("chat");
controlio = io.of("control");
console.log("starting server on port: " + port);

app.use(function (req, res, next) {
  req.io = io;
  next();
});

// compress all requests
app.set("socketIo", io);
app.use(compression());
app.use(express.static(path.join(__dirname, "dist")));
// app.use(express.static(path.join(__dirname, "backend", "public")));
app.use((req, res) => res.sendFile(__dirname + "/dist/index.html"));

app.use(favicon("./dist/favicon.ico"));
// Switch off the default 'X-Powered-By: Express' header
app.disable("x-powered-by");

control_room_list = {};
ready_user_by_room = {};
rating_by_user = {};
projection_room_list = {};
survey_room_list = {};

survey_socket = {
  //? Does the app support multiple concurring conversations in different rooms? What happens if new rooms are opened?
  guest: undefined,
  host: undefined,
};
projection_socket = {
  guest: undefined,
  host: undefined,
};

emotion_ready = { host: false, guest: false };
question_ready = { host: false, guest: false };
survey_ready = { host: false, guest: false };
emotion_data = {
  host: {},
  guest: {},
};
question_data = {
  host: {},
  guest: {},
};
record_by_user = {
  //What's this?
  host: false,
  guest: false,
};

const mask_set = ["endWithEyes", "endWithMouth", "opposite"];

var sessionId;
var sessionRev;
var startTime;
var timmer;
var current_cfg;
var current_rating;
var topic_selected = [];
var survey_in_progress = false;
var stage;

function generateId(stime) {
  // let year = stime.getFullYear();
  // let month = stime.getMonth() + 1;
  // let day = stime.getDate();
  // let hours = stime.getHours();
  // let minutes = stime.getMinutes();
  // let seconds = stime.getSeconds();
  // let datestr = year * 10000 + month * 100 + day;

  // datestr += year + "/" + month + "/" + day;
  // let timestr = "";
  // timestr += hours + "/" + minutes + "/" + seconds;
  // const sid = {
  //   dateId: datestr,
  //   timeId: timestr,
  // };

  // creating a hash from current timestamp and random number
  return hash(
    new Date().getTime().toString() + Math.floor(Math.random() * 100000) + 1
  );

  // const sid = datestr.toString();
  // sessionId = response.id;
}

function processStart(room, start_time, cfg) {
  console.log("+ process start in room: " + room);
  console.log("config ", cfg);
  stage = 0;
  const { duration } = cfg["setting"][0];
  const questionset = require("./assets/topics/topics.json");
  const icebreaker = questionset["icebreaker"];
  const wouldyou = questionset["wouldyou"];
  const quest = [
    ...questionset["quest"][current_rating],
    ...questionset["quest"]["general"],
  ];

  let endTime = start_time + 1000 * duration;
  // create a timmer
  if (timmer == undefined || (timmer != undefined && timmer["_destroyed"])) {
    // pick up a questionnaire from the list
    let stop = false;
    let count = 0;
    // start chatting
    timmer = setInterval(() => {
      let nowTime = new Date().getTime();
      if (survey_in_progress) {
        let extend_time = 0;
        if (stage == 2) {
          extend_time = 1000 * 150;
        }
        if (stage == 3) {
          extend_time = 1000 * 90;
        }
        endTime = nowTime + extend_time;
      }
      let time_left = Math.round((endTime - nowTime) / 1000);

      if (time_left > 150) {
        //stage1
        if (stage != 1) {
          stage = 1;
          //send mask
          console.log(time_left, "stage 1");
          let mask_setting = cfg["setting"][stage];
          const rindex = Math.floor(Math.random() * icebreaker.length);
          let topic = icebreaker[rindex];

          topic_selected.push(topic);
          console.log("- sending update to projection in room: " + room);
          io.sockets
            .to(room)
            .to("projection-" + room)
            .emit("stage-control", {
              mask: mask_setting,
              topic: [topic],
              stage,
            });
        }
      } else if (time_left < 150 && time_left > 90) {
        //stage2
        if (stage != 2) {
          // previous stage finish, raise a survey
          console.log(
            "- sending survey start to room: " +
              room +
              " (stage: " +
              stage +
              ")"
          );
          chatio.emit("survey-start", { stage: stage });
          controlio.to("survey-" + room).emit("survey-start", { stage: stage });
          survey_in_progress = true;
          stage = 2;
          //send mask
          console.log(time_left, "stage 2");
          let mask_setting = cfg["setting"][stage];
          const rindex = Math.floor(Math.random() * wouldyou.length);
          let topic = wouldyou[rindex];
          topic_selected.push(topic);
          console.log(
            "- sending stage control to room: " +
              room +
              " (stage: " +
              stage +
              ", mask: " +
              mask_setting +
              ", topic: " +
              topic +
              ")"
          );
          chatio.to(room).emit("stage-control", {
            mask: mask_setting,
            topic: [topic],
            stage,
          });
        }
      } else if (time_left < 90 && time_left > 0) {
        //stage3
        if (stage != 3) {
          console.log(
            "- sending survey start to room: " +
              room +
              " (stage: " +
              stage +
              ")"
          );
          chatio.emit("survey-start", { stage: stage });
          controlio.to("survey-" + room).emit("survey-start", { stage: stage });
          survey_in_progress = true;
          stage = 3;
          //send mask
          console.log(time_left, "stage 3");
          let mask_setting = cfg["setting"][stage];
          const rindex = Math.floor(Math.random() * quest.length);
          let topic = quest[rindex];
          topic_selected.push(topic);
          console.log(
            "- sending stage control to room: " +
              room +
              " (stage: " +
              stage +
              ", mask: " +
              mask_setting +
              ", topic: " +
              topic +
              ")"
          );
          chatio.emit("stage-control", { mask: mask_setting, topic, stage });
        }
      }

      if (time_left <= 0) {
        if (stage != 4) {
          stage = 4;
          console.log(
            "- sending survey start to room: " +
              room +
              " (stage: " +
              stage +
              ")"
          );
          chatio.emit("survey-start", { stage: stage });
          controlio.to("survey-" + room).emit("survey-start", { stage: stage });
          survey_in_progress = true;
        }
        if (!stop && !survey_in_progress) {
          count += 1;
          console.log("stop count ", count);
          stop = true;
          processStop(room, false);
        }
      }

      console.log(
        "- Second timer for room: " +
          room +
          ", stage: " +
          stage +
          ", time left: " +
          time_left
      );
    }, 1000);
  } else {
    console.log("timmer running", typeof timmer);
  }
}
function processStop(room, accident_stop) {
  console.log("+ process stop ", accident_stop);
  if (accident_stop) {
    topic_selected = [];
  }

  survey_in_progress = false;
  // clear timmer
  clearInterval(timmer);
  // socket send stop

  // io.to(room).emit("process-stop", { accident_stop });
  chatio.to(room).emit("process-stop", { accident_stop });
  controlio.emit("process-stop", { accident_stop });
}
async function storeData(room) {
  const results = {
    guest: question_data["guest"],
    host: question_data["host"],
  };
  let phase_result = [];
  for (let i = 0; i < 3; i++) {
    const data = {
      topic: topic_selected[i],
      mask_setting: current_cfg["setting"][i + 1],
      host: {
        survey: question_data["host"][i],
        emotions: emotion_data["host"][i],
      },
      guest: {
        survey: question_data["guest"][i],
        emotions: emotion_data["guest"][i],
      },
    };
    phase_result.push(data);
  }

  const audio = {
    host: record_by_user["host"] ? startTime.toString() + "_host.webm" : "none",
    guest: record_by_user["guest"]
      ? startTime.toString() + "_guest.webm"
      : "none",
  };
  const data = {
    _id: startTime.toString(),
    start_time: sessionId,
    phase_01: phase_result[0],
    phase_02: phase_result[1],
    phase_03: phase_result[2],
    audio: audio,
  };
  topic_selected = [];
  emotion_ready = { host: false, guest: false };
  question_ready = { host: false, guest: false };
  emotion_data = {
    host: {},
    guest: {},
  };
  question_data = {
    host: {},
    guest: {},
  };
  record_by_user = {
    host: false,
    guest: false,
  };
  console.log(data);
  chatio.to(room).emit("upload-finish", results);
  const response = await db
    .insert(data)
    .then((res) => {
      console.log("+ SUCCESS: all data saved in db: ");
      console.log(res);
    })
    .catch((error) => {
      console.log("- ERROR: could not save data in db");
      console.log(error);
    });
}

chatio.on("connection", (socket) => {
  let startFlag = false;
  console.log("+ new connection from a socket");
  let rooms = chatio.adapter.rooms["test"];

  if (startFlag) {
    if (rooms === undefined) {
      socket.join("test");
      rooms = chatio.adapter.rooms["test"];
      console.log("++ reconnect from recover ", rooms.length);
    } else if (rooms.length < 2) {
      console.log("++ reconnect from recover ", rooms.length);
      socket.join("test");
      chatio.emit("reconnect");

      console.log("++ reconnect to test room");
    }
    console.log("++ reconnect from recover ", rooms.length);
  }
  chatio.emit("process-stop", { accident_stop: true });

  let room = "";

  socket.on("disconnecting", () => {
    console.log("- client left room: ");
    console.log(socket.rooms);
    processStop("test", true);
  });
  // sending to all clients in the room (channel) except sender
  socket.on("message", (message) =>
    socket.broadcast.to(room).emit("message", message)
  );
  socket.on("find", () => {
    startFlag = true;
    const url = socket.request.headers.referer.split("/");
    room = url[url.length - 1];

    console.log(" - trying to locate room: " + room);

    const sr = chatio.adapter.rooms[room];
    if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit("create");
      console.log("+ new room created: " + room);
    } else if (sr.length === 1) {
      socket.emit("join");
      console.log("- room (" + room + ") exists: try to join.");
      socket.join(room);
    } else {
      // max two clients
      socket.emit("full", room);
      console.log("- room (" + room + ") exists but is full");
    }
  });
  socket.on("auth", (data) => {
    data.sid = socket.id;
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit("approve", data);
    console.log("- authenticate client in room " + room);
  });
  socket.on("accept", (id) => {
    // io.sockets.connected[id].join(room);
    // sending to all clients in 'game' room(channel), include sender
    chatio.emit("bridge");
    console.log("- accept client in room " + room);
  });
  socket.on("reject", () => {
    socket.emit("full");
    console.log("- rejected");
  });

  socket.on("leave", () => {
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit("hangup");
    socket.leave(room);
    console.log("- client left room: " + room);
    clearInterval(timmer);
  });
  // control room record
  socket.on("control-room", (data) => {
    const room = data.room;
    control_room_list[room] = socket;
    console.log("- received control-room message for room: " + room);
  });
  socket.on("room-idle", (data) => {
    const { room } = data;
    // console.log(`room ${room} is idle now`);
    io.to("survey-" + room).emit("room-idle");
    console.log("- room idle: " + room + " -> initiate process stop");
    processStop(room, true);
  });
  socket.on("projection-connect", (data) => {
    const { room, user } = data;
    socket.join("projection-" + room);
    projection_socket[user] = socket;
    console.log(
      '+ a projection was connected in room: " ' + room + ", user: " + user
    );
  });
  socket.on("survey-connect", (data) => {
    const { room, user } = data;
    socket.join("survey-" + room);
    survey_socket[user] = socket;
    console.log(
      "+ a survey was connected in room: " + room + ", user: " + user
    );
  });
  socket.on("data-connect", () => {
    db.view("search", "all", function (err, data) {
      const len = data.rows.length;
      console.log("- on data-connect()");
      console.log(data.rows, len);
      socket.emit("data-retrieve", data.rows);
    });
  });
  // survey send and control
  socket.on("survey-start", (data) => {
    console.log("survey start", data);
    const params_room = data.room;
    socket.broadcast.to(params_room).emit("survey-start");
    socket.broadcast.to("survey-" + params_room).emit("survey-start");
    console.log('+ send survey and room control in room: " ' + room);
  });
  socket.on("survey-end", (data) => {
    const { room, user } = data;
    console.log('- survey was ended in room: " ' + room + ", user: " + user);
    survey_ready[user] = true;
    console.log(
      "- Who`s ready? Guest: " +
        survey_ready["guest"] +
        ", Host: " +
        survey_ready["host"]
    );
    if (survey_ready["guest"] && survey_ready["host"]) {
      survey_in_progress = false;
      survey_ready = { host: false, guest: false };
      let stage_startTime = new Date().getTime();
      let extend_time = 0;
      if (stage == 2) {
        extend_time = 150;
      }
      if (stage == 3) {
        extend_time = 90;
      }
      let duration = extend_time;
      console.log("moving on: after", duration);
      io.to(room).emit("survey-end", { stage_startTime, duration, stage });
      io.to("projection-" + room).emit("stage-control", { stage });
    }
  });
  socket.on("reset", (data) => {
    const { room } = data;
    console.log("- resetting room: " + room);
    processStop(room, true);
  });

  socket.on("face-detected", (data) => {
    const { room, user } = data;
    console.log(
      "- face-detected received in room: " + room + ", user: " + user
    );

    controlio.to("survey-test").emit("face-detected");
    chatio.to(room).emit("face-detected", user);
  });
  socket.on("process-control", (data) => {
    const params_room = data.room;

    current_cfg = data.cfg;
    current_rating = data.topic;

    console.log("+ process-control received: ");
    console.log(current_cfg);
    console.log(current_rating);

    socket.broadcast.to(params_room).emit("process-control");
  });
  socket.on("process-ready", (data) => {
    const { room, user, rating, record } = data;
    // socket.broadcast.to(room).emit("process-start");
    console.log(`+ ${user} in room ${room} is ready to record: `, record);

    if (room in ready_user_by_room) {
      ready_user_by_room[room][user] = true;
      rating_by_user[user] = rating;
      record_by_user[user] = record;
      if (
        ready_user_by_room[room]["host"] &&
        ready_user_by_room[room]["guest"]
      ) {
        console.log(
          "- process start, both users are ready",
          ready_user_by_room
        );
        try {
          console.log("+ both ready: start process");
          startTime = new Date().getTime();
          // processStart(room, startTime, current_cfg);

          sessionId = generateId(new Date(startTime));

          let mask_id = Math.floor(Math.random() * 3);
          current_cfg = require("./assets/MaskSetting/" +
            mask_set[mask_id] +
            ".json");
          current_rating = "general";
          if (rating_by_user["host"] == rating_by_user["guest"]) {
            current_rating = rating_by_user["host"];
          }

          console.log("- current rating:");
          console.log(current_rating);
          console.log("- rating by user:");
          console.log(rating_by_user);

          processStart(room, startTime, current_cfg);
          const { duration } = current_cfg["setting"][0];
          chatio.to(room).emit("process-start", {
            startTime,
            duration,
            record_by_user,
            sessionId,
          });
          controlio.to("survey-" + room).emit("process-start");

          console.log("- resetting ready_user_by_room for next survey (?)");
          ready_user_by_room[room] = {
            host: false,
            guest: false,
          };
        } catch (err) {
          console.log(
            "Ooops! Something went wrong: Please confirm that the admin has started the process"
          );
          console.log(err);
        }

        // socket.broadcast.to(room).emit("process-start");
        // socket.emit("process-start");
      } else {
        console.log("- not all users ready yet");
      }
    } else {
      ready_user_by_room[room] = {
        host: false,
        guest: false,
      };
      ready_user_by_room[room][user] = true;
      rating_by_user[user] = rating;
      record_by_user[user] = record;
    }
    console.log("- ready_user_by_room:");
    console.log(ready_user_by_room);

    console.log("- rating_by_user:");
    console.log(rating_by_user);

    console.log("- record_by_user:");
    console.log(record_by_user);
  });
  socket.on("process-in-progress", (data) => {
    console.log("- process-in-progress");
    console.log(data);

    const params_room = data.room;
    control_socket = control_room_list[params_room];
    control_socket.emit("process-in-progress", { time_diff: data.time_diff });
  });
  socket.on("process-stop", (data) => {
    console.log("- process-stop");
    console.log(data);

    const params_room = data.room;
    control_socket = control_room_list[params_room];
    control_socket.emit("process-stop");
  });

  socket.on("data-send", (data_get) => {
    console.log("- data-send");
    console.log(data_get);

    const { data_type, data, user, room } = data_get;
    if (data_type == "question") {
      question_ready[user] = true;
      question_data[user] = data;
    } else if (data_type == "emotion") {
      emotion_ready[user] = true;
      emotion_data[user] = data;
    }
    setTimeout(() => {
      console.log("waiting for data uploading");
      if (
        emotion_ready["host"] &&
        emotion_ready["guest"] &&
        question_ready["host"] &&
        question_ready["guest"]
      ) {
        console.log("- call store data");
        storeData(room);
      }
    }, 5000);
  });

  socket.on("control", (data) => {
    console.log("- control");
    console.log(data);

    const params_room = data.room;
    const params_data = data.data;
    socket.broadcast.to(params_room).emit("control", params_data);
  });
});

controlio.on("connection", (socket) => {
  console.log("+ new connection from a socket");
  let rooms = controlio.adapter.rooms["survey-test"];

  if (rooms === undefined) {
    socket.join("survey-test");
    rooms = controlio.adapter.rooms["survey-test"];
    console.log("++ control reconnect from recover ", rooms.length);
  } else if (rooms.length < 2) {
    console.log("++ control reconnect from recover ", rooms.length);
    socket.join("survey-test");
    controlio.emit("room-idle");
  }

  socket.on("disconnecting", () => {
    console.log("- client left room: ");
    console.log(socket.rooms);
  });

  //survey
  socket.on("survey-connect", (data) => {
    const { room, user } = data;
    socket.join("survey-" + room);
    survey_socket[user] = socket;
    console.log(
      "+ a survey was connected in room: " + room + ", user: " + user
    );
  });
  socket.on("data-connect", () => {
    db.view("search", "all", function (err, data) {
      const len = data.rows.length;
      console.log("- on data-connect()");
      console.log(data.rows, len);
      socket.emit("data-retrieve", data.rows);
    });
  });
  // survey send and control
  socket.on("survey-start", (data) => {
    console.log("survey start", data);
    const params_room = data.room;
    socket.broadcast.to(params_room).emit("survey-start");
    socket.broadcast.to("survey-" + params_room).emit("survey-start");
    console.log('+ send survey and room control in room: " ' + room);
  });
  socket.on("survey-end", (data) => {
    const { room, user } = data;
    console.log('- survey was ended in room: " ' + room + ", user: " + user);
    survey_ready[user] = true;
    console.log(
      "- Who`s ready? Guest: " +
        survey_ready["guest"] +
        ", Host: " +
        survey_ready["host"]
    );
    if (survey_ready["guest"] && survey_ready["host"]) {
      survey_in_progress = false;
      survey_ready = { host: false, guest: false };
      let stage_startTime = new Date().getTime();
      let extend_time = 0;
      if (stage == 2) {
        extend_time = 150;
      }
      if (stage == 3) {
        extend_time = 90;
      }
      let duration = extend_time;
      console.log("moving on: after", duration);
      chatio.to(room).emit("survey-end", { stage_startTime, duration, stage });
      controlio.to("projection-" + room).emit("stage-control", { stage });
    }
  });
  socket.on("reset", (data) => {
    const { room } = data;
    console.log("- resetting room: " + room);
    processStop(room, true);
  });

  socket.on("face-detected", (data) => {
    const { room, user } = data;
    console.log(
      "- face-detected received in room: " + room + ", user: " + user
    );
    if (survey_socket[user] != undefined) {
      const sid = survey_socket[user].id;
      controlio.to("survey-test").emit("face-detected");
      chatio.to(room).emit("face-detected", user);
    }
  });
  socket.on("process-control", (data) => {
    const params_room = data.room;

    current_cfg = data.cfg;
    current_rating = data.topic;

    console.log("+ process-control received: ");
    console.log(current_cfg);
    console.log(current_rating);

    socket.broadcast.to(params_room).emit("process-control");
  });
  socket.on("process-ready", (data) => {
    const { room, user, rating, record } = data;
    // socket.broadcast.to(room).emit("process-start");
    console.log(`+ ${user} in room ${room} is ready to record: `, record);

    if (room in ready_user_by_room) {
      ready_user_by_room[room][user] = true;
      rating_by_user[user] = rating;
      record_by_user[user] = record;
      if (
        ready_user_by_room[room]["host"] &&
        ready_user_by_room[room]["guest"]
      ) {
        try {
          console.log("+ both ready: start process", ready_user_by_room);
          startTime = new Date().getTime();
          // processStart(room, startTime, current_cfg);

          sessionId = generateId(new Date(startTime));

          let mask_id = Math.floor(Math.random() * 3);
          current_cfg = require("./assets/MaskSetting/" +
            mask_set[mask_id] +
            ".json");
          current_rating = "general";
          if (rating_by_user["host"] == rating_by_user["guest"]) {
            current_rating = rating_by_user["host"];
          }

          console.log("- current rating:");
          console.log(current_rating);
          console.log("- rating by user:");
          console.log(rating_by_user);

          processStart(room, startTime, current_cfg);
          const { duration } = current_cfg["setting"][0];
          chatio.to(room).emit("process-start", {
            startTime,
            duration,
            record_by_user,
            sessionId,
          });
          controlio.to("survey-" + room).emit("process-start");

          console.log("- resetting ready_user_by_room for next survey (?)");
          ready_user_by_room[room] = {
            host: false,
            guest: false,
          };
        } catch (err) {
          console.log(
            "Ooops! Something went wrong: Please confirm that the admin has started the process"
          );
          console.log(err);
        }

        // socket.broadcast.to(room).emit("process-start");
        // socket.emit("process-start");
      } else {
        console.log("- not all users ready yet");
      }
    } else {
      ready_user_by_room[room] = {
        host: false,
        guest: false,
      };
      ready_user_by_room[room][user] = true;
      rating_by_user[user] = rating;
      record_by_user[user] = record;
    }
    console.log("- ready_user_by_room:");
    console.log(ready_user_by_room);

    console.log("- rating_by_user:");
    console.log(rating_by_user);

    console.log("- record_by_user:");
    console.log(record_by_user);
  });
  socket.on("process-in-progress", (data) => {
    console.log("- process-in-progress");
    console.log(data);

    const params_room = data.room;
    control_socket = control_room_list[params_room];
    control_socket.emit("process-in-progress", { time_diff: data.time_diff });
  });
  socket.on("process-stop", (data) => {
    console.log("- process-stop");
    console.log(data);

    const params_room = data.room;
    control_socket = control_room_list[params_room];
    control_socket.emit("process-stop");
  });
  socket.on("data-send", (data_get) => {
    console.log("- data-send");
    console.log(data_get);

    const { data_type, data, user, room } = data_get;
    if (data_type == "question") {
      question_ready[user] = true;
      question_data[user] = data;
    } else if (data_type == "emotion") {
      emotion_ready[user] = true;
      emotion_data[user] = data;
    }
    setTimeout(() => {
      console.log("waiting for data uploading");
      if (
        emotion_ready["host"] &&
        emotion_ready["guest"] &&
        question_ready["host"] &&
        question_ready["guest"]
      ) {
        console.log("- call store data");
        storeData(room);
      }
    }, 5000);
  });
  socket.on("control", (data) => {
    console.log("- control");
    console.log(data);

    const params_room = data.room;
    const params_data = data.data;
    socket.broadcast.to(params_room).emit("control", params_data);
  });
});
