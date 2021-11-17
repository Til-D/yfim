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

Start the server

```bash
nohup yarn start &
```

You can find all the output in the nohup.out file

ssl files: (public and private key)
at the first time to start the server, you need to copy and rename the valid public and private key into the repo directory
cp /etc/letsencrypt/live/www.happychat.tech/fullchain.pem ./rtc-video-room-cert.pem
cp /etc/letsencrypt/live/www.happychat.tech/privkey.pem ./rtc-video-room-key.pem

nginx: just for reverse proxy as server only open 80, 443 port outside
config file: /etc/nginx/sites-available/default

remember to restart nginx when you change the setting by using

The app can be accessed at:

```bash
https://localhost:3000
```

## Development

the website user see is in the dist/index.html, it have a main.js, which will be updated by webpack when we updates the code in src/

change files in the src/ directory when you need to change html or js or css, before you start, run the following command

```bash
yarn run watch
```

save your change and wait, it will take some time to pack the change and update the main.js

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

## Code Structure

The three main screens are managed as follows

- Main video screen: (MediaContainer.js)[src/containers/MediaContainer.js]
- Survey screen: (SurveyPage.js)[src/containers/SurveyPage.js]
- Projection screen: (ProjectionPage.js)[src/containers/ProjectionPage.js]

Main app flow and modules are managed by the (MediaContainer.js)[src/containers/MediaContainer.js] file.

## Demo

https://www.happychat.tech

# TODOs

- recording of voice should be made optional (add second checkbox to consent form)
- kids should also get 'general' topics

# Ideas

- at the end of the experience, display how accurate participants were able to guess their partner's emotion throughout the experience (i.e., guessed emotion vs. self-reported ground truth)

# Authors
- Hao Huang
- [Tilman Dingler](https://github.com/Til-D/)


Release under The MIT License (MIT), copyright: Tilman Dingler, 2017
