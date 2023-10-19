import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Link,
} from 'react-router-dom';
import Scene from './components/scene';
import Carousel from './components/carousel';
import { projects } from './projects.json';
import './index.scss';

function App() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [selected, setSelected] = useState(null);
  return (
    <Router>
      <Routes>
        <Route
          path="*"
          element={(
            <div className="app">
              <Scene
                projects={projects}
                scrollPercent={scrollPercent}
                scrollSpeed={scrollSpeed}
                selected={selected}
              />
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
