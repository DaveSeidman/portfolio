import React from 'react';

const prefix = location.hostname === 'localhost' ? '' : 'https://daveseidmancom.s3.amazonaws.com/';
function Body(props) {
  const { text } = props;
  return (
    <div className="carousel-slides-slide-body">
      {
        text.map((item, index) => {
          const regex = /!\[([^\]]*)\]\(([^)]*)\)/;
          const match = item.match(regex);
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
