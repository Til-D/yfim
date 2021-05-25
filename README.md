# WebRTC video chat app with ReactJS

## Application Logic and Implementations

To connect two users over WebRTC, we exchange information to allow browsers to talk to each other. This process is called signaling and it is facilitated by using NodeJS and socket server chained to the express 4.0 engine to provide the plumbing. Other than signaling, no data has to be sent through a server. When a connection is successfully established and authentication and authorization are complete, stream data exchanged between peers is directed to a React component for rendering.

## Installation

Once you have forked this project, go ahead and use npm through the command line to install all required dependecies:

```bash
npm i
npm start
```

The app can be accessed at:

```bash
https://localhost:3000
```

## Structure

    /r/:room            -- Chating room
    /game/:room         -- Similar to Survey page
    /control/:room      -- control : survey,game,...
    /projection         -- projection pages
    /survey             -- survey pages

## Develop guidance

There are two ways to develop separate works, one of which is using React built-in router while another is using express router.

1. For the first one, developer can write the frontend js files in the src directory and import them as a component and add them in /src/index.js
2. For the second one, using express router, developer can write static html files in the directory /public and configure the path setting in /routes.

## Demo

https://www.happychat.tech

#### License

MIT License

Copyright (c) 2015 Dian Dimitrov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
