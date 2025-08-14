'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const ZeroCaloriiPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
            Când NU mănânc deloc (0 calorii) – ce pot bea
          </h1>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              SCOP: Hidratare fără calorii
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 dark:text-gray-300 space-y-6">
            <p className="text-xl italic">
              Hidratarea corectă în timpul pauzei alimentare ajută la reducerea senzației de foame, menține o stare stabilă și asigură continuitatea beneficiilor fără a întrerupe procesul.
            </p>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2 h-6 w-6" /> RECOMANDAT (sigur)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Apă simplă</li>
                <li>Apă cu o felie de fruct (doar felia, fără suc stoars)</li>
                <li>Ceai neîndulcit (verde, negru, de plante)</li>
                <li>Cafea simplă (fără zahăr sau lapte)</li>
                <li>(Pentru posturi &gt;24h) Electroliți fără calorii</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-red-600 dark:text-red-400">
                <XCircle className="mr-2 h-6 w-6" /> ATENȚIE (evită / riscant)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sucuri, „apă cu arome” îndulcită, lapte, smoothie-uri, alcool</li>
                <li>Îndulcitori calorici; îndulcitorii non-calorici pot crește pofta la unele persoane</li>
                <li>
                  <strong>Deshidratare:</strong> dacă apar amețeală, durere de cap, slăbiciune, oprește perioada fără mâncare.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-blue-600 dark:text-blue-400">
                <AlertTriangle className="mr-2 h-6 w-6" /> EXEMPLE (simple)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>1 pahar de apă → 1 cană de ceai → 1 cafea simplă (maxim 1–2 pe zi)</li>
                <li>Consumul de apă recomandat este între 1,5 - 2,5 litri pe zi, în funcție de fiecare persoană.</li>
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

export default ZeroCaloriiPage;
