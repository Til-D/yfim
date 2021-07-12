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

const video_set = [v_green, v_yellow, v_red];

export default function ProjectionPage(props) {
  const [videoid, setVideoid] = useState(1);

  useEffect(() => {
    const socket = io.connect();
    socket.emit("projection-connect", {
      room: props.match.params.room,
      user: props.match.params.user,
    });

    socket.on("stage-control", (data) => {
      const { stage } = data;
      if (stage > 3) {
        setVideoid(1);
      } else {
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
        <source src={video_set[videoid - 1]} type="video/mp4"></source>
      </video>
    </div>
  );
}
