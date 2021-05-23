const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const sio = require("socket.io");
const favicon = require("serve-favicon");
const compression = require("compression");
const bodyParser = require("body-parser");
const nano = require("nano")("http://admin:158131@localhost:5984");
// authenticate

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

// app.use(bodyParser.json());
app.get("/test", (req, res) => {
  // io.emit("hangup");
  io.to("111111").emit("hangup");
  console.log(io.sockets.adapter.rooms);
  res.json("hello world!");
});

// compress all requests
app.set("socketIo", io);
app.use(compression());
app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => res.sendFile(__dirname + "/dist/index.html"));

app.use(favicon("./dist/favicon.ico"));
// Switch off the default 'X-Powered-By: Express' header
app.disable("x-powered-by");

control_room_list = {};
ready_user_by_room = {};

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
  socket.on("survey", (data) => {
    console.log(data);
    const params_room = data.match.params.room;
    // socket.broadcast.to(params_room).emit("hangup");
  });
  socket.on("leave", () => {
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit("hangup");
    socket.leave(room);
  });
  // control room record
  socket.on("control-room", (data) => {
    const room = data.room;
    control_room_list[room] = socket;
    console.log(control_room_list);
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
  // process control
  socket.on("process-control", (data) => {
    const params_room = data.room;
    const cfg = data.cfg;
    socket.broadcast.to(params_room).emit("process-control", { cfg: cfg });
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
        socket.broadcast.to(room).emit("process-start");
        socket.emit("process-start");
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

  // send emotion data to database
  socket.on("emotion-send", (data) => {
    const params_room = data.room;
    const params_data = data.data;
    restore_emotion(params_room, params_data);
    console.log(params_data);
  });
  socket.on("control", (data) => {
    const params_room = data.room;
    const params_data = data.data;
    console.log("control data:", data);
    socket.broadcast.to(params_room).emit("control", params_data);
  });
  socket.on("survey-connect", (data) => {
    const params_room = data.room;
    socket.join("survey-" + params_room);
  });
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
