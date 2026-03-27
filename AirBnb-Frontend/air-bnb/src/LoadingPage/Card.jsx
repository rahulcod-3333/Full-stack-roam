import React from 'react'

const Card = ({src , alt , customClasses , onImageLoad}) => {

  return (
    <div className={`absolute shadow-[0_10px_20px_rgba(0,0,0,0.2)] will-change-transform gsap-card ${customClasses}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover pointer-events-none" 
        onLoad={onImageLoad}
      />
    </div>
  )
}

export default Card
