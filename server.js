const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const sio = require("socket.io");
const favicon = require("serve-favicon");
const compression = require("compression");
const bodyParser = require("body-parser");
const nano = require("nano")("http://admin:admin@localhost:5984");

// authenticate

const tableName = "occlusion_mask";

const db = nano.db.use(tableName);

// async function asyncCall() {
//   const survey_db = nano.db.use("survey");
//   const response = await survey_db.insert({ happy: true }, "rabbit");
//   return response;
// }
// asyncCall();

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
projection_room_list = {};
survey_room_list = {};

survey_socket = {
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

const mask_set = ["endWithEyes", "endWithMouth", "opposite"];

var sessionId;
var timmer;
var current_cfg;
var current_rating;
var topic_selected = [];
var survey_in_progress = false;
var stage;

function generateId(stime) {
  let year = stime.getFullYear();
  let month = stime.getMonth() + 1;
  let day = stime.getDate();
  let hours = stime.getHours();
  let minutes = stime.getMinutes();
  let seconds = stime.getSeconds();
  let datestr = "";
  datestr +=
    year +
    "/" +
    month +
    "/" +
    day +
    "/" +
    hours +
    "/" +
    minutes +
    "/" +
    seconds;
  // datestr += year + "/" + month + "/" + day;
  // let timestr = "";
  // timestr += hours + "/" + minutes + "/" + seconds;
  // const sid = {
  //   dateId: datestr,
  //   timeId: timestr,
  // };
  const sid = datestr;
  sessionId = sid;
  return sid;
}

function processStart(room, start_time, cfg) {
  console.log("process start");
  console.log("config ", cfg);
  stage = 0;
  const { duration } = cfg["setting"][0];
  const questionset = require("./assets/topics/topics.json");
  const icebreaker = questionset["icebreaker"];
  const wouldyou = questionset["wouldyou"];
  const quest = questionset["quest"][current_rating];

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
        endTime = nowTime + ((1000 * duration) / 3) * (4 - stage);
      }
      let time_left = Math.round((endTime - nowTime) / 1000);

      if (time_left > (duration * 2) / 3) {
        //stage1
        if (stage != 1) {
          stage = 1;
          //send mask
          console.log(time_left, "stage 1");
          let mask_setting = cfg["setting"][stage];
          const rindex = Math.floor(Math.random() * icebreaker.length);
          let topic = icebreaker[rindex];
          topic_selected.push(topic);
          io.sockets
            .in(room)
            .emit("stage-control", { mask: mask_setting, topic: [topic] });
        }
      } else if (time_left < (duration * 2) / 3 && time_left > duration / 3) {
        //stage2
        if (stage != 2) {
          // previous stage finish, raise a survey
          io.to("survey-" + room)
            .to(room)
            .emit("survey-start", { stage: stage });
          survey_in_progress = true;
          stage = 2;
          //send mask
          console.log(time_left, "stage 2");
          let mask_setting = cfg["setting"][stage];
          const rindex = Math.floor(Math.random() * wouldyou.length);
          let topic = wouldyou[rindex];
          topic_selected.push(topic);
          io.sockets
            .in(room)
            .emit("stage-control", { mask: mask_setting, topic: [topic] });
        }
      } else if (time_left < duration / 3 && time_left > 0) {
        //stage3
        if (stage != 3) {
          io.to("survey-" + room)
            .to(room)
            .emit("survey-start", { stage: stage });
          survey_in_progress = true;
          stage = 3;
          //send mask
          console.log(time_left, "stage 3");
          let mask_setting = cfg["setting"][stage];
          const rindex = Math.floor(Math.random() * quest.length);
          let topic = quest[rindex];
          topic_selected.push(topic);
          io.sockets
            .in(room)
            .emit("stage-control", { mask: mask_setting, topic });
        }
      }

      if (time_left <= 0) {
        if (stage != 4) {
          stage = 4;
          io.to("survey-" + room)
            .to(room)
            .emit("survey-start", { stage: stage });
          survey_in_progress = true;
        }
        if (!stop && !survey_in_progress) {
          count += 1;
          console.log("stop count ", count);
          stop = true;
          processStop(room, false);
        }
      }
    }, 1000);
  } else {
    console.log("timmer running", typeof timmer);
  }
}
function processStop(room, accident_stop) {
  if (accident_stop) {
    topic_selected = [];
  }

  survey_in_progress = false;
  // clear timmer
  clearInterval(timmer);
  // socket send stop

  io.to(room).emit("process-stop", { accident_stop });
  io.to("survey-" + room).emit("process-stop", { accident_stop });
}
async function storeData(room) {
  const data = {
    _id: sessionId,
    mask_setting: current_cfg["name"],
    topic: topic_selected,
    duration: current_cfg["setting"][0]["duration"],
    host: {
      emotion: emotion_data["host"],
      question: question_data["host"],
    },
    guest: {
      emotion: emotion_data["guest"],
      question: question_data["guest"],
    },
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
  console.log(data);
  const response = await db.insert(data);
  console.log("restore", response);
  io.in(room).emit("upload-finish");
}

io.sockets.on("connection", (socket) => {
  let room = "";
  // sending to all clients in the room (channel) except sender
  socket.on("message", (message) =>
    socket.broadcast.to(room).emit("message", message)
  );
  socket.on("find", () => {
    const url = socket.request.headers.referer.split("/");
    room = url[url.length - 1];
    const sr = io.sockets.adapter.rooms[room];
    if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit("create");
    } else if (sr.length === 1) {
      socket.emit("join");
    } else {
      // max two clients
      socket.emit("full", room);
    }
  });
  socket.on("auth", (data) => {
    data.sid = socket.id;
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit("approve", data);
  });
  socket.on("accept", (id) => {
    io.sockets.connected[id].join(room);
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit("bridge");
  });
  socket.on("reject", () => socket.emit("full"));

  socket.on("leave", () => {
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit("hangup");
    socket.leave(room);
  });
  // control room record
  socket.on("control-room", (data) => {
    const room = data.room;
    control_room_list[room] = socket;
  });
  socket.on("room-idle", (data) => {
    const { room } = data;
    // console.log(`room ${room} is idle now`);
    io.to("survey-" + room).emit("room-idle");
    processStop(room, true);
  });
  socket.on("survey-connect", (data) => {
    const { room, user } = data;
    socket.join("survey-" + room);
    survey_socket[user] = socket;
  });
  // survey send and control
  socket.on("survey-start", (data) => {
    console.log("survey start", data);
    const params_room = data.room;
    socket.broadcast.to(params_room).emit("survey-start");
    socket.broadcast.to("survey-" + params_room).emit("survey-start");
  });
  socket.on("survey-end", (data) => {
    const { room, user } = data;
    survey_ready[user] = true;
    if (survey_ready["guest"] && survey_ready["host"]) {
      survey_in_progress = false;
      survey_ready = { host: false, guest: false };
      let startTime = new Date().getTime();
      let { duration } = current_cfg["setting"][0];
      duration = (duration / 3) * (4 - stage);
      console.log("survey-end", duration);
      io.to(room).emit("survey-end", { startTime, duration });
    }
  });
  socket.on("reset", (data) => {
    const { room } = data;
    processStop(room, true);
  });

  socket.on("face-detected", (data) => {
    const { room, user } = data;
    if (survey_socket[user] != undefined) {
      const sid = survey_socket[user].id;
      io.to(sid).emit("face-detected");
      io.to(room).emit("face-detected", user);
    }
  });
  socket.on("process-control", (data) => {
    const params_room = data.room;

    current_cfg = data.cfg;
    current_rating = data.topic;

    socket.broadcast.to(params_room).emit("process-control");
  });
  socket.on("process-ready", (data) => {
    const room = data.room;
    const user = data.user;
    // socket.broadcast.to(room).emit("process-start");
    console.log(`${user} in room ${room} is ready`);
    if (room in ready_user_by_room) {
      ready_user_by_room[room][user] = true;
      if (
        ready_user_by_room[room]["host"] &&
        ready_user_by_room[room]["guest"]
      ) {
        try {
          console.log("both ready, start the process");
          let startTime = new Date().getTime();
          // processStart(room, startTime, current_cfg);

          sessionId = generateId(new Date(startTime));
          let mask_id = Math.floor(Math.random() * 3);
          current_cfg = require("./assets/MaskSetting/" +
            mask_set[mask_id] +
            ".json");
          current_rating = "general";
          processStart(room, startTime, current_cfg);
          const { duration } = current_cfg["setting"][0];
          io.to(room).emit("process-start", { startTime, duration });
          io.to("survey-" + room).emit("process-start");
          ready_user_by_room[room] = {
            host: false,
            guest: false,
          };
        } catch (err) {
          console.log("please confirm that the admin have start the process");
          console.log(err);
        }

        // socket.broadcast.to(room).emit("process-start");
        // socket.emit("process-start");
      }
    } else {
      ready_user_by_room[room] = {
        host: false,
        guest: false,
      };
      ready_user_by_room[room][user] = true;
    }
  });
  socket.on("process-in-progress", (data) => {
    console.log(data);
    const params_room = data.room;
    control_socket = control_room_list[params_room];
    control_socket.emit("process-in-progress", { time_diff: data.time_diff });
  });
  socket.on("process-stop", (data) => {
    const params_room = data.room;
    control_socket = control_room_list[params_room];
    control_socket.emit("process-stop");
  });

  socket.on("data-send", (data_get) => {
    console.log(data_get);
    const { data_type, data, user, room } = data_get;
    if (data_type == "question") {
      question_ready[user] = true;
      question_data[user] = data;
    } else if (data_type == "emotion") {
      emotion_ready[user] = true;
      emotion_data[user] = data.record_detail;
    }
    if (
      emotion_ready["host"] &&
      emotion_ready["guest"] &&
      question_ready["host"] &&
      question_ready["guest"]
    ) {
      storeData(room);
    }
  });

  socket.on("control", (data) => {
    const params_room = data.room;
    const params_data = data.data;
    console.log("control data:", data);
    socket.broadcast.to(params_room).emit("control", params_data);
  });
});
