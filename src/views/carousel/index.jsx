import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useForceUpdate } from '../../utils';
import Body from './Body';
import './index.scss';

function Carousel(props) {
  const {
    projects, setScrollPercent, setScrollSpeed, selected, setSelected,
    autoResize, direction, snap,
  } = props;

  const distanceMoveThreshold = 30;
  const location = useLocation();


  const [current, setCurrent] = useState(0); // denotes slide closes to center. must always be something between 0 and projects.length
  // const [selected, setSelected] = useState(null); // denotes selected slide / project. can be 0 - slides.length but can also be null if no project selected
  // const [locked, setLocked] = useState(false);
  // const [wheeling, setWheeling] = useState(false);
  const projectOpen = useRef(false);
  const slides = useRef([]);
  const forceUpdate = useForceUpdate();
  const slidesRef = useRef();
  const carouselRef = useRef();
  const pointer = useRef({
    x: 0, y: 0, previousX: 0, previousY: 0, speedX: 0, speedY: 0, downX: 0, downY: 0,
  });
  const inertia = 0.95;
  let width;

  const position = useRef(0);
  const speed = useRef(0);
  let animation;

  const wheel = (e) => {
    if (projectOpen.current) return;
    speed.current = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? -e.deltaY / 3 : -e.deltaX;
    setScrollSpeed(speed.current);
  };

  const handlePointerDown = (e) => {
    if (projectOpen.current) return;
    pointer.current.down = true;
    pointer.current.downX = e.clientX;
    pointer.current.downY = e.clientY;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
    pointer.current.previousX = e.clientX;
    pointer.current.previousY = e.clientY;
  };

  const handlePointerUp = (e) => {
    // console.log(pointer.current.speedX, pointer.current.speedY);
    pointer.current.down = false;
    const distX = pointer.current.downX - e.clientX;
    const distY = pointer.current.downY - e.clientY;
    const distancePointerMoved = Math.sqrt(distX ** 2 + distY ** 2);

    // if (Math.abs(pointer.current.speedX) < 2) {
    //   speed.current = pointer.current.speedX > 0 ? -35 : 35;
    // }
    if (distancePointerMoved > distanceMoveThreshold) {
      let velocityTemp = speed.current;
      let finalPosition = position.current;

      for (let i = 0; i < 200; i += 1) {
        velocityTemp *= inertia;
        finalPosition += velocityTemp;
      }

      const snappedFinalPosition = Math.round(finalPosition / width) * width;
      const velocityAdjustment = (snappedFinalPosition - finalPosition) / 19;
      speed.current += velocityAdjustment;
    }
  };

  const handlePointerMove = (e) => {
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

  const animate = () => {
    // TODO: turn this to a const
    if (Math.abs(speed.current) >= 0.001) {
      speed.current *= inertia;
      setScrollSpeed(speed.current);
      position.current += speed.current;
      slides.current.forEach((slide, index) => {
        if (speed.current < 0) {
          if (parseInt(slide.getBoundingClientRect().left, 10) < -width) {
            slide.offset += (width * slides.current.length);
            slide.style.transform = `translateX(${slide.offset}px)`;
          }
        } else if (parseInt(slide.getBoundingClientRect().left, 10) > width) {
          slide.offset -= (width * slides.current.length);
          slide.style.transform = `translateX(${slide.offset}px)`;
        }
      });

      let nextScrollPercent = (-position.current % (width * slides.current.length)) / (width * slides.current.length);
      if (nextScrollPercent < 0) nextScrollPercent = 1 + nextScrollPercent;
      setScrollPercent(nextScrollPercent);
      setCurrent(Math.round(nextScrollPercent * slides.current.length));

      forceUpdate();
    }
    animation = requestAnimationFrame(animate);
  };

  const resize = () => {
    width = carouselRef.current.getBoundingClientRect().width;
    slides.current.forEach((slide, index) => {
      slide.style.width = `${width}px`;
      slide.offset = width * index;
      slide.style.transform = `translateX(${slide.offset}px)`;
    });
  };

  useEffect(() => {
    const nextSelected = projects.findIndex(p => p.slug === location.pathname.slice(1));
    // setSelected(nextSelected);
    console.log('set selected to', nextSelected);
  }, [location]);


  useEffect(() => {
    // console.log('here', selected, projects[selected]?.slug);
    slides.current = Array.from(slidesRef.current.children);
    resize();
    animate();

    addEventListener('wheel', wheel);
    addEventListener('resize', resize);
    carouselRef.current.addEventListener('pointerdown', handlePointerDown);
    carouselRef.current.addEventListener('pointerup', handlePointerUp);
    carouselRef.current.addEventListener('pointermove', handlePointerMove);
    carouselRef.current.addEventListener('pointerleave', handlePointerUp);

    return () => {
      removeEventListener('wheel', wheel);
      removeEventListener('resize', resize);

      if (carouselRef.current) {
        carouselRef.current.removeEventListener('pointerdown', handlePointerDown);
        carouselRef.current.removeEventListener('pointerup', handlePointerUp);
        carouselRef.current.removeEventListener('pointermove', handlePointerMove);
        carouselRef.current.removeEventListener('pointerleave', handlePointerUp);
      }
      cancelAnimationFrame(animation);
    };
  }, []);

  useEffect(() => {
    // console.log('selected changed', selected, current);
    // TODO: this isn't working properly yet, should push to our state every time
    const slug = projects[selected]?.slug;
    console.log(slug)
    history[slug ? 'replaceState' : 'pushState']({}, null, slug || '/');
    // else history.replaceState({}, null, '/');

    // else location.replace()
    projectOpen.current = selected !== null;

    if (selected !== null) {
      // calculate the shortest move from the current index to the selected index
      // keeping in mind the shortest method
      const { length } = slides.current;
      const { width } = carouselRef.current.getBoundingClientRect();
      const leftStraight = { direction: 1, amount: current - selected };
      const leftWrapped = { direction: 1, amount: current - selected + length };
      const rightStraight = { direction: -1, amount: selected - current };
      const rightWrapped = { direction: -1, amount: selected - current + length };
      const moves = [leftStraight, rightStraight, leftWrapped, rightWrapped];
      moves.sort((a, b) => (a.amount > b.amount ? 1 : -1));
      const shortestMove = moves.filter(item => item.amount >= 0)[0];
      const move = shortestMove.amount * shortestMove.direction;
      // const nextSpeed = (((width / slides.current.length) / 3.09) * 1.95) * move; // TODO <- Figure out the reason for these numbers
      const nextSpeed = (move * width) / (1 - inertia);
      console.log(move, width, inertia, nextSpeed);
      speed.current = nextSpeed;
    }
  }, [selected]);

  return (
    <div className="carousel" ref={carouselRef}>
      <div
        className="carousel-slides"
        style={{ transform: `translateX(${position.current}px)` }}
        ref={slidesRef}
      >
        {projects.map((project, index) =>
        // const body = processText(project.body);
        (
          <div
            key={project.slug}
            className={`carousel-slides-slide ${index === selected ? 'open' : ''}`}
          >
            <div className="carousel-slides-slide-header">
              <h1
                onClick={() => {
                  if (index === selected) setSelected(null);
                  else setSelected(index);
                }}
              >
                {project.name}
              </h1>
            </div>
            <div className="carousel-slides-slide-body" dangerouslySetInnerHTML={{ __html: project.desc }}>
            </div>

            {/* <Body
              text={project.desc}
            /> */}
          </div>
        ))
        }
      </div>
      <div className="carousel-dots">
        {projects.map((project, index) => {
          // offset so that the middle dot is the 0th
          let i = index + slides.current.length / 2;
          if (i >= slides.current.length) i -= slides.current.length;
          return (<span data={i} key={project.slug} className={`carousel-dots-dot ${i === current ? 'active' : ''}`} />);
        })}
      </div>
    </div>
  );
}

export default Carousel;
