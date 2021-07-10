import React, { useEffect, useState } from "react";
const stage_name = {
  1: "ICE BREAKER",
  2: "WOULD YOU RATHER",
  3: "DEBATE",
};
export default function SurveyOngoing(props) {
  let { stage } = props;
  if (stage > 3) {
    stage = 3;
  }
  return (
    <div className="survey_topic">
      <p className="survey_topic_head">
        PART {stage} of 3<br />
        {stage_name[stage]}
      </p>
      <p className="survey_topic_text">
        See prompts on screen. Talk about this with your partner.
      </p>
    </div>
  );
}
