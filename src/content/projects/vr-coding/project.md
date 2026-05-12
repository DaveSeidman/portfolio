---
name: XR Desktop
title: Coding in VR
slug: VR-Coding
shape: Hand
order: 1
tags:
  - webgl
  - websockets
  - virtual reality
  - mixed reality
---
While working on a project for the Oculus browser, I found it frustrating to constantly take my headset on and off to make tweaks to geometry, materials, lights, and other scene parameters. To streamline my workflow, I wrote a small module to stream my desktop over my local network and used it to texture a 3D plane. I added this "monitor" to the scene I was working on in about the same position as my real screen, along with a physically accurate reference model of my keyboard. From that point, I was able to work on the files <span class='italic'>from within the scene</span>. The last hitch was preventing a page refresh, since that requires restarting the XR session. Luckily Webpack's dev server allows for hot module reloading, which allowed me to inject updated code without refreshing the page.

::video
src: ./media/vr-coding.mp4
poster: ./media/vr-coding.png
::

To ground the experience, I added a 3D model of the floor and desk and lined it up with their counterparts in the real world. The end result was extremely pleasing and easier on my eyes than constantly switching between the headset and a monitor.

I <a href='https://gitlab.com/daveseidman/broadcast-desktop' target='_blank'>open-sourced the module</a> and made it very pluggable so other VR developers could leverage it within their own apps. The Twitter community also <a href='https://twitter.com/daveseidman/status/1354949334022938628' target='_blank'>really enjoyed it</a>, sharing and retweeting it many times over.

In the near future, I hope to add some keyboard listeners so that I can see the 3D keyboard's keys go down and up on keypress/release. Also on my list: a simple environment editor so other devs can customize it to fit their unique spaces as well.
