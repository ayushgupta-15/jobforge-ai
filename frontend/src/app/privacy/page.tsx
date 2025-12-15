import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Lock, RefreshCw, Database, Mail } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Privacy Policy | JobForge AI',
  description: 'Understand how JobForge AI collects, stores, and protects your personal data.',
};

const lastUpdated = 'January 5, 2025';

const privacyPrinciples = [
  {
    title: 'Transparent Data Use',
    description:
      'We explain exactly why we collect data, how we use it to power JobForge AI, and where it is stored.',
    icon: ShieldCheck,
  },
  {
    title: 'Security by Design',
    description:
      'Encryption, strict access controls, and continuous monitoring protect your applications and documents.',
    icon: Lock,
  },
  {
    title: 'User Control',
    description:
      'You decide what data is uploaded, how long we retain it, and when it should be deleted.',
    icon: RefreshCw,
  },
];

const dataPractices = [
  {
    title: 'Information We Collect',
    copy:
      'We collect only the inputs you provide so that we can deliver personalized guidance and automation.',
    highlights: [
      'Account details such as name, email, and authentication metadata',
      'Resumes, cover letters, interview notes, and other job materials you upload',
      'Usage analytics that help us improve onboarding flows and feature adoption',
    ],
  },
  {
    title: 'How We Use Data',
    copy:
      'JobForge AI processes information to generate insights, automate repetitive tasks, and enhance your job search workflow.',
    highlights: [
      'Deliver AI-driven resume feedback and interview preparation content',
      'Recommend opportunities and track job applications across tools',
      'Send service notifications and product updates you opt into',
    ],
  },
  {
    title: 'Data Retention',
    copy:
      'Content is stored for as long as your account remains active or until you submit a deletion request.',
    highlights: [
      'Resume versions and prompts can be permanently removed from settings',
      'Backups are purged on a scheduled rotation to minimize exposure',
      'Aggregated telemetry never includes identifying characteristics',
    ],
  },
];

const userRights = [
  'Access, export, or delete personal data at any time from your profile settings',
  'Update notification preferences and third-party integrations with a single click',
  'Request human review of automated decisions that meaningfully affect your job search',
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-6">
          <Badge variant="secondary" className="mx-auto w-fit">
            Updated {lastUpdated}
          </Badge>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Privacy Commitment
            </p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Your data powers our AI, never the other way around.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              JobForge AI is built for job seekers who expect security, clarity, and control when sharing
              their professional documents. This policy explains the practices that keep your information safe.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {privacyPrinciples.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="border-2 border-transparent hover:border-blue-500 transition-colors">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">How information flows through JobForge AI</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {dataPractices.map(({ title, copy, highlights }) => (
              <Card key={title} className="h-full">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{copy}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <p>{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white dark:bg-slate-800 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <CardTitle>Third-Party Processors</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Trusted infrastructure providers host our databases and AI models. Each partner is reviewed for
                SOC 2 compliance, encryption standards, and incident response maturity.
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white dark:bg-slate-800 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle>Incident Response</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                If an issue impacts your content, we notify affected users, provide remediation plans, and log the event
                for future audits. You can track current system health from the dashboard banner.
              </p>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your privacy rights</h2>
          <div className="space-y-3">
            {userRights.map((right) => (
              <div key={right} className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <p className="text-sm sm:text-base">{right}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Card className="border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-900/10">
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Need to talk to a human?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Reach out with privacy questions, DPA requests, or security disclosures.
                </p>
              </div>
              <Link
                href="mailto:security@jobforge.ai"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" /> Contact our security team
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
