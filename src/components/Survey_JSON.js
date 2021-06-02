export const surveyJSON = {
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "radiogroup",
          name: "Questionnaire",
          title: "What's your current emotion?",
          choices: [
            {
              value: "item1",
              text: "Neural",
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
              text: "Suprised",
            },
          ],
        },
        {
          type: "radiogroup",
          name: "question2",
          title: "What's your friend's current emotion?",
          choices: [
            {
              value: "item1",
              text: "Neural",
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
              text: "Suprised",
            },
          ],
        },
      ],
      title: "Question!",
      description: "",
    },
  ],
};
