import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
// import { processText } from '../../utils';
import './index.scss';

// TODO: move to utils
const useForceUpdate = () => {
  const [, forceUpdate] = useState();
  return () => forceUpdate(prevState => !prevState);
};

function Body(props) {
  // contentTypes = {
  //   'jpg': { path: 'assets/images/' },
  //   'png' : {path: 'assets/images/'},
  //   'gif': { path: 'assets/images/'},
  //   'mp4': { path: 'assets/videos'}
  // };


  const { text } = props;
  return (
    <div className="carousel-slides-slide-body">
      {
        text.map((item, index) => {
          const regex = /!\[([^\]]*)\]\(([^)]*)\)/;
          const match = item.match(regex);
          const string = match ? `alt=${match[1]}: ${match[2]}` : item;


          return (<p key={index}>{string}</p>);
        })
      }
    </div>
  );
}

function Carousel(props) {
  const {
    projects, setScrollPercent, setScrollSpeed,
    autoResize, direction, snap,
  } = props;


  const location = useLocation();


  const [current, setCurrent] = useState(0); // denotes slide closes to center. must always be something between 0 and projects.length
  const [selected, setSelected] = useState(null); // denotes selected slide / project. can be 0 - slides.length but can also be null if no project selected
  // const [locked, setLocked] = useState(false);
  // const [wheeling, setWheeling] = useState(false);
  const slides = useRef([]);
  const forceUpdate = useForceUpdate();
  const slidesRef = useRef();
  const carouselRef = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  const inertia = 0.95;
  let width;

  const position = useRef(0);
  const speed = useRef(0);
  let animation;

  const wheel = (e) => {
    if (selected !== null) return;
    speed.current = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? -e.deltaY / 3 : -e.deltaX;
    setScrollSpeed(speed.current);
  };

  const handlePointerDown = (e) => {
    if (selected !== null) return;
    pointer.current.down = true;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
  };

  const handlePointerUp = (e) => {
    pointer.current.down = false;
    let velocityTemp = speed.current;
    let finalPosition = position.current;

    for (let i = 0; i < 200; i += 1) {
      velocityTemp *= inertia;
      finalPosition += velocityTemp;
    }

    const snappedFinalPosition = Math.round(finalPosition / width) * width;
    const velocityAdjustment = (snappedFinalPosition - finalPosition) / 19;
    speed.current += velocityAdjustment;
  };

  const handlePointerMove = (e) => {
    if (pointer.current.down) {
      speed.current = e.clientX - pointer.current.x;
      setScrollSpeed(speed.current);
    }
    pointer.current.y = e.clientY;
    pointer.current.x = e.clientX;
  };

  const animate = () => {
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
    console.log('location changed', location.pathname);
  }, [location]);


  useEffect(() => {
    console.log('here', selected, projects[selected]?.slug);
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
  }, [selected]);

  useEffect(() => {
    console.log('selected changed', selected, current);
    history.pushState({}, null, selected !== null ? projects[selected].slug : '/');

    // calculate the shortest move from the current index to the selected index
    // keeping in mind the shortest method
    const { length } = slides.current;
    const leftStraight = { direction: 1, amount: current - selected };
    const leftWrapped = { direction: 1, amount: current - selected + length };
    const rightStraight = { direction: -1, amount: selected - current };
    const rightWrapped = { direction: -1, amount: selected - current + length };
    const moves = [leftStraight, rightStraight, leftWrapped, rightWrapped];
    moves.sort((a, b) => (a.amount > b.amount ? 1 : -1));
    const shortestMove = moves.filter(item => item.amount >= 0)[0];
    speed.current = (((width / slides.current.length) / 3.09) * 1.95) * (shortestMove.direction * shortestMove.amount); // TODO <- Figure out the reason for these numbers
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
            <Body
              text={project.desc}
            />
            {/* <div className="carousel-slides-slide-body">
                {body}
              </div> */}

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
      <div className="carousel-debug">
        {
          projects.map((project, index) => (<a key={project.slug} onClick={() => { setSelected(index); }}>{project.name}</a>))
        }
      </div>
    </div>
  );
}

export default Carousel;
