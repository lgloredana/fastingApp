"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface DrinkImage {
  src: string;
  alt: string;
  caption: string;
}

const drinkImages: DrinkImage[] = [
  {
    src: "/bauturi3.png",
    alt: "Băuturi permise în timpul pauzei alimentare",
    caption: "Băuturi permise în timpul pauzei alimentare",
  },
  {
    src: "/migdale.png",
    alt: "Migdale",
    caption: "Migdale",
  },
  {
    src: "/castraveti.png",
    alt: "Castraveți și legume",
    caption: "Legume și opțiuni sănătoase",
  },
  {
    src: "/ardeiGras2.png",
    alt: "Ardei gras",
    caption: "Ardei gras",
  },
  {
    src: "/rosii.png",
    alt: "Roșii și alimente",
    caption: "Alimente recomandate în perioada de alimentare",
  },
  {
    src: "/branza.png",
    alt: "Brânză",
    caption: "Brânză",
  },
  {
    src: "/ceapaVerde.png",
    alt: "Ceapă verde",
    caption: "Ceapă verde",
  },
  {
    src: "/fasole.png",
    alt: "Fasole",
    caption: "Alimente recomandate în perioada de alimentare",
  },
  {
    src: "/morcov.png",
    alt: "Morcov",
    caption: "Morcov",
  },
  {
    src: "/salata.png",
    alt: "Salată și alimente",
    caption: "Alimente recomandate în perioada de alimentare",
  },
  {
    src: "/pastaiVerzi.png",
    alt: "Pastai verzi",
    caption: "Alimente recomandate în perioada de alimentare",
  },
  {
    src: "/paine.png",
    alt: "Paine",
    caption: "Paine",
  },
  {
    src: "/dovlecei.png",
    alt: "Dovlecei",
    caption: "Dovlecei",
  },
  {
    src: "/ardeiGras.png",
    alt: "Ardei gras",
    caption: "Ardei gras",
  },
  {
    src: "/peste.png",
    alt: "Peste",
    caption: "Peste",
  },

  {
    src: "/rosie.png",
    alt: "Rosie",
    caption: "Rosie",
  },
  {
    src: "/peste2.png",
    alt: "Peste",
    caption: "Peste",
  },
  {
    src: "/pui.png",
    alt: "Pui",
    caption: "Pui",
  },
  {
    src: "/nuci.png",
    alt: "Nuci",
    caption: "Nuci",
  },
  //chia
  {
    src: "/chia.png",
    alt: "Chia",
    caption: "Chia",
  },
  {
    src: "/oua.png",
    alt: "Ouă",
    caption: "Ouă",
  },
];

export function DrinksCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
      api.off("pointerDown");
      api.off("pointerUp");
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
    },
    [api],
  );

  return (
    <div className="mb-4 w-full">
      <div
        className="relative h-80 w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg sm:h-96 md:h-[28rem] lg:h-[32rem] xl:h-[36rem]"
        style={{ touchAction: "manipulation" }}
      >
        <Carousel
          setApi={setApi}
          className="h-full w-full"
          opts={{
            align: "start",
            loop: true,
            dragFree: false,
            containScroll: "trimSnaps",
            slidesToScroll: 1,
            dragThreshold: 10,
          }}
        >
          <CarouselContent
            className="flex h-full"
            style={{ touchAction: "pan-y pan-x" }}
          >
            {drinkImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div
                  className="relative h-full min-h-[20rem] w-full bg-gray-100 sm:min-h-[24rem] md:min-h-[28rem] lg:min-h-[32rem] xl:min-h-[36rem]"
                  style={{ touchAction: "pan-y pan-x" }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-contain object-center sm:object-cover md:object-cover lg:object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                    priority={index === 0}
                  />

                  <div className="absolute right-0 bottom-0 left-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-2">
                    <p className="text-center text-sm font-medium text-white">
                      {image.caption}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation arrows */}
          <CarouselPrevious className="absolute top-1/2 left-2 z-20 -translate-y-1/2 border-white/20 bg-white/80 text-black hover:bg-white" />
          <CarouselNext className="absolute top-1/2 right-2 z-20 -translate-y-1/2 border-white/20 bg-white/80 text-black hover:bg-white" />

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
            {drinkImages.map((_, index) => (
              <button
                key={index}
                className={`h-3 w-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "scale-125 bg-white"
                    : "bg-white/50 hover:bg-white/75"
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
