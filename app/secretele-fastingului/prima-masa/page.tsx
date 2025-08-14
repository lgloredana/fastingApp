'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const PrimaMasaPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
            PRIMA MASĂ după ce NU am mâncat – ce pun în farfurie
          </h1>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-black">
              Alegeri alimentare inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Descoperă ce alimente sunt recomandate pentru prima masă post-fasting pentru a-ți hrăni corpul corect.
            </p>
            {/* Placeholder for more content */}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/secretele-fastingului">
            <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Înapoi la Secretele Fastingului
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrimaMasaPage;
