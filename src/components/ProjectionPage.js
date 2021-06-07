import React, { useEffect, useState } from "react";
import io from "socket.io-client";

function ProjectionPage(props) {
  const [user, setUser] = useState("host");
  console.log("projection", props);
  const socket = io.connect();
  socket.emit("projection", { user: props.match.params.user });

  useEffect(() => {
    socket.on("projection-start", () => {});
  });

  return (
    <div>
      <div>Hello, welcome to Projection Page of {props.match.params.room}</div>
    </div>
  );
}

export default ProjectionPage;
