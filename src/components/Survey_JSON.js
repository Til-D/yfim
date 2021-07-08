export const surveyJSON = {
  pages: [
    {
      name: "interstage",
      elements: [
        {
          type: "radiogroup",
          name: "question1",
          title: "Which emotion describes your current feeling best?",
          choices: [
            {
              value: "item1",
              text: "Neutral",
            },
            {
              value: "item2",
              text: "Happy",
            },
            {
              value: "item3",
              text: "Sad",
            },
            {
              value: "item4",
              text: "Angry",
            },
            {
              value: "item5",
              text: "Surprised",
            },
          ],
        },
        {
          type: "radiogroup",
          name: "question2",
          title: "How do you think does your conversation partner currently feel?",
          choices: [
            {
              value: "item1",
              text: "Neutral",
            },
            {
              value: "item2",
              text: "Happy",
            },
            {
              value: "item3",
              text: "Sad",
            },
            {
              value: "item4",
              text: "Angry",
            },
            {
              value: "item5",
              text: "Surprised",
            },
          ],
        },
      ],
      title: "Question!",
      description: "",
    },
  ],
};
