import React, { Component } from "react";
import MediaContainer from "./MediaContainer";
import CommunicationContainer from "./CommunicationContainer";
import { connect } from "react-redux";
import store from "../store";
import io from "socket.io-client";

const useStyles = (theme) => ({
  toolBar: {
    position: "absolute",
    zIndex: 120,
    left: 0,
    bottom: 0,
    display: "flex",
  },
});

class RoomPage extends Component {
  constructor(props) {
    super(props);
    this.getUserMedia = navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .catch((e) => alert("getUserMedia() error: " + e.name));
    this.socket = io.connect();
    console.log("socket create", this.socket);
  }
  componentDidMount() {
    this.props.addRoom();
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        <MediaContainer
          media={(media) => (this.media = media)}
          socket={this.socket}
          getUserMedia={this.getUserMedia}
        />
        <CommunicationContainer
          socket={this.socket}
          media={this.media}
          getUserMedia={this.getUserMedia}
        />
      </div>
    );
  }
}
const mapStateToProps = (store) => ({ rooms: new Set([...store.rooms]) });
const mapDispatchToProps = (dispatch, ownProps) => ({
  addRoom: () =>
    store.dispatch({ type: "ADD_ROOM", room: ownProps.match.params.room }),
});
export default connect(mapStateToProps, mapDispatchToProps)(RoomPage);
