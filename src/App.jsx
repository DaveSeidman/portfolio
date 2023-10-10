import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Scene from './views/scene';
import { projects } from './projects.json';
import './index.scss';
import Carousel from 'ds-carousel';

function App() {
  const carouselRef = useRef();
  const [carouselPercent, setCarouselPercent] = useState(0);
  const [carouselSpeed, setCarouselSpeed] = useState(0);
  const [currentProject, setCurrentProject] = useState(null);
  let carousel;


  const updateScene = (e) => {
    setCarouselPercent(e.detail);
    setCarouselSpeed(carousel.state.speed);
  };
  useEffect(() => {
    carousel = new Carousel(carouselRef.current, { debug: false, arrows: true, autoResize: true, full: true });
    carousel.el.addEventListener('update', updateScene);

    return () => {
      carousel.el.removeEventListener('update', updateScene);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/*"
          element={(
            <div className="app">
              <Scene
                carouselPercent={carouselPercent}
                carouselSpeed={carouselSpeed}
              />
              <div className="carousel projects" ref={carouselRef}>
                {projects.map((project, index) => (
                  // <Link key={project.slug} className="project" to={project.slug}>{project.name}</Link>
                  <div className={`projects-project ${currentProject === index ? 'open' : ''}`} key={project.slug}>
                    <div
                      className="projects-project-header"
                      onClick={() => {
                        console.log(project, index);
                        setCurrentProject(currentProject === index ? null : index);
                      }}
                    >
                      <span className="nobreak">
                        <h1 className="projects-project-header-name">{project.name}</h1>
                        <button type="button" className="projects-project-header-close">×</button>
                      </span>
                    </div>
                    <div className="projects-project-body" dangerouslySetInnerHTML={{ __html: project.desc }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;


// class Portfolio {
// constructor() {
// autoBind(this);
//     this.el = createEl('div', { className: `portfolio ${mobile() ? 'mobile' : ''}` });
//     if (mobile()) document.querySelector('html').classList.add('mobile');
//     const state = {
//       projects: projects.projects, // TODO: move out of state since it doesn't change (modules/scene would need to get these somehow)
//       project: null,
//       hisotryNavigation: false,
//       firstInteraction: false,
//     };

//     this.analytics = Analytics({ app: 'DaveSeidman', plugins: [googleAnalytics({ trackingId: 'UA-67271572-1' })] });
//     this.analytics.page();

//     this.state = onChange(state, this.update, { ignoreKeys: ['theme', 'color', 'background', 'roughness', 'metalness', 'envIntensity'] });

//     // TODO: move about to middle:
//     const about = projects.projects.splice(0, 1)[0];
//     const midIndex = Math.floor(projects.projects.length / 2);
//     projects.projects.splice(midIndex, 0, about);
//     projects.projects.forEach((project, index) => { project.id = index; });

//     this.scene = new Scene(this.state);
//     addEl(this.el, this.scene.el);// , this.carousel.el);

//     const projectsEl = this.getProjects();
//     this.carousel = new Carousel(projectsEl, { debug: false, arrows: true, autoResize: true, full: true });
//     this.carousel.el.addEventListener('ready', () => {
//       const path = projects.projects.filter(project => project.slug === location.pathname.replace(/\//g, ''));
//       if (path.length) {
//         // TODO: can we remove ID so that projects can be added without re-indexing?
//         const { id } = path[0];
//         // TODO: prevent clicking on items as well until navigation completes
//         this.carousel.lock();
//         this.carousel.el.classList.add('locked');
//         clearTimeout(this.showHintTimeout);
//         setTimeout(() => {
//           this.carousel.goto(id).then(() => {
//             this.state.project = id;
//           });
//         }, 2000);
//       }
//     });
//     this.carousel.goto(midIndex, true);
//     this.carousel.el.addEventListener('update', ({ detail }) => {
//       this.state.carouselPercent = detail;
//     });
//     // this.carouselStart = this.carousel.state.percent;
//     this.carouselInitialized = false;
//     addEl(this.el, projectsEl);

//     this.hintsEl = this.createHints();
//     this.showHintTimeout = setTimeout(this.showHints, 2500);
//     addEl(this.el, this.hintsEl);

//     // this.resizeDebounced = debounce(this.resize, 1500);

//     window.addEventListener('resize', this.resize);
//     window.addEventListener('keydown', this.keydown);
//     window.addEventListener('click', this.click);
//     window.addEventListener('touchend', this.touchend);
//     window.addEventListener('popstate', this.history);
//     document.addEventListener('visibilitychange', this.focus);
//     // window.addEventListener('focus', this.focus);
//   }

//   update(path, current, previous) {
//     // TODO: put this in ignoredkeys?
//     if (path !== 'carouselPercent') console.log(`${ path }: ${previous} -> ${current}`);
//     if (path === 'carouselPercent') {
//       // console.log(this.carousel.state.percent);
//       if (!this.carouselInitialized) {
//         this.carouselInitialized = true;
//         this.carouselStart = this.carousel.state.percent;
//       } else if (!this.state.firstInteraction && Math.abs(this.carousel.state.percent - this.carouselStart) >= (1 / projects.projects.length) / 2) {
//         this.state.firstInteraction = true;
//       }
//       this.scene.update(current, this.carousel.state.speed);
//     }
//     if (path === 'project') {
//       // go from one project directly to another
//       if (current !== null && previous !== null) {
//         // console.log('jumping from one project to another');
//         let rightAmount;
//         let leftAmount;
//         if (current > previous) {
//           rightAmount = current - previous;
//           leftAmount = -current - (this.state.projects.length - previous);
//         } else {
//           leftAmount = current - previous;
//           rightAmount = current + (this.state.projects.length - previous);
//         }
//         const direction = Math.abs(rightAmount) < Math.abs(leftAmount) ? rightAmount : leftAmount;
//         this.carousel.move(direction);

//         // console.log(`next project is ${rightAmount} to the right and ${leftAmount} to the left`);
//         this.closeProject(previous);
//         this.openProject(current);
//       }


//       // opening a project
//       if (current !== null) {
//         // console.log('open a project');
//         this.openProject(current);
//       }
//       // closing a project
//       else {
//         // console.log('close a project');
//         if (previous !== null) {
//           this.closeProject(previous);
//         }
//         // this.state.project = null;
//       }

//       if (this.state.hisotryNavigation) {
//         if (current !== null) {
//           this.carousel.goto(current);
//         }
//       } else {
//         const name = projects.projects[current] ? projects.projects[current].slug : '';
//         history.pushState({ page: name }, name, `/${name}`);
//       }
//       this.state.hisotryNavigation = false;
//       this.analytics.page();
//     }

//     if (path === 'firstInteraction') {
//       clearTimeout(this.showHintTimeout);
//     }
//   }

//   openProject(project) {
//     this.state.firstInteraction = true;
//     this.scene.open();
//     this.carousel.lock();
//     this.carousel.el.classList.add('locked');
//     this.projectEls[project].classList.add('open');
//     this.projectEls[project].querySelector('.projects-project-body').scrollTo(0, 0);
//   }

//   closeProject(project) {
//     this.projectEls[project].classList.add('closing');
//     this.projectEls[project].classList.remove('open');
//     this.carousel.unlock();
//     this.carousel.el.classList.remove('locked');

//     this.scene.close();
//     clearSelection();
//     setTimeout(() => { this.projectEls[project].classList.remove('closing'); }, 750);
//     Array.from(this.projectEls[project].querySelectorAll('video')).forEach((video) => {
//       video.pause();
//     });
//   }

//   history() {
//     this.state.hisotryNavigation = true;
//     const projectIndex = this.state.projects.map(project => project.slug).indexOf(location.pathname.substring(1));
//     this.state.project = projectIndex >= 0 ? projectIndex : null;
//   }

//   resize() {
//     // this.carousel.resize();
//     this.scene.resize();
//     const windowAspect = window.innerWidth / window.innerHeight;
//     Array.from(document.querySelectorAll('[data-aspect]')).forEach((container) => {
//       const element = container.querySelector('img,video');
//       element.style.width = container.getAttribute('data-aspect') > windowAspect ? '100%' : 'auto';
//     });
//   }

//   focus() {
//     if (document.visibilityState === 'visible') {
//       setTimeout(() => { this.carousel.resize(); }, 10);
//     }
//   }

//   keydown({ code }) {
//     if (this.state.project === null) {
//       if (code === 'ArrowRight') {
//         this.carousel.gotoNext();
//       }
//       if (code === 'ArrowLeft') {
//         this.carousel.gotoPrev();
//       }
//     }
//     if (code === 'ArrowUp') {
//       this.state.project = this.carousel.state.current;
//     }
//     if (code === 'ArrowDown') {
//       this.state.project = null;
//     }

//     if (code === 'Space') {
//       this.state.project = this.state.project === null ? this.carousel.state.current : null;
//     }
//   }

//   // TODO: make sure these don't both get added:
//   click({ target }) {
//     if (target.classList.contains('projects-project')) this.state.project = null;
//   }

//   touchend({ target }) {
//     if (target.classList.contains('projects-project')) this.state.project = null;
//   }

//   getProjects() {
//     const innerHTML = Mustache.render(projectsTemplate, projects);
//     const projectsEl = createEl('div', { className: 'projects', innerHTML });

//     const windowAspect = window.innerWidth / window.innerHeight;
//     this.projectEls = Array.from(projectsEl.children);
//     this.projectEls.forEach((project, index) => {
//       // TODO: keep track of mouse speed to prevent opening a project at the same time that it's swiped offscreen
//       project.querySelector('.projects-project-header').addEventListener('click', () => {
//         if (Math.abs(this.carousel.state.speed < 10)) this.state.project = index;
//       });
//       project.querySelector('.projects-project-header-close').addEventListener('click', (e) => { e.stopPropagation(); this.state.project = null; });
//       const containedElements = Array.from(project.querySelectorAll('img,video'));
//       containedElements.forEach((el) => {
//         const container = createEl('div', { className: 'container' });
//         el.parentNode.insertBefore(container, el);
//         container.appendChild(el);
//         el.addEventListener('load', ({ target }) => {
//           const imgAspect = target.naturalWidth / target.naturalHeight;
//           target.style.width = imgAspect > windowAspect ? '100%' : 'auto';
//           container.setAttribute('data-aspect', target.naturalWidth / target.naturalHeight);
//         });
//         el.addEventListener('loadedmetadata', ({ target }) => {
//           const vidAspect = target.videoWidth / target.videoHeight;
//           container.setAttribute('data-aspect', target.videoWidth / target.videoHeight);
//           target.style.width = vidAspect > windowAspect ? '100%' : 'auto';
//         });

//         if (el.tagName === 'IMG') {
//           container.style.backgroundImage = `url(${el.src})`;
//         }
//         if (el.tagName === 'VIDEO') {
//           container.style.backgroundImage = `url(${el.getAttribute('poster')})`;
//         }
//       });


//       const pageElements = Array.from(project.querySelectorAll('.projects-project-body > p, .projects-project-body > .container'));
//       pageElements.map((el, i) => el.style.transitionDelay = `${(i * 250) + 750}ms`);

//       const tags = Array.from(project.querySelectorAll('.projects-project-header-tags-tag'));
//       tags.forEach((tag) => {
//         if (tag.classList.contains('RES')) {
//           const link = createEl('a', { href: 'https://daveseidman.com/resume', target: 'resume' });
//           tag.parentNode.appendChild(link);
//           link.appendChild(tag);
//         }
//         if (tag.classList.contains('GIT')) {
//           const link = createEl('a', { href: 'https://gitlab.com/daveseidman', target: 'gitlab' });
//           tag.parentNode.appendChild(link);
//           link.appendChild(tag);
//         }
//         if (tag.classList.contains('TWI')) {
//           const link = createEl('a', { href: 'https://twitter.com/daveseidman', target: 'twitter' });
//           tag.parentNode.appendChild(link);
//           link.appendChild(tag);
//         }
//       });

//       // TODO: this should be possible with mustache
//       const tips = Array.from(project.querySelectorAll('.projects-project-header-tags-tag-tip'));
//       tips.map((tip) => { tip.innerText = tagAltText[tip.innerText]; });
//     });

//     return projectsEl;
//   }

//   createHints() {
//     const el = createEl('div', { className: 'hints' });
//     const hint1 = createEl('p', { className: 'hints-scroll', innerText: 'scroll to explore' });
//     const hint2 = createEl('p', { className: 'hints-tap', innerText: 'tap to open' });

//     addEl(el, hint1, hint2);
//     return el;
//   }

//   showHints() {
//     Array.from(this.hintsEl.querySelectorAll('p')).forEach((element, index) => {
//       setTimeout(() => {
//         element.classList.add('active');
//       }, (index * 2000) + (1500 * index));
//       setTimeout(() => {
//         element.classList.remove('active');
//       }, ((index + 1) * 2000) + (1500 * index));
//     });
//   }
// }


// const portfolio = new Portfolio();
// addEl(portfolio.el);

// // for local debug
// if (window.location.hostname === 'localhost') window.portfolio = portfolio;
