import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Link,
} from 'react-router-dom';
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import Scene from './components/scene';
import Carousel from './components/carousel';
import { projects } from './projects.json';

import './index.scss';

const analytics = Analytics({
  app: 'daveseidman.com',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-NYRX0Y24Z0'],
    }),
  ],
});

function App() {
  const scrollPercent = useRef(0);
  const scrollSpeed = useRef(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    analytics.page();
  }, [selected]);

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
                scrollPercent={scrollPercent}
                scrollSpeed={scrollSpeed}
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
