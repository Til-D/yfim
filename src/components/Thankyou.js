import React, { useEffect, useState } from "react";

export default function Thankyou() {
  return (
    <div className="topic">
      <p className="topic_head">THANK YOU</p>
      <p className="topic_text">
        <br />
        This artwork is a live experiment. With your participation, <br />
        you have contributed to the next iteration of this work.
        <br />
        <br />
        Thank you for your participation in Your Face is Muted. To <br />
        find out more about this research progress and outcomes,
        <br />
        you can visit <span style={{ color: "red" }}>yourfaceismuted.com</span>
      </p>
    </div>
  );
}
