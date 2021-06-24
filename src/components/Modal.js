import React, { Component } from "react";
import PropTypes from "prop-types";
import "../GYModal.css";
export default class GYModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    children: PropTypes.element,
  };
  static defaultProps = {
    visible: false,
    title: "Title",
    onOk: () => {},
    onCancel: () => {},
  };
  render() {
    const { visible, title, children, onOk, onCancel } = this.props,
      show = { zIndex: 2000, opacity: 1 },
      hide = { zIndex: -1, opacity: 0 },
      contShow = {
        width: "600px",
        height: "200px",
        backgroundColor: "#1ab394",
        textAlign: "center",
      },
      contHide = { width: "0px", height: "0px" };
    return (
      <div className="gy-modalContainer" style={visible ? show : hide}>
        <div className="mask" onClick={onCancel}></div>
        <div className="innerContent" style={visible ? contShow : contHide}>
          {/* <div className="innerContent-header">
            <div className="innerContent-title">{title}</div>
          </div> */}
          <div className="innerContent-center">{children}</div>
          {/* <div className="innerContent-footer">
            <button type="cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="primary" onClick={onOk}>
              OK
            </button>
          </div> */}
        </div>
      </div>
    );
  }
}
