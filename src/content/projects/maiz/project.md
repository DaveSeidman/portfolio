---
name: Maíz.Uno
title: WebGL Corn Maze
slug: Maiz
shape: Corn
order: 7
tags:
  - webgl
  - algorithm design
---
After researching several <a href='https://en.wikipedia.org/wiki/Maze_generation_algorithm' target='_blank'>maze generation algorithms</a>, I created an interactive maze game as a React app. I used the Aldous-Broder algorithm to create a matrix of 1's and 0's, which I mapped to "pathways" and "walls" and displayed as light or dark kernels. I then modified the algorithm to cut random pathways between the top and bottom edges of the board, which allowed me to plot the matrix around a cylinder (the cob), resulting in a very interesting type of maze. One where you can travel left, right, up, down, <strong>and around</strong>.

::video
src: ./media/maiz1.mp4
poster: ./media/maiz1.png
::

This worked well, but required a way for the user to see where the cursor is when it travels to the backside of the cylinder. To handle this, I wrote a new type of controller, maybe you'd call it CameraLatheControls, that allows the user to spin an object on its z-axis while also sliding it back and forth along the x-axis.

::video
src: ./media/maiz2.mp4
poster: ./media/maiz2.png
::

I built the game with React Three Fiber and some utilities from React Three Drei. I leveraged instanced geometry for the kernels to save on draw calls. The resulting game is very performant on all devices, including older mobile devices. Give it a play here: <a href='https://maiz.uno' target='_blank'>Maiz.Uno</a>
