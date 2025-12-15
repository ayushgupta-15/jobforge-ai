import Link from 'next/link';
import type { Metadata } from 'next';
import { FileCheck2, Shield, Handshake, AlertTriangle, CircleDot, Mail } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Terms of Service | JobForge AI',
  description: 'Understand your rights and responsibilities when using the JobForge AI platform.',
};

const lastUpdated = 'January 5, 2025';

const agreementHighlights = [
  {
    title: 'Account Eligibility',
    description: 'Users must be at least 18 years old and provide accurate information when creating an account.',
  },
  {
    title: 'Permitted Usage',
    description: 'JobForge AI is for personal career advancement. Reselling or redistributing generated content is prohibited.',
  },
  {
    title: 'Subscription Terms',
    description: 'Paid plans renew automatically unless canceled before the renewal date within the billing dashboard.',
  },
];

const acceptableUse = [
  'Do not upload proprietary or confidential information you do not own or have explicit permission to share.',
  'Use the automation tools responsibly—spam or bulk unsolicited outreach through JobForge AI is not allowed.',
  'Never attempt to reverse engineer, scrape, or disrupt the platform or underlying AI models.',
  'Respect job postings and recruiters by ensuring generated materials are truthful and relevant to your experience.',
];

const serviceAssurances = [
  {
    title: 'Service Availability',
    detail:
      'We aim for 99.9% uptime, but access may occasionally be interrupted for maintenance, updates, or events outside of our control.',
  },
  {
    title: 'Intellectual Property',
    detail:
      'You retain ownership of your resumes and documents. Generated insights and platform features remain the property of JobForge AI.',
  },
  {
    title: 'Feedback',
    detail:
      'Suggestions sent to us may be used to improve the service without obligation to compensate you.',
  },
];

const liabilityNotes = [
  'JobForge AI provides recommendations, not guarantees of employment or interview outcomes.',
  'We are not responsible for decisions made by employers or ATS platforms that ingest your materials.',
  'Indirect, incidental, or consequential damages are excluded to the fullest extent permitted by law.',
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-6">
          <Badge variant="secondary" className="mx-auto w-fit">
            Effective {lastUpdated}
          </Badge>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Terms & Policies</p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              These terms describe the relationship between you and JobForge AI. Using the platform means you agree to
              follow the guidelines that keep the community and partners safe.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {agreementHighlights.map(({ title, description }) => (
            <Card key={title} className="border-2 border-transparent hover:border-slate-900/20 transition-colors">
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white dark:bg-white/10 flex items-center justify-center">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <CardTitle>Acceptable Use Policy</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keep JobForge AI healthy by using the product for legitimate career-building activities only.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {acceptableUse.map((rule) => (
                <div key={rule} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <CircleDot className="h-4 w-4 text-blue-500 mt-1" />
                  <p>{rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Handshake className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <CardTitle>Service Commitments</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                What you can expect from us while your subscription is active.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceAssurances.map(({ title, detail }) => (
                <div key={title}>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Limitations of liability</h2>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {liabilityNotes.map((note) => (
                <div key={note} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-1" />
                  <p>{note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-900/10">
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Questions or disputes</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  We are happy to clarify any section of these terms, and we are committed to resolving concerns quickly.
                </p>
              </div>
              <Link
                href="mailto:legal@jobforge.ai"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" /> Contact legal
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
