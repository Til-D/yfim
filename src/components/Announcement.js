import React, { useEffect, useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";

function Announcement(props) {
  const [rating, setRating] = useState("mature");
  const [checked, setCheck] = useState(false);
  function onSubmit() {
    props.handler(rating);
  }
  const handleCheck = (event) => {
    setCheck(event.target.checked);
    if (event.target.checked && rating != "kids") {
      setRating("kids");
    }
    if (!event.target.checked && rating != "mature") {
      setRating("mature");
    }
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // background: "black",
        zIndex: 100,
        height: "100%",
        width: "100%",
        position: "fixed",
      }}
    >
      <div>
        <h>Consent Form</h>
        <p>This experience will go for 5 minutes broken into 3 sections</p>
        <p>
          During each section you will receive a talking prompt and a survey
          question to answer on this ipad
        </p>
        <input type="checkbox" onChange={handleCheck} />
        <span class="checkboxtext"> I am under 18 years old</span>
        {/* <Checkbox
          checked={checked}
          color="white"
          onChange={handleCheck}
          inputProps={{ "aria-label": "primary checkbox" }}
          label="I am under 18 years old"
        /> */}
      </div>

      <button onClick={onSubmit}>{props.stage}</button>
    </div>
  );
}
export default Announcement;
