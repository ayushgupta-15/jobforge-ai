import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Mail, 
  Calendar, 
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Header */}
      <header className="glass-header sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white animate-pulse-glow" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobForge AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 glass-card rounded-full text-sm font-medium mb-8 animate-fade-in-down">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              #1 AI-Powered Job Application Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Land Your Dream Job with
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              AI-Powered Assistance
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Transform your job search with cutting-edge AI. Optimize resumes, track applications, 
            and automate follow-ups — all in one beautiful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up animation-delay-400">
            <Link href="/register">
              <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8 glass-card border-white/20 hover:bg-white/10">
                See How It Works
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-400 animate-fade-in-up animation-delay-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Free forever plan</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="max-w-6xl mx-auto mt-16 animate-fade-in-up animation-delay-800">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 blur-3xl"></div>
            <div className="relative glass-card p-4 rounded-2xl shadow-2xl">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4 text-slate-300 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400">Analyzing resume...</span>
                    <span className="ml-auto text-green-400">✓ 92% ATS Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">Generating cover letter...</span>
                    <span className="ml-auto text-green-400">✓ Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-400" />
                    <span className="text-pink-400">Matching jobs...</span>
                    <span className="ml-auto text-green-400">✓ 47 matches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools and AI-powered features to accelerate your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: 'AI Resume Optimizer',
                description: 'Get instant feedback and optimization suggestions powered by advanced AI',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Briefcase,
                title: 'Application Tracking',
                description: 'Organize all your applications in one beautiful, intuitive dashboard',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Mail,
                title: 'Email Automation',
                description: 'Generate personalized emails and automate follow-ups with AI',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Calendar,
                title: 'Interview Prep',
                description: 'Practice with AI-generated questions tailored to your role',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: TrendingUp,
                title: 'Analytics & Insights',
                description: 'Track progress and get insights to improve your strategy',
                color: 'from-pink-500 to-rose-500',
              },
              {
                icon: Zap,
                title: 'Job Matching AI',
                description: 'Get matched with relevant jobs based on your skills',
                color: 'from-indigo-500 to-purple-500',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="glass-card border-white/10 hover:border-white/20 group transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 blur-3xl"></div>
            <div className="relative glass-card p-12 rounded-3xl border-white/20 shadow-2xl">
              <Shield className="w-16 h-16 mx-auto mb-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ready to Transform Your Job Search?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                Join thousands who are landing their dream jobs with JobForge AI
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2024 JobForge AI. Built with ❤️ for job seekers.</p>
        </div>
      </footer>
    </div>
  );
}
