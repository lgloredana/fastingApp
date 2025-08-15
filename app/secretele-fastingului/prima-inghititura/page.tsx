"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const PrimaInghitituraPage = () => {
  return (
    <div className="from-light-green-500 min-h-screen bg-gradient-to-br to-emerald-600 p-4 sm:p-6 md:p-8 dark:from-emerald-600 dark:to-emerald-700">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black sm:text-4xl md:text-5xl">
            Când ÎNCEP să mănânc (PRIMA ÎNGHIȚITURĂ) – cum procedez
          </h1>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-black">
              SCOP: Repornirea digestiei blând, prevenirea disconfortului și a
              mâncatului impulsiv.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="mb-3 flex items-center text-xl font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2 h-6 w-6" /> RECOMANDAT (pași
                simpli)
              </h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>Pahar cu apă.</li>
                <li>
                  Porție mică, ușor de digerat: supă clară sau iaurt simplu.
                </li>
                <li>Așteaptă 5–10 minute, vezi cum te simți, apoi continuă.</li>
                <li>
                  <strong>Opțional, pentru &gt;24h fără mâncare:</strong>
                  <ul className="mt-2 list-disc pl-6">
                    <li>200–250 ml apă caldă + 1/4 linguriță scorțișoară</li>
                    <li>
                      și 1–2 lingurițe zeamă de lămâie sau 1 linguriță oțet de
                      mere (bine diluat în apa caldă).
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 flex items-center text-xl font-bold text-red-600 dark:text-red-400">
                <XCircle className="mr-2 h-6 w-6" /> ATENȚIE (evită / riscant)
              </h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>Porții mari din prima, prăjeli, dulciuri, alcool.</li>
                <li>
                  Dacă ai medicație care necesită mâncare, urmează indicația
                  medicului.
                </li>
                <li>
                  Băuturi acide (lămâie / oțet)
                  <ul className="mt-2 list-disc pl-6">
                    <li>
                      pot irita refluxul, gastrita, ulcerul → evită în aceste
                      situații.
                    </li>
                    <li>
                      Protejează smalțul dentar: diluează bine, bea cu pai,
                      clătește gura cu apă după.
                    </li>
                  </ul>
                </li>
                <li>
                  Dacă ai diabet sau iei medicamente care scad glicemia,
                  monitorizează: oțetul de mere poate potența scăderea
                  glicemiei.
                </li>
                <li>
                  Simptome de alarmă: greață, amețeală, tremur → încetinește /
                  oprește.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 flex items-center text-xl font-bold text-blue-600 dark:text-blue-400">
                <AlertTriangle className="mr-2 h-6 w-6" /> EXEMPLE (primele
                înghițituri)
              </h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  200–250 ml apă caldă cu scorțișoară + 1–2 lingurițe zeamă de
                  lămâie sau 1 linguriță oțet de mere (diluat) – opțional pentru
                  &gt;24h.
                </li>
                <li>150–200 ml supă de legume.</li>
                <li>100–150 g iaurt simplu/kefir.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/secretele-fastingului">
            <button className="rounded-lg border-2 border-white bg-white/20 px-4 py-2 font-bold text-black transition-colors hover:bg-white/30">
              Înapoi la Secretele Fastingului
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrimaInghitituraPage;
