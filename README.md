# YourFaceisMuted with ReactJS

## Introduction

<i>Your Face is Muted</i> xplores how a lack of non-verbal cues
affects critical conversations and our ability to empathise.
This is a two person experience. Please take a seat and wait
for your conversation partner.

## Start Application

```bash
npm i or yarn
npm start or yarn start

```

The app can be accessed at:

```bash
https://localhost:3000
```

## Structure

    /r/:room                      -- Chating room
    /projection/:room/:usertype   -- projection pages
    /s/:room/:usertype            -- survey pages

## User Guidance

- following path will use 1 as room number as an example

### Pages

- User: Host/Guest
- Chat room: https://localhost:3000/r/1/:user
- survey page: https://localhost:3000/s/1/:user (user here can be host or guest)
- projection page: https://localhost:3000/projection/1/:user

## Developers' Guide

Developer can write the frontend js files in the src directory and import them as a component and add them in /src/index.js

## Server Data

### Data

- Mask setting (endWithEyes,...)
- Questionnaire_set ()

## Data Schema

In this project, we are going to use couchDB as database to restore json format data.

```json
// sessionid is the time process started and formatted like "year/month/day/hour/min/second" e.g. "2020/6/1/6/15/24"
{
  "_id": "sessionId",
  "time": "UTC",
  "mask_setting": "endWithEyes",
  "topic": ["icebreaker", "wouldyou", "quest"],
  "duration": "180", //(optional, process duration)
  "host": {
    "question": [
        {
            "submit_time": "UTC",
            "result":{
                "question1": "item1",
                "question2": "item2"
            },
        },
        {},
        {}
    ],
    "emotion": [{"stage1 emotion see below"}, {}, {}]
  },
  "guest": {
    //same as host
  }
}
```

For each stage emotion:

```json
{
  "record_count": 30,
  "record_detail": [
    {
      "timestamp": "UTC",
      "time_slot": 9, //indicate x(9) seconds since the stage start
      "emotion": {
        "angry": 0.09234,
        "disgusted": 0,
        "fearful": 0,
        "happy": 1,
        "neutral": 0,
        "sad": 0,
        "surprised": 0
      }
    },
    {},
    {} // ...
  ]
}
```

## Demo

https://www.happychat.tech

# TODOs

- recording of voice should be made optional (add second checkbox to consent form)
- kids should also get 'general' topics

# Ideas

- at the end of the experience, display how accurate participants were able to guess their partner's emotion throughout the experience (i.e., guessed emotion vs. self-reported ground truth)
