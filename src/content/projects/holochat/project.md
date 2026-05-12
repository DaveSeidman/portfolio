---
name: HoloChat
title: Real-Time Holographic Chat App
slug: HoloChat
shape: Head
order: 3
tags:
  - holography
  - frontend
  - backend
  - experiment
---
HoloChat is a browser-based holographic chat application. It extrudes the user's face in 3D, allowing them to pan, zoom, and rotate around their features. Users can also drag and drop the window into a <a href='https://lookingglassfactory.com/product/overview' target='_blank'>Looking Glass</a> to view themselves as a live hologram. Users can also connect to others for two-way holographic calls:

::video
src: ./media/holochat.mp4
poster: ./media/holochat.png
::

I used <a href='https://developers.google.com/mediapipe' target='_blank'>MediaPipe's</a> facial tracking and body segmentation to create an approximate mesh with the webcam image. WebRTC allows the video and mesh data to be streamed to the other user's screen.

Check it out for yourself: <a href='https://holochat.app' target='_blank'>holochat.app</a>
