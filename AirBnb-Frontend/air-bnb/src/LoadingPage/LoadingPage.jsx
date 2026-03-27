import React, { useLayoutEffect, useRef, useState } from 'react'
import Card from './Card'
import img1 from "../assets/img1.jpg"
import img2 from "../assets/img2.jpg"
import img3 from "../assets/img3.jpg"
import img4 from "../assets/img4.jpg"
import img5 from "../assets/img5.jpg"
import gsap from 'gsap'
const LoadingPage = ({ onFinish }) => {
  const containerRef = useRef(null)
  const loadingRef = useRef(null)
  const [imagesLoaded, setimagesLoaded] = useState(false)
  const loadedCount = useRef(0)
  let [progressBar, setProgressBar] = useState(0)
  const cardData = [
    {
      id: 1,
      src: img1,
      alt: 'Bottom Layer',
      style: 'z-10 w-48 h-64',
    },
    {
      id: 2,
      src: img2,
      alt: 'Layer 2',
      style: 'z-20 -rotate-[15deg] w-42 h-56',
    },
    {
      id: 3,
      src: img3,
      alt: 'Layer 3',
      style: 'z-30 rotate-[5deg] w-42 h-56'
    },
    {
      id: 4,
      src: img4,
      alt: 'Layer 3',
      style: 'z-40 rotate-[0.8deg] w-40 h-44'
    },

    {
      id: 5,
      src: img5,
      alt: 'Layer 5',
      style: 'z-50 rotate-[0.8deg] w-32 h-36'
    },
    {
      id: 6,
      src: img1,
      alt: 'Layer 6',
      style: 'z-50 rotate-[0.8deg] w-32 h-36'
    },
    // Added the manual cards you had at the bottom:
    {
      id: 7,
      src: img2,
      alt: 'Layer 7',
      style: 'z-[60] rotate-[10deg] w-28 h-32'
    },
    {
      id: 8,
      src: img3,
      alt: 'Layer 8',
      style: 'z-[70] rotate-[16deg] w-24 h-28'
    },

  ]
  const handleImageLoad = () => {
    loadedCount.current += 1;
    if (loadedCount.current >= cardData.length) {
      setimagesLoaded(true);
    }
  }

  useLayoutEffect(() => {

    let ctx = gsap.context(() => {

      const tl = gsap.timeline({
        onComplete: () => {
          onFinish();
        }
      }

      );
      
      // Progress bar animation
      tl.to(loadingRef.current, {
        width: "100%",
        duration: 7,
        ease: "sine"
      }, 0.5); // start at time 0

      // Cards animation (starts at same time)
      tl.from(".gsap-card", {
        autoAlpha: 1,
        scale: 0,
        duration: 0.9,
        ease: "back.inOut",
        stagger: 0.9,
        force3D: true
      }, 0); // also start at time 0

      tl.to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "+=0.5");
    }, containerRef);

    return () => ctx.revert();
  }, [imagesLoaded]);
  return (

    <div className='fixed inset-0  flex flex-col items-center justify-center object-cover overflow-hidden font-sans '
    >
      <div className='fixed inset-0 flex flex-col items-center justify-center overflow-hidden font-sans bg-[#D6D58E]' ref={containerRef}>

        {/* Loading Bar Section */}

        <div className="absolute bottom-16 left-6 w-64 z-100">
          <div className="text-black text-sm mb-2 tracking-wider">
            Loading...
          </div>
          <div className="w-full h-1 bg-gray-300 overflow-hidden rounded">
            <div className="progress-fill h-full bg-black w-0"
              ref={loadingRef}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-center w-full h-full"
          
        >
          {cardData.map((card) => (
            <Card
              key={card.id}
              src={card.src}
              alt={card.alt}
              customClasses={card.style}
              onImageLoad={handleImageLoad}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
