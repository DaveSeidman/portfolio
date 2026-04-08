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
  const publicBase = import.meta.env.BASE_URL || '/';
  const normalizedPublicBase = publicBase.endsWith('/') ? publicBase : `${publicBase}/`;
  html = html.replace(/ poster='[^']*'/g, '');
  return html.replace(/src='([^']+)'/g, (_, src) => {
    const isLocalVideo = src.startsWith('videos/') && src.endsWith('.mp4');
    const isLocalPublicAsset = src.startsWith('videos/');

    if (isLocalVideo) {
      const resolvedSrc = videoBase ? `${videoBase}${src}` : `${normalizedPublicBase}${src}`;
      return `src='${resolvedSrc}'`;
    }

    if (isLocalPublicAsset) {
      return `src='${normalizedPublicBase}${src}'`;
    }

    return `src='${src}'`;
  });
};

export const bioLinks = {
  resume: 'https://daveseidman.com/resume.pdf',
  github: 'https://github.com/DaveSeidman',
  twitter: 'https://twitter.com/daveseidman',
  linkedin: 'https://www.linkedin.com/in/daveseidman1',
};
