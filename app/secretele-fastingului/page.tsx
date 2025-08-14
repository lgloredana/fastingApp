
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FastingSecretsPage = () => {
  const secrets = [
    {
      title: 'Când NU mănânc deloc (0 calorii) – ce pot bea',
      href: '/secretele-fastingului/zero-calorii',
    },
    {
      title: 'Când ÎNCEP să mănânc (PRIMA ÎNGHIȚITURĂ) – cum procedez',
      href: '/secretele-fastingului/prima-inghititura',
    },
    {
      title: 'PRIMA MASĂ după ce NU am mâncat – ce pun în farfurie',
      href: '/secretele-fastingului/prima-masa',
    },
    {
      title: 'Cand mananci: atenție la indicele glicemic (IG)',
      href: '/secretele-fastingului/indice-glicemic',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
            Secretele unui fasting reușit
          </h1>
          <p className="text-lg text-black/90 mt-2">
            Ghid practic pentru a naviga cu succes prin pauzele alimentare.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {secrets.map((secret, index) => (
            <Link href={secret.href} key={index} className="group">
              <Card className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    {secret.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-end text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors">
                    Vezi detalii
                    <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
         <div className="mt-8 text-center">
          <Link href="/">
            <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Înapoi la pagina principală
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FastingSecretsPage;
