'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Resume } from '@/lib/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResumeViewModalProps {
  resume: Resume;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResumeViewModal({ resume, open, onOpenChange }: ResumeViewModalProps) {
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handleDownload = async () => {
    if (!resume.file_url) {
      alert('File URL not available');
      return;
    }

    setIsLoadingFile(true);
    try {
      // In production, this would download from your backend
      // For now, we'll open in new tab if it's a URL
      if (resume.file_url.startsWith('http')) {
        window.open(resume.file_url, '_blank');
      } else {
        // Construct full URL for relative paths
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const fullUrl = `${apiUrl}${resume.file_url}`;
        window.open(fullUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resume');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleOpenOriginal = () => {
    if (resume.file_url) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const fullUrl = resume.file_url.startsWith('http') 
        ? resume.file_url 
        : `${apiUrl}${resume.file_url}`;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">{resume.title}</DialogTitle>
                <DialogDescription>
                  Uploaded {new Date(resume.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </DialogDescription>
              </div>
            </div>
            {resume.is_primary && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                Primary Resume
              </span>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            {resume.raw_text && <TabsTrigger value="content">Content</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {/* Scores Section */}
            <div className="grid grid-cols-2 gap-4">
              {resume.ats_score !== null && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      ATS Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-slate-900 dark:text-white">
                        {Math.round(resume.ats_score ?? 0)}
                      </div>
                      <span className="text-lg text-slate-500">/100</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${resume.ats_score}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {resume.keyword_match_score !== null && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Keyword Match
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-slate-900 dark:text-white">
                        {Math.round(resume.keyword_match_score ?? 0)}
                      </div>
                      <span className="text-lg text-slate-500">%</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${resume.keyword_match_score}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* File Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">File Type:</span>
                  <span className="font-medium">
                    {resume.file_type ? resume.file_type.split('/')[1].toUpperCase() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status:</span>
                  <span className="font-medium">
                    {resume.is_primary ? 'Primary Resume' : 'Secondary Resume'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(resume.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {(resume.strengths || resume.weaknesses) && (
              <div className="grid md:grid-cols-2 gap-4">
                {resume.strengths && resume.strengths.length > 0 && (
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-green-900 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Strengths ({resume.strengths.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resume.strengths.slice(0, 3).map((strength, i) => (
                          <li key={i} className="text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {resume.weaknesses && resume.weaknesses.length > 0 && (
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Areas to Improve ({resume.weaknesses.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resume.weaknesses.slice(0, 3).map((weakness, i) => (
                          <li key={i} className="text-sm text-orange-800 dark:text-orange-300 flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {resume.suggestions && resume.suggestions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                    AI Suggestions for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {resume.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {i + 1}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 pt-0.5">
                          {suggestion}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 text-center">
                    No AI analysis available yet.
                    <br />
                    Click "Analyze" to get AI-powered suggestions.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* All Strengths */}
            {resume.strengths && resume.strengths.length > 0 && (
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-base text-green-900 dark:text-green-400">
                    All Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resume.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* All Weaknesses */}
            {resume.weaknesses && resume.weaknesses.length > 0 && (
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-base text-orange-900 dark:text-orange-400">
                    All Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resume.weaknesses.map((weakness, i) => (
                      <li key={i} className="text-sm text-orange-800 dark:text-orange-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Content Tab */}
          {resume.raw_text && (
            <TabsContent value="content" className="flex-1 overflow-y-auto mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Extracted Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                      {resume.raw_text}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              {resume.file_url && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenOriginal}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Original
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownload}
                    disabled={isLoadingFile}
                  >
                    {isLoadingFile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}