import React, { useEffect, useState } from "react";

function Announcement(props) {
  const [rating, setRating] = useState("kids");
  const [checked, setCheck] = useState(false);
  const [record, setRecord] = useState(false);
  function onSubmit() {
    props.handler({ rating, record });
  }
  const handleCheck = (event) => {
    setCheck(event.target.checked);
    if (event.target.checked && rating != "mature") {
      setRating("mature");
    }
    if (!event.target.checked && rating != "kids") {
      setRating("kids");
    }
  };
  const handleCheck2 = (event) => {
    setRecord(event.target.checked);
    console.log(event.target.checked);
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
        overflow: "scroll",
      }}
    >
      <h
        style={{
          margin: "0 auto",
        }}
      >
        Consent Form
      </h>
      <p
        style={{
          margin: "20px",
          fontSize: "20px",
        }}
      >
        This experience has been created by researches at the University of
        Melbourne. <i>Your Face is Muted</i> explores how a lack of non-verbal
        cues affects critical conversations and our ability to empathise. You
        can support this research by participating in the experience. To do so,
        we kindly ask you to sign the following consent form:
        <br />
        1. I consent to participate in this project knowing that I can request
        further information by contacting the creators of this work or asking a
        floor assistant.
        <br />
        2. I understand that the purpose of this research is to investigate how
        obfuscation of facial features, visuals, and audio can influence
        people’s ability to empathise with a conversation partner.
        <br />
        3. In this project I will participate in a conversation with another
        person. The conversation will last for about 5 minutes.
        <br />
        4. I understand that the conversation will be transmitted through video,
        and I will see my conversation partner through a web-camera.
        <br />
        5. I understand that my participation in this project is for research
        purposes only.
        <br />
        6. I understand that during the conversation, I will be asked to report
        my emotional states and assess the emotions of my conversation partner
        in a popup window that appears on the iPad screen.
        <br />
        7. I understand that my voice will be recorded by the software.
        <br />
        8. I understand that my participation is voluntary and that I am free to
        withdraw from this project by simply standing up anytime without
        explanation or prejudice and to withdraw any unprocessed data that I
        have provided.
        <br />
        9. I understand that the data from this research will be stored at the
        University of Melbourne and will be destroyed 5 years after last
        publication.
        <br />
        10. I have been informed that the confidentiality of the information I
        provide will be safeguarded subject to any legal requirements; my data
        will be password protected and accessible only by the researchers in
        question.
      </p>

      <div
        style={{
          margin: "10px",
        }}
      >
        <input type="checkbox" onChange={handleCheck} />
        <span class="checkboxtext"> I am over 18 years old </span>
      </div>

      <div
        style={{
          margin: "10px",
        }}
      >
        <input type="checkbox" onChange={handleCheck2} />
        <span class="checkboxtext">I agree to record the video and voice</span>
      </div>

      <button
        style={{
          margin: "10px",
        }}
        onClick={onSubmit}
      >
        {props.stage}
      </button>
    </div>
  );
}
export default Announcement;
