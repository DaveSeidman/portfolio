import React, { useState, useEffect, useRef } from 'react';
import './index.scss';
// import 'inobounce';

const useForceUpdate = () => {
  const [, forceUpdate] = useState();
  return () => forceUpdate(prevState => !prevState);
};

function Carousel(props) {
  const {
    projects, setScrollPercent, setScrollSpeed,
    resize, direction, snap,
  } = props;
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
      pointer.current.x = e.clientX;
    }
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

      // const nextScrollPercent = position.current / (width * slides)

      forceUpdate();
    }
    animation = requestAnimationFrame(animate);
  };

  useEffect(() => {
    addEventListener('wheel', wheel);
    carouselRef.current.addEventListener('pointerdown', handlePointerDown);
    carouselRef.current.addEventListener('pointerup', handlePointerUp);
    carouselRef.current.addEventListener('pointermove', handlePointerMove);

    animate();

    // if (carouselRef.current) {
    slides.current = Array.from(slidesRef.current.children);

    width = carouselRef.current.getBoundingClientRect().width;

    slides.current.forEach((slide, index) => {
      slide.style.width = `${width}px`;
      slide.offset = width * index;
      slide.style.transform = `translateX(${slide.offset}px)`;
    });
    // }

    return () => {
      removeEventListener('wheel', wheel);
      carouselRef.current.removeEventListener('pointerdown', handlePointerDown);
      carouselRef.current.removeEventListener('pointerup', handlePointerUp);
      carouselRef.current.removeEventListener('pointermove', handlePointerMove);

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
        {projects.map(project => (
          <div
            key={project.slug}
            className="carousel-slides-slide
          "
          >
            <div className="carousel-slides-slide-title">
              <h1>
                {project.name}
              </h1>
            </div>

          </div>
        ))
        }
      </div>
    </div>
  );
}

export default Carousel;
