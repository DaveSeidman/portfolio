---
name: Parker
title: Interactive Parking Configurator
slug: Parker
shape: Car
order: 9
tags:
  - webgl
  - algorithm design
---
I live in New York City, where parking spots come at a premium. I became curious about whether there were ways to increase the number of parking spaces without making any structural changes. In this interactive WebGL website, you can pick a borough, or section of the city, and play with different parameters like car spacing, parking direction, and whether cars can park on both sides of the street.

::video
src: ./media/parker.mp4
poster: ./media/parker.png
::

Even though the streets weren't 100% accurate, nor were the car dimensions, nor does it take into account unusable spaces, fire hydrants, construction, or any of the other 20 reasons that "No you can't park here!" this tool did allow me to quickly try out different parking scenarios and see the results.

This visualization required some interesting logic as well as a good rendering pipeline to handle all the geometry that may be on screen at once. Three.js's instanced geometry helped a lot, though the amount of instances needed to be flexible. Give it a try <a href='https://daveseidman.gitlab.io/parker/' target='_blank'>here</a>.
