'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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
              SCOP: Să eviți vârfurile de glicemie imediat după ce începi să mănânci din nou.
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 dark:text-gray-300 space-y-6">
            <p className="text-xl italic">
              Alimentele cu IG mare pot anula rapid efortul depus, cresc pofta și pot da disconfort (somnolență, foame la scurt timp).
            </p>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2 h-6 w-6" /> RECOMANDAT (reguli simple)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Ordinea în farfurie:</strong> întâi legume → apoi proteine → la final carbohidrați.</li>
                <li><strong>Alege IG mic/mediu:</strong> legume, leguminoase (linte, năut), ovăz/paste al dente, orez integral/basmati, pâine integrală.</li>
                <li><strong>Combină carbohidrații cu fibre + proteine + grăsimi bune</strong> (ex.: salată + pui + ulei de măsline).</li>
                <li>Porții mici la carbohidrați, mai ales la prima masă după ce nu ai mâncat.</li>
                <li><strong>Textură și gătire:</strong> „al dente”, mai puțin procesat, răcit și reîncălzit la unele amidonoase (ex. cartof fiert apoi răcit) → IG mai redus.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-red-600 dark:text-red-400">
                <XCircle className="mr-2 h-6 w-6" /> ATENȚIE (evită/riscant imediat după reluare)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>IG mare:</strong> pâine albă moale, piure/cartof copt fierbinte, orez alb foarte fiert, porumb expandat, fulgi de porumb, patiserie, dulciuri, sucuri.</li>
                <li>Smoothie-uri & sucuri de fructe: cresc glicemia foarte repede.</li>
                <li>Porții mari deodată sau mâncat foarte repede.</li>
                <li>Dacă ai rezistență la insulină/diabet, discută cu medicul pentru ținte personalizate.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center text-blue-600 dark:text-blue-400">
                <AlertTriangle className="mr-2 h-6 w-6" /> EXEMPLE (combinații prietenoase cu IG)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pește la cuptor + salată mare (frunze + castravete) + 1 felie pâine integrală.</li>
                <li>Omletă + legume sote (dovlecel, ciuperci) + o porție mică de orez basmati.</li>
                <li>Iaurt grecesc 2% + semințe + fruct mic (dacă perioada fără mâncare a fost scurtă).</li>
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

export default IndiceGlicemicPage;