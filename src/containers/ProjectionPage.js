import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
const v_yellow =
  "https://yourfaceismute.s3.ap-southeast-2.amazonaws.com/Gradient-yellow.mp4";
const v_red =
  "https://yourfaceismute.s3.ap-southeast-2.amazonaws.com/Gradient-red.mp4";
const v_blue =
  "https://yourfaceismute.s3.ap-southeast-2.amazonaws.com/Gradient-blue.mp4";
const v_green =
  "https://yourfaceismute.s3.ap-southeast-2.amazonaws.com/Gradient-green.mp4";
const v_white =
  "https://yourfaceismute.s3.ap-southeast-2.amazonaws.com/Gradient-white.mp4";

const video_set = [v_white, v_green, v_yellow, v_red];

// io connect, reset process stop, update when stage change

export default function ProjectionPage(props) {
  const [videoid, setVideoid] = useState(0);

  useEffect(() => {
    const socket = io.connect("/control");
    socket.emit("projection-connect", {
      room: props.match.params.room,
      user: props.match.params.user,
    });
    socket.on("process-stop", () => {
      setVideoid(0);
    });
    socket.on("stage-control", (data) => {
      const { stage } = data;
      console.log("stage ", stage);
      if (stage < 4) {
        setVideoid(stage);
      }
    });
  }, []);

  return (
    <div>
      <p>test</p>
      <video
        key={videoid}
        controls
        autoPlay
        loop
        muted
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          position: "fixed",
          left: 0,
          top: 0,
        }}
      >
        <source src={video_set[videoid]} type="video/mp4"></source>
      </video>
    </div>
  );
}
