export const lerp = (v0, v1, t) => v0 * (1 - t) + v1 * t;

export const clearSelection = () => {
  if (window.getSelection) {
    if (window.getSelection().empty) { // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) { // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) { // IE?
    document.selection.empty();
  }
};

export const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

export const tagAltText = {
  PRO: 'Profile',
  GIT: 'GitLab',
  TWI: 'Twitter',
  RES: 'Resume',
  EXP: 'Experiment',
  APP: 'App Dev',
  BED: 'Backend Dev',
  FED: 'Frontend Dev',
  LIV: 'Live Events',
  HOL: 'Holograms',
  CV: 'Computer Vision',
  AR: 'Augmented Reality',
  VR: 'Virtual Reality',
  PC: 'Physical Computing',
};
