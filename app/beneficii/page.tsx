'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Dna,
  Brain,
  Zap,
  Shield,
  Target,
} from 'lucide-react';
import Link from 'next/link';

const benefitsData = [
  {
    id: 0,
    icon: <Brain className='h-12 w-12 text-indigo-600' />,
    title: '🧬 De ce sunt importante pauzele alimentare?',
    subtitle: 'Introducere științifică',
    content:
      'Pauzele alimentare regulate sunt din ce în ce mai recunoscute în literatura științifică ca având efecte benefice profunde asupra metabolismului, sănătății celulare și echilibrului hormonal.',
    reference: '',
    color:
      'bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20',
    borderColor: 'border-indigo-200 dark:border-indigo-700',
  },
  {
    id: 1,
    icon: <Dna className='h-12 w-12 text-purple-600' />,
    title: 'Activarea autofagiei',
    subtitle: '🔄 Curățarea celulară naturală',
    content:
      'După aproximativ 14–16 ore de pauză alimentară, corpul intră într-o stare de autofagie, un proces prin care celulele curăță și reciclează componentele uzate sau defecte. Acest mecanism este crucial pentru prevenirea bolilor neurodegenerative, cancerului și procesului de îmbătrânire celulară.',
    reference: '(Mizushima et al., 2008)',
    color:
      'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    borderColor: 'border-purple-200 dark:border-purple-700',
  },
  {
    id: 2,
    icon: <Brain className='h-12 w-12 text-green-600' />,
    title: 'Reglarea hormonilor foamei și sațietății',
    subtitle: '🧠 Echilibrul hormonal',
    content:
      'Postul intermitent reduce nivelurile de insulină și crește sensibilitatea la leptină – hormonul sațietății. De asemenea, reglează secreția de grelină (hormonul foamei), ceea ce duce la un control mai bun al apetitului și reducerea consumului caloric spontan.',
    reference: '(Cummings et al., 2002)',
    color:
      'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    borderColor: 'border-green-200 dark:border-green-700',
  },
  {
    id: 3,
    icon: <Zap className='h-12 w-12 text-orange-600' />,
    title: 'Favorizarea oxidării grăsimii și cetoză naturală',
    subtitle: '🔥 Metabolism optimizat',
    content:
      'După epuizarea rezervelor de glicogen (aprox. 12–16 ore de post), corpul începe să utilizeze acizi grași și corpi cetonici ca surse principale de energie. Acest proces ajută la reducerea masei grase viscerale și la stabilizarea glicemiei, fiind benefic în prevenția diabetului de tip 2.',
    reference: '',
    color:
      'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    borderColor: 'border-orange-200 dark:border-orange-700',
  },
  {
    id: 4,
    icon: <Shield className='h-12 w-12 text-red-600' />,
    title: 'Reducerea inflamației și stresului oxidativ',
    subtitle: '🧬 Protecție celulară',
    content:
      'Studiile arată că pauzele alimentare reglează expresia genelor implicate în inflamație și induc mecanisme de protecție celulară împotriva stresului oxidativ, reducând riscul de boli cronice cardiovasculare și autoimune.',
    reference: '(Longo & Panda, 2016)',
    color:
      'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    borderColor: 'border-red-200 dark:border-red-700',
  },
  {
    id: 5,
    icon: <Target className='h-12 w-12 text-blue-600' />,
    title: 'Optimizarea funcției cognitive',
    subtitle: '🧠 Performanță mentală îmbunătățită',
    content:
      'Prin creșterea nivelului de BDNF (Brain-Derived Neurotrophic Factor), pauzele alimentare pot susține neuroplasticitatea și memoria, oferind un beneficiu cognitiv semnificativ mai ales în perioadele de efort mental susținut.',
    reference: '',
    color:
      'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
  },
];

export default function BeneficiiPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % benefitsData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + benefitsData.length) % benefitsData.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const currentBenefit = benefitsData[currentSlide];

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center'>
          <Link href='/'>
            <Button
              variant='outline'
              className='mb-6 gap-2 rounded-full'
              style={{ borderRadius: '50px' }}
            >
              <ArrowLeft className='h-4 w-4' />
              Înapoi la Aplicație
            </Button>
          </Link>
        </div>

        {/* Carousel */}
        <div className='relative'>
          <Card
            className={`${currentBenefit.color} ${currentBenefit.borderColor} border-2 min-h-[500px] transition-all duration-500 cursor-pointer`}
            onClick={nextSlide}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <CardContent className='py-8 px-6 sm:px-20'>
              <div className='text-center mb-6'>
                <div className='flex justify-center mb-4'>
                  {currentBenefit.icon}
                </div>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                  {currentBenefit.title}
                </h2>
                <p className='text-lg text-gray-700 dark:text-gray-300 font-medium'>
                  {currentBenefit.subtitle}
                </p>
              </div>

              <div className='prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed'>
                <p className='text-base md:text-lg'>{currentBenefit.content}</p>
                {currentBenefit.reference && (
                  <p className='text-sm text-gray-500 dark:text-gray-400 italic mt-4'>
                    {currentBenefit.reference}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Arrows */}
          <Button
            onClick={prevSlide}
            variant='outline'
            size='icon'
            className='hidden sm:block absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white'
            style={{ borderRadius: '50px' }}
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>

          <Button
            onClick={nextSlide}
            variant='outline'
            size='icon'
            className='hidden sm:block absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white'
            style={{ borderRadius: '50px' }}
          >
            <ChevronRight className='h-6 w-6' />
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className='flex justify-center mt-6 gap-2'>
          {benefitsData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className='text-center mt-4'>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            {currentSlide + 1} din {benefitsData.length}
          </span>
        </div>

        {/* Conclusion */}
        <Card className='mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'>
          <CardContent className='p-6'>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-3'>
              ✅ Concluzie
            </h3>
            <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
              Pauzele alimentare nu sunt doar un instrument pentru controlul
              greutății, ci reprezintă o intervenție metabolică cu efecte
              sistemice pozitive. Prin mecanisme evolutiv adaptative, corpul
              uman este conceput să funcționeze optim în cicluri de alimentație
              și repaus, iar valorificarea acestor pauze poate susține sănătatea
              pe termen lung, cu beneficii validate științific.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
