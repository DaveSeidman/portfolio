import React, { useState, useEffect, useRef } from 'react';
import './index.scss';

const useForceUpdate = () => {
  const [, forceUpdate] = useState();
  return () => forceUpdate(prevState => !prevState);
};

function Carousel(props) {
  const {
    projects, setScrollPercent, setScrollSpeed,
    autoResize, direction, snap,
  } = props;

  const [current, setCurrent] = useState(0); // denotes slide closes to center. must always be something between 0 and projects.length
  const [selected, setSelected] = useState(null); // denotes selected slide / project. can be 0 - slides.length but can also be null if no project selected
  const [locked, setLocked] = useState(false);
  const [wheeling, setWheeling] = useState(false);
  const slides = useRef([]);
  const forceUpdate = useForceUpdate();
  const slidesRef = useRef();
  const carouselRef = useRef();
  const pointerDown = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });
  let width;
  // let slides;

  const position = useRef(0);
  const speed = useRef(0);
  let animation;

  const wheel = (e) => {
    if (locked) return;
    speed.current = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? -e.deltaY / 3 : -e.deltaX;
    setScrollSpeed(speed.current);
  };

  const handlePointerDown = (e) => {
    pointerDown.current = true;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
  };

  const handlePointerUp = (e) => {
    pointerDown.current = false;
  };

  const handlePointerMove = (e) => {
    if (pointerDown.current) {
      speed.current = e.clientX - pointer.current.x;
      setScrollSpeed(speed.current);
    }
    pointer.current.y = e.clientY;
    pointer.current.x = e.clientX;
  };

  const animate = () => {
    if (Math.abs(speed.current) >= 0.001) {
      speed.current *= 0.975;
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
      // console.log(-position.current, width * slides.current.length);
      setScrollPercent(nextScrollPercent);
      setCurrent(Math.round(nextScrollPercent * slides.current.length));

      // const nextScrollPercent = position.current / (width * slides)

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
    slides.current = Array.from(slidesRef.current.children);
    resize();
    animate();

    addEventListener('wheel', wheel);
    addEventListener('resize', resize);
    carouselRef.current.addEventListener('pointerdown', handlePointerDown);
    carouselRef.current.addEventListener('pointerup', handlePointerUp);
    carouselRef.current.addEventListener('pointermove', handlePointerMove);

    return () => {
      removeEventListener('wheel', wheel);
      removeEventListener('resize', resize);

      if (carouselRef.current) {
        carouselRef.current.removeEventListener('pointerdown', handlePointerDown);
        carouselRef.current.removeEventListener('pointerup', handlePointerUp);
        carouselRef.current.removeEventListener('pointermove', handlePointerMove);
      }
      cancelAnimationFrame(animation);
    };
  }, []);

  return (
    <div className="carousel" ref={carouselRef}>
      <div
        className="carousel-slides"
        style={{ transform: `translateX(${position.current}px)` }}
        ref={slidesRef}
      >
        {projects.map((project, index) => (
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
            <div className="carousel-slides-slide-body">
              {project.desc.map(p => (<p>{p}</p>))}
            </div>

          </div>
        ))
        }
      </div>
      <div className="carousel-dots">
        {projects.map((project, index) => {
          // offset so that the middle dot is the 0th
          let i = index + slides.current.length / 2;
          if (i > slides.current.length) i -= slides.current.length;
          return (<span key={project.slug} className={`carousel-dots-dot ${i === current ? 'active' : ''}`} />);
        })}
      </div>
    </div>
  );
}

export default Carousel;
