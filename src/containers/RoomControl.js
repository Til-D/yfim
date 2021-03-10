import React, { useEffect } from "react";
import io from "socket.io-client";
import { Link } from "react-router-dom";

export default function RoomControl(props) {
  const socket = io.connect();
  // socket.emit("survey", props);
  const room = props.match.params.room;
  return (
    <div>
      <Link className="primary-button" to={"/survey/" + room}>
        Survey
      </Link>
      {/* <Link className="primary-button" to={"/compete/" + this.state.room}>
        Compete
      </Link> */}
    </div>
  );
}
// class RoomControl extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       room: props.match.params.room,
//     };
//   }
// }
