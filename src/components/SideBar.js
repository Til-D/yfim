import React, { useState, useEffect } from "react";
const stage_name = {
  0: "WAITING",
  1: "ICE BREAKER",
  2: "WOULD YOU RATHER",
  3: "DEBATE",
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
    </div>
  );
}
