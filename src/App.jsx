import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Link,
} from 'react-router-dom';
import Scene from './views/scene';
import Carousel from './views/carousel';
import { projects } from './projects-html.json';
import './index.scss';
// import Carousel from 'ds-carousel';

function App() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [selected, setSelected] = useState(null);
  return (
    <Router>
      <Routes>
        <Route
          path="*"
          element={(
            <div className="app">
              {/* <Scene
                projects={projects}
                scrollPercent={scrollPercent}
                scrollSpeed={scrollSpeed}
                selected={selected}
              /> */}
              <Carousel
                projects={projects}
                setScrollPercent={setScrollPercent}
                setScrollSpeed={setScrollSpeed}
                selected={selected}
                setSelected={setSelected}
              />
            </div>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
