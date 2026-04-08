// TODO: can occasionally get a project to open as it's moved offscreen

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useForceRender, debounce, setAssetPaths, bioLinks } from '../utils';

const INERTIA = 0.95;
const MINIMUM_SPEED = 0.001;
const TAP_MOVE_THRESHOLD = 12;
const ARTICLE_EDGE_THRESHOLD = 20;
const WHEEL_ACTION_THRESHOLD = 8;
const WHEEL_ACTION_COOLDOWN = 400;
const WHEEL_EVENT_OPTIONS = { passive: false };

function Carousel(props) {
  const { projects, scrollPercent, scrollSpeed, selected, setSelected } = props;

  const historyLocation = useLocation();
  const [target, setTarget] = useState(0); // ONLY affects the carousel's position, not whether or not to open a slide
  const prevSelected = useRef(selected);
  const focused = useRef(0);
  const slideOpen = useRef(false);
  const slides = useRef([]);
  const slidesRef = useRef();
  const carouselRef = useRef();

  const stopped = useRef(true);
  const pointer = useRef({
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    speedX: 0,
    speedY: 0,
    down: false,
    downX: 0,
    downY: 0,
    axis: null,
    dragged: false,
    count: 0,
  });
  const width = useRef(0);
  const position = useRef(0);
  const speed = useRef(0);
  const historyNavigated = useRef(false);
  const animationFrame = useRef(null);
  const hintInterval = useRef(null);
  const hintTimeout = useRef(null);
  const videoPlayTimeout = useRef(null);
  const historySelectionTimeout = useRef(null);
  const lastWheelActionAt = useRef(0);

  // const [slideOpened, setSlideOpened] = useState(false);
  const [showHint, setShowHint] = useState(false); // TODO: implement a hint after a long enough delay without a project being opened
  const slideOpened = useRef(false);
  // const showHint = useRef(false);

  const swipeHandlers = useSwipeable({
    onSwiped: (e) => {
      // alert(e.dir);
      const currentSlide = selected !== null ? slides.current[selected].querySelector('.carousel-slides-slide-body') : null;
      const horizontalSwipeDistance = Math.abs(e.absX ?? e.deltaX ?? 0);
      // swiping up on a slide that's not open should open it.
      if (e.dir === 'Up' && selected === null && horizontalSwipeDistance <= TAP_MOVE_THRESHOLD) {
        setSelected(focused.current);
      }
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
    },
  });

  const carouselRefPassthrough = (el) => {
    swipeHandlers.ref(el);
    carouselRef.current = el;
  };

  const historyCopy = useRef([]);

  const forceRender = useForceRender();

  const getSelectedSlideBody = () => {
    if (prevSelected.current === null) return null;
    return slides.current[prevSelected.current]?.querySelector('.carousel-slides-slide-body') || null;
  };

  const canRunWheelAction = () => {
    const now = Date.now();
    if (now - lastWheelActionAt.current < WHEEL_ACTION_COOLDOWN) return false;
    lastWheelActionAt.current = now;
    return true;
  };

  const setSelectedByDirection = (direction) => {
    if (prevSelected.current === null) return;
    const nextSelected = (prevSelected.current + direction + slides.current.length) % slides.current.length;
    setSelected(nextSelected);
    setTarget(nextSelected);
  };

  const animate = () => {
    if (Math.abs(speed.current) >= MINIMUM_SPEED) {
      speed.current *= INERTIA;
      scrollSpeed.current = speed.current;
      position.current += speed.current;

      if (slidesRef.current) {
        slidesRef.current.style.transform = `translate3d(${position.current}px, 0, 0)`;
      }

      slides.current.forEach((slide) => {
        const slidePosition = slide.offset + position.current;
        if (speed.current < 0) {
          if (slidePosition < -width.current) {
            slide.offset += (width.current * slides.current.length);
            slide.style.transform = `translate3d(${slide.offset}px, 0, 0)`;
          }
        } else if (slidePosition > width.current) {
          slide.offset -= (width.current * slides.current.length);
          slide.style.transform = `translate3d(${slide.offset}px, 0, 0)`;
        }
      });

      let nextScrollPercent = (-position.current % (width.current * slides.current.length)) / (width.current * slides.current.length);
      if (nextScrollPercent < 0) nextScrollPercent = 1 + nextScrollPercent;
      scrollPercent.current = nextScrollPercent;
      let nextFocused = Math.round(nextScrollPercent * slides.current.length);
      if (nextFocused >= slides.current.length) nextFocused = 0;
      if (nextFocused !== focused.current) {
        focused.current = nextFocused;
        forceRender();
      }
    } else if (!stopped.current) {
      stopped.current = true;
      scrollSpeed.current = 0;
    }
    animationFrame.current = requestAnimationFrame(animate);
  };

  const resize = () => {
    if (!carouselRef.current) return;
    width.current = carouselRef.current.getBoundingClientRect().width;
    position.current = -focused.current * width.current;
    if (slidesRef.current) {
      slidesRef.current.style.transform = `translate3d(${position.current}px, 0, 0)`;
    }
    slides.current.forEach((slide, index) => {
      slide.style.width = `${width.current}px`;
      slide.offset = width.current * index;
      slide.style.transform = `translate3d(${slide.offset}px, 0, 0)`;
    });
  };

  // navigation initiated by a change in the history object (browser back or forward buttons, or user rewrote url)
  useEffect(() => {
    // TODO: if this is app load we should open the project
    const nextSelected = projects.findIndex(p => p.slug === historyLocation.pathname.slice(1));
    if (historySelectionTimeout.current) {
      clearTimeout(historySelectionTimeout.current);
      historySelectionTimeout.current = null;
    }
    if (nextSelected >= 0) {
      setTarget(nextSelected);

      // set this to true momentarily so that the carousel doesn't
      // try to add history states while it navigates
      historyNavigated.current = true;
      historySelectionTimeout.current = setTimeout(() => {
        // TODO: would be better to fire this when the carousel stops instead
        historyNavigated.current = false;
        setSelected(nextSelected);
      }, 1000);
    } else {
      historyNavigated.current = false;
    }

    return () => {
      if (historySelectionTimeout.current) {
        clearTimeout(historySelectionTimeout.current);
        historySelectionTimeout.current = null;
      }
    };
  }, [historyLocation]);


  const wheel = (e) => {
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    const isHorizontalGesture = absX > absY;

    if (slideOpen.current) {
      if (isHorizontalGesture && absX >= WHEEL_ACTION_THRESHOLD && canRunWheelAction()) {
        e.preventDefault();
        setSelectedByDirection(e.deltaX > 0 ? 1 : -1);
        return;
      }

      const selectedSlideBody = getSelectedSlideBody();
      if (!selectedSlideBody || absY < WHEEL_ACTION_THRESHOLD) return;

      const isAtTop = selectedSlideBody.scrollTop <= ARTICLE_EDGE_THRESHOLD;
      const isAtBottom = selectedSlideBody.scrollTop + selectedSlideBody.clientHeight >= (
        selectedSlideBody.scrollHeight - ARTICLE_EDGE_THRESHOLD
      );

      if (
        ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom))
        && canRunWheelAction()
      ) {
        e.preventDefault();
        setSelected(null);
      }
      return;
    }

    if (isHorizontalGesture && absX >= WHEEL_ACTION_THRESHOLD) {
      e.preventDefault();
      speed.current = -e.deltaX;
      scrollSpeed.current = speed.current;
      stopped.current = false;
      return;
    }

    if (e.deltaY > WHEEL_ACTION_THRESHOLD && canRunWheelAction()) {
      e.preventDefault();
      speed.current = 0;
      scrollSpeed.current = 0;
      centerClosest();
      setSelected(focused.current);
    }
  };

  const handlePointerDown = (e) => {
    pointer.current.count += 1;
    pointer.current.down = true;
    pointer.current.downX = e.clientX;
    pointer.current.downY = e.clientY;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
    pointer.current.previousX = e.clientX;
    pointer.current.previousY = e.clientY;
    pointer.current.axis = null;
    pointer.current.dragged = false;
  };

  const centerClosest = () => {
    if (!width.current) return;
    let tempSpeed = speed.current;
    let finalPosition = position.current;

    while (Math.abs(tempSpeed) >= MINIMUM_SPEED) {
      tempSpeed *= INERTIA;
      finalPosition += tempSpeed;
    }
    const snappedFinalPosition = Math.round(finalPosition / width.current) * width.current;
    speed.current += (snappedFinalPosition - finalPosition) / 19;
    stopped.current = false;
  };

  const handlePointerUp = (e) => {
    pointer.current.count = Math.max(0, pointer.current.count - 1);
    pointer.current.down = false;
    if (!slideOpen.current) {
      centerClosest();
    }
  };

  const handlePointerMove = (e) => {
    pointer.current.previousX = pointer.current.x;
    pointer.current.previousY = pointer.current.y;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;

    if (!pointer.current.down) return;

    const movedX = e.clientX - pointer.current.downX;
    const movedY = e.clientY - pointer.current.downY;
    if (!pointer.current.axis) {
      if (Math.hypot(movedX, movedY) < TAP_MOVE_THRESHOLD) return;
      pointer.current.axis = Math.abs(movedX) > Math.abs(movedY) ? 'x' : 'y';
      pointer.current.dragged = true;
    }

    if (slideOpen.current || pointer.current.axis !== 'x') return;

    speed.current = e.clientX - pointer.current.previousX;
    pointer.current.speedX = pointer.current.previousX - e.clientX;
    pointer.current.speedY = pointer.current.previousY - e.clientY;
    scrollSpeed.current = speed.current;
    stopped.current = false;
  };

  const handleKeyDown = ({ code }) => {
    // TODO: cancel this is the command key is down to allow user to navigate back / forth 
    if (code === 'ArrowRight') setTarget(focused.current + 1 > slides.current.length - 1 ? 0 : focused.current + 1);
    if (code === 'ArrowLeft') setTarget(focused.current - 1 < 0 ? slides.current.length - 1 : focused.current - 1);
    if (code === 'ArrowUp' && !slideOpen.current) setSelected(focused.current);
    if (code === 'ArrowDown') setSelected(null);
    // if (code === "Enter" || code === 'Space') setSelected(selected === null ? focused.current : null)
    forceRender();
  };

  const handleArrowClick = (e) => {
    const dir = parseInt(e.target.getAttribute('data-dir'), 10);
    let nextTarget = focused.current + dir;
    if (nextTarget >= slides.current.length) nextTarget = 0;
    if (nextTarget < 0) nextTarget = slides.current.length - 1;
    setTarget(nextTarget);
  };

  const handleSlideHeaderClick = (index) => {
    if (pointer.current.dragged) return;

    if (index === selected) {
      setSelected(null);
      return;
    }

    if (selected === null && index !== focused.current) {
      setTarget(index);
      return;
    }

    setTarget(index);
    setSelected(index);
  };

  // selected slide changed
  useEffect(() => {
    if (videoPlayTimeout.current) {
      clearTimeout(videoPlayTimeout.current);
      videoPlayTimeout.current = null;
    }

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
        videoPlayTimeout.current = setTimeout(() => { firstVideo.play(); }, 1000);
      }
    }

    slideOpen.current = selected !== null;
    prevSelected.current = selected;

    return () => {
      if (videoPlayTimeout.current) {
        clearTimeout(videoPlayTimeout.current);
        videoPlayTimeout.current = null;
      }
    };
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
      if (hintTimeout.current) {
        clearTimeout(hintTimeout.current);
      }
      hintTimeout.current = setTimeout(() => { setShowHint(false); }, 2000);
    }
  };

  // on load
  useEffect(() => {
    slides.current = Array.from(slidesRef.current.children);
    resize();
    animate();
    const debouncedResize = debounce(resize, 250);

    addEventListener('wheel', wheel, WHEEL_EVENT_OPTIONS);
    addEventListener('resize', debouncedResize, false);
    addEventListener('keydown', handleKeyDown, false);
    addEventListener('pointerdown', handlePointerDown, false);
    addEventListener('pointermove', handlePointerMove, false);
    addEventListener('pointerup', handlePointerUp, false);
    addEventListener('pointerleave', handlePointerUp, false);

    hintInterval.current = setInterval(checkIfSlideOpened, 10000);

    return () => {
      removeEventListener('wheel', wheel, WHEEL_EVENT_OPTIONS);
      removeEventListener('resize', debouncedResize);
      removeEventListener('keydown', handleKeyDown);
      removeEventListener('pointerdown', handlePointerDown);
      removeEventListener('pointermove', handlePointerMove);
      removeEventListener('pointerup', handlePointerUp);
      removeEventListener('pointerleave', handlePointerUp);
      clearInterval(hintInterval.current);
      clearTimeout(hintTimeout.current);
      clearTimeout(videoPlayTimeout.current);
      clearTimeout(historySelectionTimeout.current);
      cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <div className="carousel"
      {...swipeHandlers}
      ref={carouselRefPassthrough}
    >
      <div
        className="carousel-slides"
        style={{ transform: `translate3d(${position.current}px, 0, 0)` }}
        ref={slidesRef}
      >
        {projects.map((project, index) => (
          <div
            key={project.slug}
            className={`carousel-slides-slide ${index === selected ? 'open' : ''} `}
          >
            <div
              className="carousel-slides-slide-header"
              onClick={() => handleSlideHeaderClick(index)}
            >
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
