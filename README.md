# netQWOP

## Inspiration

One of our favorite old Flash games is [QWOP](http://www.foddy.net/Athletics.html). It's a simple game---sprint a hundred meters straight forward---with a twist: you have to control each muscle in your legs individually. Typically, QWOP will flail down the track for a couple meters before landing in an emphatic faceplant, at which point you lose the game.

## What it does

netQWOP is a version of the original QWOP designed for friends. Making the controls of the original QWOP even more infuriating, in netQWOP, four separate people are each responsible for controlling one part of QWOP's body: swinging out or in his thighs and calves. 

To play, everyone opens the site on their phones, one person opens it on a web browser connected to a big screen, each person types in the game code and picks their control, and you're off to the races. The game also has a global leaderboard, which displays the top 5 farthest runs at the end of every match.

## How we built it

The frontend of the project is build in React, with Zeit's next.js framework for routing, server-side rendering, and styling (CSS-in-JS). The physics engine we used is a JavaScript port of Box2D called planck.js, coupled with our own rendering engine based on an HTML5 `<canvas/>`.

On the backend, the realtime core of the game relies on a server running socket.io, which keeps track of the game lobbies and serves as a message broker between clients. We use Google Cloud Firestore to store and update the leaderboard at the end of each round.

For performance and fast load times, the JS bundles for the host (big-screen) and controller (each player's phone) are compiled and served separately, so no extra dependencies are shipped to the client.

## Challenges we ran into

Getting the physics to work was incredibly difficult. To make the game playable, each joint on QWOP's body had to have constraints (you can't, for instance, bend your knees backwards). We had to tweak the parameters of the simulation a lot---down to the density of QWOP's body, the torque applied by the game controls, and the friction of QWOP's shoes on the track.

## Accomplishments that we're proud of

We're really proud of the user experience of the game---loading it is snappy, rendering is smooth even on low-power platforms, and the navigation is extremely simple.

## What we learned

Learning how physics simulations worked was entirely new for us. We had to learn about all the annoying corners of an iterative solver---how to tweak parameters so objects were stable, torques balanced out, and the model wasn't a jittery mess.


## What's next for netQWOP

In the future, the app could easily be packaged for smart-TV platforms, (maybe using something like Cordova) making it really easy to load straight into the game without messing with getting a computer plugged in and set up.
