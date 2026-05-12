---
name: Wedding Website
title: DeepZoom Viewer Integration
slug: Wedding
shape: Bell
order: 12
tags:
  - frontend
---
For our wedding, I wanted to create a simple, informational site that everyone from our younger cousins to our older relatives could easily access on desktop or mobile. We had a couple of events leading up to the wedding, a guestbook, a photo gallery, directions and hotel information, a blog, and a few other pages. I had been inspired by Blaise Arcas' <a href='https://www.ted.com/talks/blaise_aguera_y_arcas_how_photosynth_can_connect_the_world_s_images' target='_blank'>TED Talk</a> about an exciting new technology called PhotoSynth. So I turned each of those into a "vignette" that became part of a larger canvas. I used Photoshop's Large Document Format to stitch it all into a single image that tipped the scales at over 4GB. There was a large background plate, but each of the "vignettes" was linked as a smart object so I could work on them individually without overloading my graphics card.

::video
src: ./media/wedding.mp4
poster: ./media/wedding.png
::

I used Seadragon's (now Microsoft's) DeepZoom JavaScript library to implement the navigation. It was pretty free-form, allowing the user to zoom in/out and pan in any direction. I also included links that performed the zoom and pan automatically. The code was intelligent enough to keep the live content onscreen no matter the user's aspect ratio.

The end result was fun but informative, and I'm proud to say that even the octogenarians on our list were able to use it. Check it out <a href='https://daveseidman.gitlab.io/wedding' target='_blank'>here</a>.
