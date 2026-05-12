---
name: Cam Repeater
title: Digital Periscopes
slug: Cam-Repeater
shape: Periscope
order: 13
tags:
  - computer vision
  - experiment
---
A web app that simulates a "periscope" by placing a series of tablets in a row, or dynamic feedback loops when placed in a ring formation. Every tablet displays a small AR marker in each corner of the screen. Once the next tablet "sees" the markers, it stretches and distorts the image to fill its own screen. Even though the image degrades over distance, each tablet repaints the markers so that the next screen in the sequence can detect them easily.

::video
src: ./media/cam-repeater.mp4
poster: ./media/cam-repeater.png
::

I experimented with a few different types of tablets but found that for covering large distances it was important to have access to the camera's PTZ (Pan/Tilt/Zoom) controls. This kept the image quality higher and meant I could extend the array of tablets further.

Another interesting side effect is the slight delay as the image from the camera is rendered to the screen. In the second half of the video you'll see that by setting up a ring of screens, we were able to "trap" light inside an infinite loop. Unfortunately, the camera firmware would automatically adjust the image for better contrast, so all the pixels in the loop quickly make their way to either 100% white or 100% black. We were still able to create some interesting effects by turning out all the lights and flashing bright lights into the cameras. That image was mostly black and white already, so it was possible to observe blobs of light loop through the ring a few times before fading out.
