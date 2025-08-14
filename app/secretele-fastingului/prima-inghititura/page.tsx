'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const PrimaInghitituraPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
            Când ÎNCEP să mănânc (PRIMA ÎNGHIȚITURĂ) – cum procedez
          </h1>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-black">
              SCOP: Repornirea digestiei blând, prevenirea disconfortului și a mâncatului impulsiv.
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 dark:text-gray-300 space-y-6">

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2 h-6 w-6" /> RECOMANDAT (pași simpli)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pahar cu apă.</li>
                <li>Porție mică, ușor de digerat: supă clară sau iaurt simplu.</li>
                <li>Așteaptă 5–10 minute, vezi cum te simți, apoi continuă.</li>
                <li>
                  <strong>Opțional, pentru &gt;24h fără mâncare:</strong>
                  <ul className="list-disc pl-6 mt-2">
                    <li>200–250 ml apă caldă + 1/4 linguriță scorțișoară</li>
                    <li>și 1–2 lingurițe zeamă de lămâie sau 1 linguriță oțet de mere (bine diluat în apa caldă).</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-red-600 dark:text-red-400">
                <XCircle className="mr-2 h-6 w-6" /> ATENȚIE (evită / riscant)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Porții mari din prima, prăjeli, dulciuri, alcool.</li>
                <li>Dacă ai medicație care necesită mâncare, urmează indicația medicului.</li>
                <li>Băuturi acide (lămâie / oțet) pot irita refluxul, gastrita, ulcerul → evită în aceste situații.</li>
                <li>Protejează smalțul dentar: diluează bine, bea cu pai, clătește gura cu apă după.</li>
                <li>Dacă ai diabet sau iei medicamente care scad glicemia, monitorizează: oțetul de mere poate potența scăderea glicemiei.</li>
                <li>Simptome de alarmă: greață, amețeală, tremur → încetinește / oprește.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-blue-600 dark:text-blue-400">
                <AlertTriangle className="mr-2 h-6 w-6" /> EXEMPLE (primele înghițituri)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>200–250 ml apă caldă cu scorțișoară + 1–2 lingurițe zeamă de lămâie sau 1 linguriță oțet de mere (diluat) – opțional pentru &gt;24h.</li>
                <li>150–200 ml supă de legume.</li>
                <li>100–150 g iaurt simplu/kefir.</li>
              </ul>
            </div>

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

export default PrimaInghitituraPage;