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
  const videoBase = location.hostname === 'localhost' ? '' : 'https://daveseidmancom.s3.amazonaws.com/';
  html = html.replace(/ poster='[^']*'/g, '');
  return html.replace(/src='([^']+)'/g, (_, src) => {
    const isLocalVideo = src.startsWith('videos/') && src.endsWith('.mp4');
    if (!videoBase || !isLocalVideo) {
      return `src='${src}'`;
    }
    return `src='${videoBase}${src}'`;
  });
};

export const bioLinks = {
  resume: 'https://daveseidman.com/resume.pdf',
  gitlab: 'https://gitlab.com/daveseidman',
  twitter: 'https://twitter.com/daveseidman',
  linkedin: 'https://www.linkedin.com/in/daveseidman1',
};
