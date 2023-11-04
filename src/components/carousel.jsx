// TODO: can occasionally get a project to open as it's moved offscreen

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useForceRender, debounce, setAssetPaths, bioLinks } from '../utils';
import { useSwipeable } from 'react-swipeable';

function Carousel(props) {
  const { projects, setScrollPercent, setScrollSpeed, selected, setSelected } = props;

  const historyLocation = useLocation();
  const [target, setTarget] = useState(0); // ONLY affects the carousel's position, not whether or not to open a slide
  const prevSelected = useRef(selected);
  const focused = useRef(0);
  const slideOpen = useRef(false);
  const slides = useRef([]);
  const slidesRef = useRef();
  const carouselRef = useRef();

  const prevTime = useRef(0);
  const stopped = useRef(true);
  const pointer = useRef({ x: 0, y: 0, previousX: 0, previousY: 0, speedX: 0, speedY: 0, downX: 0, downY: 0, count: 0 });
  const width = useRef(0);
  const position = useRef(0);
  const speed = useRef(0);
  const historyNavigated = useRef(false);
  const resizing = useRef(false);
  const resizeTimeout = useRef(null);

  // const [slideOpened, setSlideOpened] = useState(false);
  const [showHint, setShowHint] = useState(false); // TODO: implement a hint after a long enough delay without a project being opened
  const slideOpened = useRef(false);
  // const showHint = useRef(false);

  const swipeHandlers = useSwipeable({
    onSwiped: (e) => {
      // alert(e.dir);
      const currentSlide = selected !== null ? slides.current[selected].querySelector('.carousel-slides-slide-body') : null;
      // swiping up on a slide that's not open should open it.
      if (e.dir === 'Up' && selected === null) setSelected(focused.current)
      // swiping down on a slide that's open should close it.
      if (e.dir === 'Down' && selected !== null && currentSlide !== null && currentSlide.scrollTop <= 20) {
        setSelected(null);
      }
      // swiping right while a slide is open should go to the next slide
      if (e.dir === 'Right' && selected !== null) {
        const nextSelected = selected === 0 ? slides.current.length - 1 : selected - 1;
        setSelected(nextSelected);
        setTarget(nextSelected);
      }
      // swiping left while a slide is open should go to the prev slide
      if (e.dir === 'Left' && selected !== null) {
        const nextSelected = selected === slides.current.length - 1 ? 0 : selected + 1;
        setSelected(nextSelected);
        setTarget(nextSelected);
      }
    }
  })

  const carouselRefPassthrough = (el) => {
    swipeHandlers.ref(el);
    carouselRef.current = el;
  }

  const historyCopy = useRef([]);

  const inertia = 0.95;
  const minimumSpeed = 0.001;

  const forceRender = useForceRender();

  // TODO: swap for a useRef?
  let animation;

  const animate = (time) => {
    const timeDelta = time - prevTime.current;
    prevTime.current = time;

    if (resizing.current) return;

    if (Math.abs(speed.current) >= minimumSpeed) {
      speed.current *= inertia;
      setScrollSpeed(speed.current);
      position.current += speed.current;
      slides.current.forEach((slide, index) => {
        if (speed.current < 0) {
          if (parseInt(slide.getBoundingClientRect().left, 10) < -width.current) {
            slide.offset += (width.current * slides.current.length);
            slide.style.transform = `translateX(${slide.offset}px)`;
          }
        } else if (parseInt(slide.getBoundingClientRect().left, 10) > width.current) {
          slide.offset -= (width.current * slides.current.length);
          slide.style.transform = `translateX(${slide.offset}px)`;
        }
      });

      let nextScrollPercent = (-position.current % (width.current * slides.current.length)) / (width.current * slides.current.length);
      if (nextScrollPercent < 0) nextScrollPercent = 1 + nextScrollPercent;
      setScrollPercent(nextScrollPercent);
      let nextfocused = Math.round(nextScrollPercent * slides.current.length);
      if (nextfocused >= slides.current.length) nextfocused = 0;
      focused.current = nextfocused;
      forceRender();
    }
    else if (!stopped.current) stopped.current = true;
    animation = requestAnimationFrame(animate);
  };

  const resizeStart = () => {
    // if (resizeTimeout.current) {
    //   clearTimeout(resizeTimeout.current);
    //   resizeTimeout.current = null;
    // }
    // resizing.current = true;
    // resizeTimeout.current = setTimeout(() => {
    //   resizing.current = false;
    // }, 1000)
  }

  const resize = () => {
    width.current = carouselRef.current.getBoundingClientRect().width;
    slides.current.forEach((slide, index) => {
      slide.style.width = `${width.current}px`;
      slide.offset = width.current * index;
      slide.style.transform = `translateX(${slide.offset}px)`;
    });
  };

  // navigation initiated by a change in the history object (browser back or forward buttons, or user rewrote url)
  useEffect(() => {
    // TODO: if this is app load we should open the project
    const nextSelected = projects.findIndex(p => p.slug === historyLocation.pathname.slice(1));
    if (nextSelected >= 0) {
      setTarget(nextSelected);

      // set this to true momentarily so that the carousel doesn't
      // try to add history states while it navigates
      historyNavigated.current = true;
      setTimeout(() => {
        // TODO: would be better to fire this when the carousel stops instead
        historyNavigated.current = false
        setSelected(nextSelected);
      }, 1000);
    }
  }, [historyLocation]);


  const wheel = (e) => {
    if (slideOpen.current) return;
    speed.current = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? -e.deltaY / 3 : -e.deltaX;
    setScrollSpeed(speed.current);
  };

  const handlePointerDown = (e) => {
    pointer.current.count += 1;
    if (slideOpen.current) return;
    pointer.current.down = true;
    pointer.current.downX = e.clientX;
    pointer.current.downY = e.clientY;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
    pointer.current.previousX = e.clientX;
    pointer.current.previousY = e.clientY;
  };

  const centerClosest = () => {
    let tempSpeed = speed.current;
    let finalPosition = position.current;

    while (Math.abs(tempSpeed) >= minimumSpeed) {
      tempSpeed *= inertia;
      finalPosition += tempSpeed;
    }
    const snappedFinalPosition = Math.round(finalPosition / width.current) * width.current;
    speed.current += (snappedFinalPosition - finalPosition) / 19;
  };

  const handlePointerUp = (e) => {
    pointer.current.count -= .5; // TODO: this probably doesn't need to fire twice
    pointer.current.down = false;
    centerClosest();
  };

  const handlePointerMove = (e) => {
    // TODO: this works up until you start clicking on projects
    // if (pointer.current.count > 1) return;
    pointer.current.previousX = pointer.current.x;
    pointer.current.previousY = pointer.current.y;
    if (pointer.current.down) {
      speed.current = e.clientX - pointer.current.x;
      pointer.current.speedX = pointer.current.previousX - e.clientX;
      pointer.current.speedY = pointer.current.previousY - e.clientY;
      setScrollSpeed(speed.current);
    }
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
  };

  const handleKeyDown = ({ code }) => {
    // TODO: cancel this is the command key is down to allow user to navigate back / forth 
    if (code === 'ArrowRight') setTarget(focused.current + 1 > slides.current.length - 1 ? 0 : focused.current + 1);
    if (code === 'ArrowLeft') setTarget(focused.current - 1 < 0 ? slides.current.length - 1 : focused.current - 1);
    if (code === 'ArrowUp' && selected === null) setSelected(focused.current);
    if (code === 'ArrowDown') setSelected(null);
    // if (code === "Enter" || code === 'Space') setSelected(selected === null ? focused.current : null)
    forceRender();
  };

  const handleArrowClick = (e) => {
    const dir = parseInt(e.target.getAttribute('data-dir'), 10);
    let nextTarget = focused.current + dir;
    if (nextTarget > slides.current.length) nextTarget = 0;
    if (nextTarget < 0) nextTarget = slides.current.length - 1;
    setTarget(nextTarget)
  };

  // selected slide changed
  useEffect(() => {
    if (selected !== null) {
      slideOpened.current = true;
      setShowHint(false);
    }
    // the selected slide was NOT changed by a change to the history object, write it to the history
    if (!historyNavigated.current) {
      history.pushState({}, projects[selected]?.name || '', projects[selected]?.slug || '/');
      historyCopy.current.push(projects[selected]?.slug || '/')
    }

    pointer.current.count = 0;
    const prevSlide = slides.current[prevSelected.current];
    // TODO: move these to "openSlide" and "closeSlide" functions
    if (prevSlide) {
      const videos = Array.from(prevSlide.querySelectorAll('video'));
      // const body = prevSlide.querySelector('.carousel-slides-slide-body'); // TODO: id this better
      // body.scrollTo({ top: 0, behavior: 'smooth' });
      videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
      })
    }

    if (selected !== null) {
      const currentSlide = slides.current[selected];
      const body = currentSlide.querySelector('.carousel-slides-slide-body'); // TODO: id this better
      body.scrollTo({ top: 0, behavior: 'smooth' });
      const firstVideo = currentSlide.querySelector('video');
      if (firstVideo) {
        firstVideo.currentTime = 0;
        // TODO: store this in an array and shut them down on selected changed
        setTimeout(() => { firstVideo.play(); }, 1000);
      }
    }

    slideOpen.current = selected !== null;
    prevSelected.current = selected;
  }, [selected]);

  // target slide has changed, center it in the viewport
  useEffect(() => {
    const { length } = slides.current;
    const leftStraight = { direction: -1, amount: target - focused.current };
    const leftWrapped = { direction: -1, amount: target - focused.current + length };
    const rightStraight = { direction: 1, amount: focused.current - target };
    const rightWrapped = { direction: 1, amount: focused.current - target + length };
    const moves = [leftStraight, rightStraight, leftWrapped, rightWrapped];
    moves.sort((a, b) => (a.amount > b.amount ? 1 : -1));
    const shortestMove = moves.filter(item => item.amount >= 0)[0];
    const move = shortestMove.amount * shortestMove.direction;
    speed.current = (move * width.current) / 19;
    centerClosest();
    setSelected(slideOpen.current ? target : null);
  }, [target]);

  const checkIfSlideOpened = () => {
    if (!slideOpened.current) {
      setShowHint(true);
      setTimeout(() => { setShowHint(false); }, 2000)
    }
  }

  // on load
  useEffect(() => {
    slides.current = Array.from(slidesRef.current.children);
    resize();
    animate();
    const debouncedResize = debounce(resize, 250);

    addEventListener('wheel', wheel, false);
    addEventListener('resize', resizeStart, false);
    addEventListener('resize', debouncedResize, false);
    addEventListener('keydown', handleKeyDown, false);
    addEventListener('pointerdown', handlePointerDown, false);
    addEventListener('pointermove', handlePointerMove, false);
    addEventListener('pointerup', handlePointerUp, false);
    addEventListener('pointerleave', handlePointerUp, false);

    setInterval(checkIfSlideOpened, 10000);

    return () => {
      removeEventListener('resize', resizeStart);
      removeEventListener('resize', debouncedResize);
      removeEventListener('keydown', handleKeyDown);
      removeEventListener('pointerdown', handlePointerDown);
      removeEventListener('pointermove', handlePointerMove);
      removeEventListener('pointerup', handlePointerUp);
      removeEventListener('pointerleave', handlePointerUp);
      cancelAnimationFrame(animation);
    };
  }, []);

  return (
    <div className="carousel"
      {...swipeHandlers}
      ref={carouselRefPassthrough}
    >
      <div
        className="carousel-slides"
        style={{ transform: `translateX(${position.current}px)` }}
        ref={slidesRef}
      >
        {projects.map((project, index) => (
          <div
            key={project.slug}
            className={`carousel-slides-slide ${index === selected ? 'open' : ''} `}
          >
            <div
              className="carousel-slides-slide-header"
              onClick={() => {
                // TODO: before setting selected, lets make sure this was a click and not a drag
                // if (speed.current <= minimumSpeed) {
                if (index === selected) setSelected(null);
                else setSelected(index);
                // }
              }}>
              <h1 className="carousel-slides-slide-header-name">{project.name}</h1>
              <h2 className="carousel-slides-slide-header-title">{project.title}</h2>
            </div>
            <div className="carousel-slides-slide-body">
              <div className='carousel-slides-slide-body-content' dangerouslySetInnerHTML={{ __html: setAssetPaths(project.desc) }} />
              <div className='carousel-slides-slide-body-tags'>
                {
                  // TODO: allow links for tags from home page
                  project.tags.map((tag, index) => (<a
                    key={`${tag}-${index}`}
                    className='carousel-slides-slide-body-tags-tag'
                    target='_blank'
                    href={bioLinks[tag]}
                  >{tag}</a>
                  ))
                }
              </div>
            </div>
          </div>
        ))
        }
      </div>
      <div className="carousel-arrows">
        <button type="button" className="carousel-arrows-arrow left" data-dir="-1" onClick={handleArrowClick} />
        <button type="button" className="carousel-arrows-arrow right" data-dir="1" onClick={handleArrowClick} />
      </div>
      <div className="carousel-dots">
        {projects.map((project, index) => {
          // offset so that the middle dot is the 0th
          let i = index + Math.round(projects.length / 2);
          if (i >= projects.length) i -= projects.length;
          return (<span data={i} key={project.slug} className={`carousel-dots-dot ${i === focused.current ? 'active' : ''} `} />);
        })}
      </div>
      <div className={`carousel-hint ${showHint ? 'active' : ''}`}>
        <p>tap to open</p>
      </div>
    </div >
  );
}

export default Carousel;
