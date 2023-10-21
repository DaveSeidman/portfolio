import React, { useState } from 'react';

export const useForceRender = () => {
  const [, forceRender] = useState();
  return () => forceRender((prevState) => !prevState);
};

export const debounce = (mainFunction, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      mainFunction(...args);
    }, delay);
  };
};

export const setAssetPaths = (html) => {
  const base = location.hostname === 'localhost' ? '' : 'https://daveseidmancom.s3.amazonaws.com/';
  html = html.replaceAll('src=\'', `src='${base}`);
  html = html.replaceAll('poster=\'', `poster='${base}`);
  return html;
};

export const bioLinks = {
  resume: 'https://daveseidman.com/resume.pdf',
  gitlab: 'https://gitlab.com/daveseidman',
  twitter: 'https://twitter.com/daveseidman',
  linkedin: 'https://www.linkedin.com/in/daveseidman1',
};
