import React, { Component } from "react";
import MediaContainer from "./MediaContainer";
import CommunicationContainer from "./CommunicationContainer";
import { connect } from "react-redux";
import store from "../store";
import io from "socket.io-client";
import { surveyJSON } from "../components/Survey_JSON";
import * as Survey from "survey-react";

class RoomPage extends Component {
  constructor(props) {
    super(props);
    this.getUserMedia = navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: { min: 640, ideal: 1280 },
          height: { min: 400, ideal: 720 },
        },
      })
      .catch((e) => alert("getUserMedia() error: " + e.name));
    this.state = {
      survey: false,
    };
    this.socket = io.connect();

    console.log("socket create", this.socket);
  }
  componentDidMount() {
    this.props.addRoom();
  }
  render() {
    return (
      <div>
        <div>
          <MediaContainer
            room={this.props.match.params.room}
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
