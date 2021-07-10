import React, { useState, useEffect } from "react";
const stage_name = {
  0: "WAITING",
  1: "ICE BREAKER",
  2: "WOULD YOU RATHER",
  3: "DEBATE",
};
const percentage = {
  1: "26%",
  2: "52%",
  3: "78%",
};
export default function SideBar(props) {
  const { stage, side_prompt } = props;
  return (
    <div className="sidebar_container">
      <p className="sidebar_prompt">{side_prompt}</p>
      <p className="sidebar_foot">
        PART {stage} OF 3
        <br />
        {stage_name[stage]}
      </p>
      <hr
        style={{
          position: "absolute",
          bottom: "5%",
          color: "white",
          background: "white",
          height: "4px",
          width: percentage[stage],
          zIndex: 20,
          left: "11%",
        }}
      />
      <hr
        style={{
          position: "absolute",
          bottom: "5%",
          color: "grey",
          background: "grey",
          height: "4px",
          width: "78%",
          left: "11%",
        }}
      />
    </div>
  );
}
