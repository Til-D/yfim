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
        overflow: "scroll",
      }}
    >
      <h
        style={{
          margin: "0 auto",
        }}
      >
        Consent Form
      </h>
      <p
        style={{
          margin: "10px",
          fontSize: "20px",
        }}
      >
        1. I consent to participate in this project, the details of which have
        been explained to me, and I can request a written plain language
        statement to keep.
        <br />
        2. I confirm that I am not under the age of 18.
        <br />
        3. I understand that the purpose of this research is to investigate how
        obfuscation of facial features, visuals, and audio can influence
        people’s ability to empathise with a conversation partner.
        <br />
        4. In this project I will participate in a conversation with another
        person. The conversation will last for approximately 15 minutes.
        <br />
        5. I understand that the conversation will be transmitted through video,
        and I will see my conversation partner through a web-camera.
        <br />
        6. I understand that my conversation partner will see me through a
        web-camera too.
        <br />
        7. I understand that my participation in this project is for research
        purposes only.
        <br />
        8. I understand that during the conversation, I will be asked to report
        my emotional states and assess the emotions of my conversation partner
        in the popup window that appears on the screen.
        <br />
        9. I understand that confidence values of emotions derived from my
        facial expressions will be measured and stored by the software.
        <br />
        10. I understand that my voice will be recorded by the software.
        <br />
        11. I understand that the topics of the conversation will be collected
        and stored by the software.
        <br />
        12. I understand that additional physiological signals may be collected
        using the Empatica E4 wristband.
        <br />
        13. I understand that my participation is voluntary and that I am free
        to withdraw from this project anytime without explanation or prejudice
        and to withdraw any unprocessed data that I have provided.
        <br />
        14. I understand that the data from this research will be stored at the
        University of Melbourne and will be destroyed 5 years after last
        publication.
        <br />
        15. I have been informed that the confidentiality of the information I
        provide will be safeguarded subject to any legal requirements; my data
        will be password protected and accessible only by the named researchers.
        <br />
        16. I understand that my decision on participation in this project will
        not affect my grades in the courses taught or related to any of the
        researchers involved in this study.
        <br />
        17. I understand that the data collected during this study may be reused
        in future work related to emotion recognition and regulation for
        comparison and/or reference purposes. However, it will be only carried
        out by the researchers included in this study.
        <br />
        18. I understand that after I sign and return this consent form, it will
        be retained by the researcher. 19.I acknowledge that the possible
        effects of participating in this research project have been explained to
        my satisfaction.
      </p>

      <div
        style={{
          margin: "10px",
        }}
      >
        <input type="checkbox" onChange={handleCheck} />
        <span class="checkboxtext"> I am under 18 years old (Optional) </span>
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
