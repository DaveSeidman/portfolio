import React, { useState } from 'react';

// export const processText = (array) => {
//   console.log(array);
//   let string = array.join()
//   return ('string');
// };


export const useForceUpdate = () => {
  const [, forceUpdate] = useState();
  return () => forceUpdate(prevState => !prevState);
};
