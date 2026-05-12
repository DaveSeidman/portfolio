---
name: Save Tab
title: Save Tab Soda!
slug: SaveTab
shape: Can
order: 8
tags:
  - webgl
  - websockets
  - frontend
  - backend
  - database
---
Tab™ is a beloved brand of soda made by the Coca-Cola Corporation. Considered the original diet soda, it had a very large and loyal following for decades. That's why when Coke announced its intention to discontinue the brand, Tab lovers across the world banded together to save it. Their plight even made it to the <a href='https://www.nytimes.com/2020/10/16/business/coca-cola-tab.html' target='_blank'>New York Times</a>.

::video
src: ./media/save-tab.mp4
poster: ./media/save-tab.png
::

I personally don't drink the soda, but I thought I might be able to help their cause. I created a website where visitors could see how many people support the cause to save Tab soda, as well as sign their own can, which not only gets added to the pile on their screen, but also to anyone else connected to the app at the same time. This involved setting up an Express server and adding socket support. As visitors sign cans and hit "submit," their signatures are converted to images and stored on the server, along with a database of their name and why they want to save Tab soda.

Some interesting challenges arose on this one, like how to size the tube that collects the cans so that no matter how many cans there are, they reach almost the top without spilling over. Normally this would be a simple volume calculation; however, cans aren't cubes, and they also are being influenced by physics. I ended up taking the average amount of space the cans would take up if they were packed as tightly as possible, and the amount of space they would take up if they were all spheres, and averaging the two.

Try it out <a href='https://save-tab.com' target='_blank'>here</a>.
