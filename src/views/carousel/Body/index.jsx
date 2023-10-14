import React from 'react';


function Body(props) {
  const { text } = props;

  const prefix = location.hostname === 'localhost' ? '' : 'https://daveseidmancom.s3.amazonaws.com/';
  const addLinks = (item) => {
    const array = item.split('<a');
    if (array.length <= 1) return (<p>{item}</p>);
    // console.log(array);
    return array.map(segment => (<p>{segment}</p>));
  };

  return (
    <div className="carousel-slides-slide-body">
      {
        text.map((item, index) => {
          const regex = /!\[([^\]]*)\]\(([^)]*)\)/;
          const match = item.match(regex);

          addLinks(item);

          if (!match) return (<p key={index}>{item}</p>);

          const filename = match[2];
          const altText = match[1];

          const extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
          let asset;
          switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
              asset = (
                <img
                  key={index}
                  src={`${prefix}${filename}`}
                  alt={altText}
                />
              );
              break;
            case 'mp4':
              asset = (
                <video
                  key={index}
                  src={`${prefix}${filename}`}
                  controls
                  playsInline
                  poster={filename.replace('mp4', 'png')}
                />
              );
              break;

            default:
              break;
          }
          return asset;
        })
      }
    </div>
  );
}
export default Body;
