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
    src: '/migdale.png',
    alt: 'Migdale',
    caption: 'Migdale',
  },
  {
    src: '/castraveti.png',
    alt: 'Castraveți și legume',
    caption: 'Legume și opțiuni sănătoase',
  },
  {
    src: '/ardeiGras2.png',
    alt: 'Ardei gras',
    caption: 'Ardei gras',
  },
  {
    src: '/rosii.png',
    alt: 'Roșii și alimente',
    caption: 'Alimente recomandate în perioada de alimentare',
  },
  {
    src: '/branza.png',
    alt: 'Brânză',
    caption: 'Brânză',
  },
  {
    src: '/ceapaVerde.png',
    alt: 'Ceapă verde',
    caption: 'Ceapă verde',
  },
  {
    src: '/ardeiGras2.png',
    alt: 'Ardei gras',
    caption: 'Ardei gras',
  },
  {
    src: '/fasole.png',
    alt: 'Fasole',
    caption: 'Alimente recomandate în perioada de alimentare',
  },
  {
    src: '/morcov.png',
    alt: 'Morcov',
    caption: 'Morcov',
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
    caption: 'Paine',
  },
  {
    src: '/dovlecei.png',
    alt: 'Dovlecei',
    caption: 'Dovlecei',
  },
  {
    src: '/ardeiGras.png',
    alt: 'Ardei gras',
    caption: 'Ardei gras',
  },
  {
    src: '/peste.png',
    alt: 'Peste',
    caption: 'Peste',
  },

  {
    src: '/rosie.png',
    alt: 'Rosie',
    caption: 'Rosie',
  },
  {
    src: '/peste2.png',
    alt: 'Peste',
    caption: 'Peste',
  },
  {
    src: '/pui.png',
    alt: 'Pui',
    caption: 'Pui',
  },
  {
    src: '/nuci.png',
    alt: 'Nuci',
    caption: 'Nuci',
  },
  //chia
  {
    src: '/chia.png',
    alt: 'Chia',
    caption: 'Chia',
  },
  {
    src: '/oua.png',
    alt: 'Ouă',
    caption: 'Ouă',
  },
];

export function DrinksCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const getImageSrc = (src: string) => {
    const fullSrc = `${
      process.env.NODE_ENV === 'production' ? '/fastingApp' : ''
    }${src}`;
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
      <div
        className='relative w-full h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] xl:h-[36rem] overflow-hidden rounded-lg shadow-lg bg-gray-200'
        style={{ touchAction: 'manipulation' }}
      >
        <Carousel
          setApi={setApi}
          className='w-full h-full'
          opts={{
            align: 'start',
            loop: true,
            dragFree: false,
            containScroll: 'trimSnaps',
            slidesToScroll: 1,
            dragThreshold: 10,
          }}
        >
          <CarouselContent
            className='h-full flex'
            style={{ touchAction: 'pan-y pan-x' }}
          >
            {drinkImages.map((image, index) => (
              <CarouselItem key={index} className='h-full'>
                <div
                  className='relative h-full w-full bg-gray-100 min-h-[20rem] sm:min-h-[24rem] md:min-h-[28rem] lg:min-h-[32rem] xl:min-h-[36rem]'
                  style={{ touchAction: 'pan-y pan-x' }}
                >
                  <Image
                    src={getImageSrc(image.src)}
                    alt={image.alt}
                    fill
                    className='object-contain sm:object-cover md:object-cover lg:object-cover object-center'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
                    priority={index === 0}
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
