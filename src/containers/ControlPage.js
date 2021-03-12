import React from "react";
import ToolBar from "../components/ToolBar";
import { Typography } from "@material-ui/core";
import io from "socket.io-client";

const useStyles = makeStyles((theme) => ({
  toolBar: {
    zIndex: 20,
    right: 0,
    top: "50px",
    backgroundColor: "white",
    position: "absolute",
    flexDirection: "col",
  },
  toggleSwitch: {
    // display: "flex",
    flexDirection: "row",
  },
}));

export default function ControlPage(props) {
  const room = props.match.params.room;
  const socket = io.connect();
  const handleControl = (data) => {
    socket.emit("control", { room: room, controlParams: data });
  };
  return (
    <div>
      <div>DashBoard</div>
      <Typography>Host</Typography>
    </div>
  );
}

// const mapStateToProps = (store) => ({ controlParams: store.controlParams });
// const mapDispatchToProps = (dispatch) => {};
// export default connect(mapStateToProps, mapDispatchToProps)(ControlPage);
export default ControlPage;
