import React, { useState } from 'react';

export const useForceRender = () => {
  const [, forceRender] = useState();
  return () => forceRender(prevState => !prevState);
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
