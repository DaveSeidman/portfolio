import React from 'react';

function Body(props) {
  const contentTypes = {
    jpg: { path: 'assets/images/' },
    png: { path: 'assets/images/' },
    gif: { path: 'assets/images/' },
    mp4: { path: 'assets/videos/' },
  };
  const typeFromFile = (asset) => {
    const ext = asset.substring(asset.lastIndexOf('.'), asset.length);
    // console.log(ext)
    return 'image';
  };

  const { text } = props;
  return (
    <div className="carousel-slides-slide-body">
      {
        text.map((item, index) => {
          const regex = /!\[([^\]]*)\]\(([^)]*)\)/;
          const match = item.match(regex);
          if (!match) return (<p key={index}>{item}</p>);

          let asset;
          switch (typeFromFile(match[2])) {
            case 'image':
              asset = (<img key={index} src={match[2]} alt={match[1]} />);
              break;
            case 'video':
              asset = (<video key={index} src={match[2]} />);
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
