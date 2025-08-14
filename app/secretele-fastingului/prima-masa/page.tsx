'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const PrimaMasaPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
            PRIMA MASĂ după ce NU ai mâncat – ce pui în farfurie
          </h1>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-black">
              SCOP: Să te hrănești echilibrat fără creșteri bruște de glicemie și fără disconfort.
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 dark:text-gray-300 space-y-6">

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2 h-6 w-6" /> RECOMANDAT (structura farfuriei)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>½ farfurie legume</strong> (crude sau gătite ușor)</li>
                <li><strong>¼ proteine</strong> (100–150 g: ouă, pește, pui, iaurt grecesc)</li>
                <li><strong>¼ carbohidrați complecși</strong> (1 felie pâine integrală sau ½ cană orez fiert sau 1 cartof mic)</li>
                <li><strong>Grăsimi sănătoase:</strong> 1 lingură ulei de măsline / câteva nuci</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-red-600 dark:text-red-400">
                <XCircle className="mr-2 h-6 w-6" /> ATENȚIE (evită / riscant)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Porții uriașe, prăjeli, desert imediat, alcool</li>
                <li>Mâncat foarte repede (crește riscul de disconfort sau de mancat compulsiv)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-blue-600 dark:text-blue-400">
                <AlertTriangle className="mr-2 h-6 w-6" /> EXEMPLE (combinații concrete)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pește la cuptor + broccoli/morcovi + 1 cartof mic</li>
                <li>Omletă 2 ouă + salată mare + 1 felie pâine integrală</li>
                <li>Iaurt grecesc 2% + semințe + fruct mic (dacă perioada fără mâncare a fost scurtă)</li>
              </ul>
            </div>

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

export default PrimaMasaPage;