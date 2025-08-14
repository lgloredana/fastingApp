'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const IndiceGlicemicPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
            Cand mananci: atenție la indicele glicemic (IG)
          </h1>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-black">
              Înțelegerea indicelui glicemic
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Află de ce este important să fii atent la indicele glicemic al alimentelor pe care le consumi în fereastra de alimentație.
            </p>
            {/* Placeholder for more content */}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/secretele-fastingului">
            <button className="bg-white/20 hover:bg-white/30 text-black font-bold py-2 px-4 rounded-lg transition-colors border-2 border-white">
              Înapoi la Secretele Fastingului
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IndiceGlicemicPage;
