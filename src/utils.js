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
  const nextHtml = html.replace('src=\'', `src=\'${base}`);
  return nextHtml;
};
