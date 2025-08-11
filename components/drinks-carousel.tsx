'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface DrinkImage {
  src: string;
  alt: string;
  caption: string;
}

const drinkImages: DrinkImage[] = [
  {
    src: '/bauturi3.png',
    alt: 'Băuturi permise în timpul pauzei alimentare',
    caption: 'Băuturi permise în timpul pauzei alimentare',
  },
  {
    src: '/castraveti.png',
    alt: 'Castraveți și legume',
    caption: 'Legume și opțiuni sănătoase',
  },
  {
    src: '/rosii.png',
    alt: 'Roșii și alimente',
    caption: 'Alimente recomandate în perioada de alimentare',
  },
  {
    src: '/salata.png',
    alt: 'Salată și alimente',
    caption: 'Alimente recomandate în perioada de alimentare',
  },
  {
    src: '/pastaiVerzi.png',
    alt: 'Pastai verzi',
    caption: 'Alimente recomandate în perioada de alimentare',
  },
  {
    src: '/paine.png',
    alt: 'Paine',
    caption: 'Alimente recomandate în perioada de alimentare',
  },
];

export function DrinksCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const getImageSrc = (src: string) => {
    const fullSrc = `${
      process.env.NODE_ENV === 'production' ? '/fastingApp' : ''
    }${src}`;
    console.log(
      `Environment: ${process.env.NODE_ENV}, Original: ${src}, Generated: ${fullSrc}`
    );
    return fullSrc;
  };

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    // Debug touch events
    api.on('pointerDown', () => {
      console.log('Touch/drag started');
    });

    api.on('pointerUp', () => {
      console.log('Touch/drag ended');
    });

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
      api.off('pointerDown');
      api.off('pointerUp');
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
    },
    [api]
  );

  return (
    <div className='w-full mb-4'>
      <div className='relative w-full h-96 sm:h-[28rem] md:h-[32rem] lg:h-[36rem] xl:h-[40rem] overflow-hidden rounded-lg shadow-lg bg-gray-200'>
        <Carousel
          setApi={setApi}
          className='w-full h-full touch-pan-x'
          opts={{
            align: 'start',
            loop: true,
            dragFree: false,
            containScroll: 'trimSnaps',
            slidesToScroll: 1,
          }}
        >
          <CarouselContent className='h-full flex touch-pan-x'>
            {drinkImages.map((image, index) => (
              <CarouselItem key={index} className='h-full'>
                <div className='relative h-full w-full bg-gray-100 min-h-[24rem] sm:min-h-[28rem] md:min-h-[32rem] lg:min-h-[36rem] xl:min-h-[40rem]'>
                  <Image
                    src={getImageSrc(image.src)}
                    alt={image.alt}
                    fill
                    className='object-cover object-bottom sm:object-bottom md:object-bottom'
                    sizes='(max-width: 1700px) 100vw, 100vw'
                    priority={index === 0}
                    onError={(e) => {
                      console.error(
                        'Image failed to load:',
                        getImageSrc(image.src)
                      );
                    }}
                    onLoad={() => {
                      console.log(
                        'Image loaded successfully:',
                        getImageSrc(image.src)
                      );
                    }}
                  />

                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 z-10'>
                    <p className='text-white text-sm font-medium text-center'>
                      {image.caption}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation arrows */}
          <CarouselPrevious className='absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black border-white/20' />
          <CarouselNext className='absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black border-white/20' />

          {/* Dots indicator */}
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2'>
            {drinkImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </div>
  );
}
