import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useForceUpdate } from '../../utils';
import * as tf from '@tensorflow/tfjs'

import './index.scss';

function Carousel(props) {
  const {
    projects, setScrollPercent, setScrollSpeed, selected, setSelected,
  } = props;

  const distanceMoveThreshold = 30;
  const historyLocation = useLocation();
  const focusedSlide = useRef(0);
  const [targetSlide, setTargetSlide] = useState(0); // ONLY affects the carousel's position, not whether or not to open a slide
  const slideOpen = useRef(false);
  const slides = useRef([]);
  const forceUpdate = useForceUpdate();
  const historyNavigated = useRef(false);
  const slidesRef = useRef();
  const carouselRef = useRef();
  const prevTime = useRef(0);
  const pointer = useRef({ x: 0, y: 0, previousX: 0, previousY: 0, speedX: 0, speedY: 0, downX: 0, downY: 0 });
  const inertia = 0.95;
  const minimumSpeed = 0.001;
  const width = useRef();
  const wheelData = useRef([])
  const userWheel = useRef(0);
  const wheelX = useRef(0);
  const wheelY = useRef(0);
  const modelRef = useRef(null);

  const windowSize = 10;
  const wheelValuesForPrediction = useRef(new Array(windowSize).fill([0, 0]));
  // const wheelSequesncesForPrediction = useRef(new Array(20).fill([0, 0]));

  const [training, setTraining] = useState(false)
  const isTraining = useRef(false);
  const position = useRef(0);
  const speed = useRef(0);
  let animation;

  // const wheeling = useRef(false);

  const animate = (time) => {
    wheelValuesForPrediction.current.unshift([wheelX.current, wheelY.current]);
    wheelValuesForPrediction.current.pop();

    if (modelRef.current && !isTraining.current) {
      const predictions = modelRef.current.predict(tf.tensor3d([wheelValuesForPrediction.current]))
      const predictionsValues = predictions.dataSync();
      console.log(predictionsValues[0]);
    }
    if (isTraining.current) {
      wheelData.current.push({ x: wheelX.current, y: wheelY.current, wheelReal: userWheel.current });
    }
    const timeDelta = time - prevTime.current;
    // console.log(time - prevTime.current);
    prevTime.current = time;

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
      let nextFocusedSlide = Math.round(nextScrollPercent * slides.current.length);
      if (nextFocusedSlide >= slides.current.length) nextFocusedSlide = 0;
      focusedSlide.current = nextFocusedSlide;
      forceUpdate();
    }
    animation = requestAnimationFrame(animate);
  };

  const resize = () => {
    width.current = carouselRef.current.getBoundingClientRect().width;
    slides.current.forEach((slide, index) => {
      slide.style.width = `${width.current}px`;
      slide.offset = width.current * index;
      slide.style.transform = `translateX(${slide.offset}px)`;
    });
  };

  useEffect(() => {
    // TODO: if this is app load we should open the project
    const nextSelected = projects.findIndex(p => p.slug === historyLocation.pathname.slice(1));
    if (nextSelected >= 0) {
      setTargetSlide(nextSelected);
      historyNavigated.current = true;
      // TODO: this doesn't open the project for some reason
      // setSelected(nextSelected)
      setTimeout(() => { historyNavigated.current = false }, 1000);
    }
  }, [historyLocation]);


  const wheel = (e) => {
    // wheelDelta.wheelX = e.deltaX;
    // wheelDelta.wheelY = e.deltaY;
    wheelX.current = e.deltaX;
    wheelY.current = e.deltaY;

    // wheeling.current = true;
    if (slideOpen.current) return;
    speed.current = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? -e.deltaY / 3 : -e.deltaX;
    setScrollSpeed(speed.current);
  };

  const handlePointerDown = (e) => {
    if (slideOpen.current) return;
    pointer.current.down = true;
    pointer.current.downX = e.clientX;
    pointer.current.downY = e.clientY;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
    pointer.current.previousX = e.clientX;
    pointer.current.previousY = e.clientY;
  };

  const snapSpeed = () => {
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
    pointer.current.down = false;
    snapSpeed();
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

  const handleKeyDown = (e) => {

    let nextTargetSlide;
    if (e.key === 'ArrowRight') nextTargetSlide = focusedSlide.current + 1 > slides.current.length - 1 ? 0 : focusedSlide.current + 1;
    if (e.key === 'ArrowLeft') nextTargetSlide = focusedSlide.current - 1 < 0 ? slides.current.length - 1 : focusedSlide.current - 1;
    if (nextTargetSlide) setTargetSlide(nextTargetSlide);

    if (e.keyCode === 32) {
      userWheel.current = 1;
      // console.log('set wheelreal to true')
    }
  };

  const handleKeyUp = (e) => {
    if (e.keyCode === 32) {
      userWheel.current = 0;
      // console.log('set wheelreal to false')
    }
  }

  const handleArrowClick = (e) => {
    const dir = parseInt(e.target.getAttribute('data-dir'), 10);
    let nextTargetSlide = focusedSlide.current + dir;
    if (nextTargetSlide > slides.current.length) nextTargetSlide = 0;
    if (nextTargetSlide < 0) nextTargetSlide = slides.current.length - 1;
    setTargetSlide(nextTargetSlide);
  };

  useEffect(() => {
    isTraining.current = training;
    if (training) {
      console.log('start collecting training here');
      wheelData.current = [];
    }

    else {
      console.log('stop collecting training data');
      console.log(wheelData.current);
      const allSequences = [];
      const realSequences = [];
      const fakeSequences = [];
      // const windowSize = 20;
      for (let i = 0; i < wheelData.current.length - windowSize; i += 1) {
        let userWheelStart = 0
        let userWheelEnd = 0;
        for (let j = 0; j < windowSize; j += 1) {
          if (j <= windowSize / 2) userWheelStart += wheelData.current[i + j].wheelReal;
          if (j > windowSize / 2) userWheelEnd += wheelData.current[i + j].wheelReal;
        }
        allSequences.push({ data: wheelData.current.slice(i, i + windowSize), userStopped: userWheelStart > userWheelEnd })
      }

      if (allSequences.length) {
        let flipCount = 0;
        let userStopBool = allSequences[0].userStopped;
        for (let i = windowSize; i < allSequences.length; i += 1) {
          if (allSequences[i].userStopped != userStopBool) {
            if (userStopBool) fakeSequences.push(allSequences[i]);
            else realSequences.push(allSequences[i]);
            flipCount += 1;
          }
          userStopBool = allSequences[i].userStopped;
        }

        console.log(`the user stopped wheeling ${Math.floor(flipCount / 2)} times`);
        const realSequencesClean = [];
        realSequences.forEach(sequenceWindow => {
          let cleanData = [];
          sequenceWindow.data.forEach(sequence => {
            cleanData.push([sequence.x, sequence.y]);
          })
          realSequencesClean.push(cleanData);
        })

        const fakeSequencesClean = [];
        fakeSequences.forEach(sequenceWindow => {
          let cleanData = [];
          sequenceWindow.data.forEach(sequence => {
            cleanData.push([sequence.x, sequence.y]);
          })
          fakeSequencesClean.push(cleanData);
        });

        console.log('real sequences', realSequencesClean);
        console.log('fake sequences', fakeSequencesClean);

        const sequences = realSequencesClean.concat(fakeSequencesClean);
        const labels = new Array(realSequencesClean.length).fill(1).concat(new Array(fakeSequencesClean.length).fill(0))

        console.log({ sequences, labels })
        const model = tf.sequential();
        model.add(tf.layers.lstm({ inputShape: [windowSize, 2], units: 10, returnSequences: true }));
        model.add(tf.layers.lstm({ units: 16 }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'], });

        // Assuming sequences and labels are your training data and labels
        model.fit(tf.tensor3d(sequences), tf.tensor1d(labels), { epochs: 40, batchSize: 32 }).then(info => {
          console.log('Training complete:', info);

          // Save the model
          model.save('localstorage://wheelevents');
          modelRef.current = model;
        });
      }
    }
  }, [training])

  useEffect(() => {
    if (!historyNavigated.current) history.pushState({}, projects[selected]?.name || '', projects[selected]?.slug || '/');
    slideOpen.current = selected !== null;
  }, [selected]);

  useEffect(() => {
    slides.current = Array.from(slidesRef.current.children);
    resize();
    animate();

    addEventListener('wheel', wheel);
    addEventListener('resize', resize);
    addEventListener('keydown', handleKeyDown);
    addEventListener('keyup', handleKeyUp);
    carouselRef.current.addEventListener('pointerdown', handlePointerDown);
    carouselRef.current.addEventListener('pointerup', handlePointerUp);
    carouselRef.current.addEventListener('pointermove', handlePointerMove);
    carouselRef.current.addEventListener('pointerleave', handlePointerUp);

    return () => {
      if (carouselRef.current) {
        removeEventListener('wheel', wheel);
        removeEventListener('resize', resize);
        removeEventListener('keydown', handleKeyDown);
        removeEventListener('keyup', handleKeyUp);
        carouselRef.current.removeEventListener('pointerdown', handlePointerDown);
        carouselRef.current.removeEventListener('pointerup', handlePointerUp);
        carouselRef.current.removeEventListener('pointermove', handlePointerMove);
        carouselRef.current.removeEventListener('pointerleave', handlePointerUp);
      }
      cancelAnimationFrame(animation);
    };
  }, []);

  useEffect(() => {
    const { length } = slides.current;
    const leftStraight = { direction: -1, amount: targetSlide - focusedSlide.current };
    const leftWrapped = { direction: -1, amount: targetSlide - focusedSlide.current + length };
    const rightStraight = { direction: 1, amount: focusedSlide.current - targetSlide };
    const rightWrapped = { direction: 1, amount: focusedSlide.current - targetSlide + length };
    const moves = [leftStraight, rightStraight, leftWrapped, rightWrapped];
    moves.sort((a, b) => (a.amount > b.amount ? 1 : -1));
    const shortestMove = moves.filter(item => item.amount >= 0)[0];
    const move = shortestMove.amount * shortestMove.direction;
    speed.current = (move * width.current) / 19;
    snapSpeed();
    setSelected(slideOpen.current ? targetSlide : null);
  }, [targetSlide]);

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
            className={`carousel-slides-slide ${index === selected ? 'open' : ''} `}
          >
            <div className="carousel-slides-slide-header">
              <h1
                onClick={() => {
                  // TODO: before setting selected, lets make sure this was a click and not a drag
                  // if (speed.current <= minimumSpeed) {
                  if (index === selected) setSelected(null);
                  else setSelected(index);
                  // }
                }}
              >
                {project.name}
              </h1>
            </div>
            <div className="carousel-slides-slide-body" dangerouslySetInnerHTML={{ __html: project.desc }} />
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
          let i = index + Math.floor(projects.length / 2);
          if (i >= projects.length) i -= projects.length;
          return (<span data={i} key={project.slug} className={`carousel-dots-dot ${i === focusedSlide.current ? 'active' : ''} `} />);
        })}
      </div>
      <div className="carousel-training">
        <button type="button" onClick={(e) => { setTraining(!training); e.target.blur() }}>{training ? 'Stop' : 'Start'} Training</button>
      </div>
      {/* <div className="carousel-debug">
        {projects.map((project, index) => (
          <a
            className={focusedSlide.current === index ? 'active' : ''}
            key={project.slug}
            onClick={() => {
              // console.log(index);
              setTargetSlide(index);
            }}
          >
            {project.name}
          </a>
        ))}
      </div> */}
    </div>
  );
}

export default Carousel;
