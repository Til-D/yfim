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

## Develop guidance

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

#### License

MIT License

Copyright (c) 2015 Dian Dimitrov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
