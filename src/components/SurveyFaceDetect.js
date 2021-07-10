import React, { useEffect, useState } from "react";
import ConsentForm from "./ConsentForm";

export default function SurveyFaceDetect(props) {
  const [rating, setRating] = useState("kids");
  const [checked, setCheck] = useState(false);
  const [record, setRecord] = useState(false);
  const [consentF, setConsentF] = useState(false);
  function onSubmit() {
    props.handler({ rating, record });
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
  const handleCheck2 = (event) => {
    setRecord(event.target.checked);
    console.log(event.target.checked);
  };
  return (
    <div className="survey_topic">
      <div className="survey_topic_container">
        <p className="survey_topic_head">YOUR FACE IS MUTED</p>
        <p className="survey_topic_text">
          This experience has been created by researchers at the University of
          Melbourne.
          <br />
          <br />
          Your Face is Muted explores how a lack of non-verbal cues affects
          critical <br />
          conversations and our ability to empathise. By continuing in this
          experience, you <br />
          give consent to the researchers involved.
        </p>
        <br />
        <br />
        <hr
          style={{
            color: "white",
            background: "white",
            height: "2px",
          }}
        />
        <div className="survey_checkbox">
          <input type="checkbox" onChange={handleCheck} />
          <span class="checkboxtext"> I am under 18 years old </span>
        </div>

        <div className={checked ? "survey_diable_checkbox" : "survey_checkbox"}>
          <input type="checkbox" onChange={handleCheck2} disabled={checked} />
          <span class="checkboxtext"> I agree to have my voice recorded</span>
        </div>
        <button className="survey_ready_button" onClick={onSubmit}>
          START
        </button>
        <p
          style={{
            textDecoration: "underline",
            textAlign: "left",
          }}
          onClick={() => setConsentF(!consentF)}
        >
          Read full details of consent form
        </p>
        {consentF && <ConsentForm />}
      </div>
    </div>
  );
}
