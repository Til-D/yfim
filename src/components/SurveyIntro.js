import React, { useEffect, useState } from "react";

export default function SurveyIntro() {
  return (
    <div className="survey_topic">
      <p className="survey_topic_head">YOUR FACE IS MUTED</p>
      <p className="survey_topic_text">
        <i>Your Face is Muted</i> explores how a lack of non-verbal cues affects
        critical conversations and our ability to empathise.
        <br />
        <br />
        This is a two person experience. Please take a seat and wait for your
        conversation partner.
      </p>
    </div>
  );
}
