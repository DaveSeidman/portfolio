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
  html = html.replace('src=\'', `src='${base}`);
  html = html.replace('poster=\'', `poster='${base}`);
  return html;
};
