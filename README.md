# WebRTC video chat app with ReactJS

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

    /r/:room            -- Chating room
    /control/:room      -- control : survey,game,...
    /projection         -- projection pages
    /survey             -- survey pages

## User Guidance

- following path will use 1 as room number as an example

### Pages

- User: Host/Guest
- video room: https://url/r/1
- survey page: https://url/s/1/:user (user here can be host or guest)
- control page: https://url/control/1

### Step:

1. Both guest and host join room in the same video room
2. The administrator need to use control page to choose what topics and mask type are used in the following conversation and click the Button Process Start
3. use Ipad or browser(if running on localhost) enter survey page
4. when the cam detect your face, survey page would show user the introduction of the project

## Developers' Guide

There are two ways to develop separate works, one of which is using React built-in router while another is using express router.

1. For the first one, developer can write the frontend js files in the src directory and import them as a component and add them in /src/index.js
2. For the second one, using express router, developer can write static html files in the directory ./backend/public and configure the path setting in ./backend/routes.

## Server Data

### Data

- Mask setting (endWithEyes,...)
- Questionnaire_set ()

## Data Schema

In this project, we are going to use couchDB as database to restore json format data.

```json
// sessionid is the time process started and formatted like "year/month/day/hour/min/second" e.g. "2020/6/1/6/15/24"
"${sessionid}":{
    "mask_setting": "endWithEyes",
    "duration":"90",     //(optional, process duration)
    "host": {
        "emotion":[[],[],[]...], //every second's emotion score, like[0,1,2,3,4,5,...](corresponding to scores of different type of emotion)
        "question":{
            "question_set_id": 1,   //not identify whether it's a question set for adults or kids from the id
            "quesion_answer":[{
                "submit_time": "12", //(second count from the process start)
                "question_id": 1, //from 0-n-1, n for the number of question in current question set
                "answer": 1,
            }]
        }
    },
    "guest":{
        //same as host
    }
}
```

## Demo

https://www.happychat.tech

# TODOs

- recording of voice should be made optional (add second checkbox to consent form)
- kids should also get 'general' topics

# Ideas

- at the end of the experience, display how accurate participants were able to guess their partner's emotion throughout the experience (i.e., guessed emotion vs. self-reported ground truth)

#### License

MIT License

Copyright (c) 2015 Dian Dimitrov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
