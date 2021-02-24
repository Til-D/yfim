import React from "react";
import { makeStyles, useStyles } from "@material-ui/core/styles";

const Switch = (props) => {
  return (
    <>
      <input
        checked={props.isOn}
        onChange={props.handler}
        id={props.id}
        className="react-switch-checkbox"
        type="checkbox"
      />
      <label
        style={{ backgroundColor: props.isOn && "#06D6A0" }}
        className="react-switch-label"
        htmlFor={props.id}
      >
        <span className={`react-switch-button`} />
      </label>
    </>
  );
};

export default Switch;
