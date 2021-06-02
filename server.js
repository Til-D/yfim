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

var surveyRouter = require("./backend/routes/survey");
var projectionRouter = require("./backend/routes/projection");
var indexRouter = require("./backend/routes");
// authenticate

const tableName = "occ2lusion_mask";

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
// app.use(compression());
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "backend", "public")));

app.use("/survey", surveyRouter);
app.use("/projection", projectionRouter);
app.use("/", indexRouter);

// app.use((req, res) => res.sendFile(__dirname + "/dist/index.html"));

app.use(favicon("./dist/favicon.ico"));
// Switch off the default 'X-Powered-By: Express' header
app.disable("x-powered-by");

control_room_list = {};
ready_user_by_room = {};
projection_room_list = {};
survey_room_list = {};

emotion_ready = { host: false, guest: false };
question_ready = { host: true, guest: true };
emotion_data = {
  host: {},
  guest: {},
};
question_data = {
  host: {},
  guest: {},
};

var sessionId;
var qsid;
var timmer;
var current_cfg;

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
  let stage = 0;
  console.log("config ", cfg);
  const { duration } = cfg["setting"][0];

  let endTime = start_time + 1000 * duration;
  // create a timmer
  if (timmer == undefined || (timmer != undefined && timmer["_destroyed"])) {
    // pick up a questionnaire from the list

    // start chatting
    timmer = setInterval(() => {
      let nowTime = new Date().getTime();
      let time_left = Math.round((endTime - nowTime) / 1000);

      if (time_left > (duration * 2) / 3) {
        //stage1
        if (stage != 1) {
          stage = 1;
          //send mask
          console.log(time_left, "stage 1");
          let mask_setting = cfg["setting"][stage];
          io.sockets.in(room).emit("stage-control", mask_setting);
        }
      } else if (time_left < (duration * 2) / 3 && time_left > duration / 3) {
        //stage2
        if (stage != 2) {
          stage = 2;
          //send mask
          console.log(time_left, "stage 2");
          let mask_setting = cfg["setting"][stage];
          io.sockets.in(room).emit("stage-control", mask_setting);
        }
      } else if (time_left < duration / 3) {
        //stage3
        if (stage != 3) {
          stage = 3;
          //send mask
          console.log(time_left, "stage 3");
          let mask_setting = cfg["setting"][stage];
          io.sockets.in(room).emit("stage-control", mask_setting);
        }
      }

      if (time_left <= 0) {
        processStop(room);
      }
    }, 1000);
  } else {
    console.log("timmer running", typeof timmer);
  }
}
function processStop(room) {
  console.log("process stop");
  // clear timmer
  clearInterval(timmer);
  console.log(timmer);
  // socket send stop

  io.in(room).emit("process-stop");
}
async function storeData(room) {
  const data = {
    _id: sessionId,
    mask_setting: current_cfg["name"],
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
  emotion_ready = { host: false, guest: false };
  question_ready = { host: true, guest: true };
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
  // survey send and control
  socket.on("survey-start", (data) => {
    console.log("survey start", data);
    const params_room = data.room;
    socket.broadcast.to(params_room).emit("survey-start");
    socket.broadcast.to("survey-" + params_room).emit("survey-start");
  });
  socket.on("survey-end", (data) => {
    const params_room = data.room;
    const params_data = data.data;
    restore_survey(params_room, params_data);
    console.log(params_data);
  });

  // process control: configuration
  // ready: asking users get ready
  //
  socket.on("process-control", (data) => {
    const params_room = data.room;
    current_cfg = data.cfg;
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
        console.log("both ready, start the process");
        let startTime = new Date().getTime();
        processStart(room, startTime, current_cfg);
        sessionId = generateId(new Date(startTime));
        const { duration } = current_cfg["setting"][0];
        io.sockets.in(room).emit("process-start", { startTime, duration });
        ready_user_by_room[room] = {
          host: false,
          guest: false,
        };
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
  // socket.on("survey-connect", (data) => {
  //   const params_room = data.room;
  //   socket.join("survey-" + params_room);
  // });
});

async function restore_emotion(roomid, data) {
  const tableName = "emotion-" + roomid + "-" + data.user;
  try {
    await nano.db.create(tableName);
  } catch {}

  const emotion_db = nano.db.use(tableName);
  const response = await emotion_db.insert(
    { detail: data.record_detail.slice(1) },
    data.record_detail[0]
  );
}
async function restore_survey(roomid, data) {
  const tableName = "survey-" + roomid + "-" + data.user;
  try {
    await nano.db.create(tableName);
  } catch {
    console.log("exist");
  }
  const survey_db = nano.db.use(tableName);
  const response = await survey_db.insert(
    { result: data.result },
    data.submit_time
  );
}
