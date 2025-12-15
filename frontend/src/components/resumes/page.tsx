'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye, Trash2, Loader2, Star, BarChart3 } from 'lucide-react';
import ResumeUploadModal from '@/components/modals/ResumeUploadModal';
import ResumeViewModal from '@/components/modals/ResumeViewModal';
import { useResumeStore } from '@/lib/store/stores';
import { useToast } from '@/hooks/use-toast';
import { Resume } from '@/lib/api/services';

export default function ResumesPage() {
  const { resumes, isLoading, fetchResumes, deleteResume, analyzeResume, setPrimaryResume } = useResumeStore();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [viewingResume, setViewingResume] = useState<Resume | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteResume(id);
      toast({
        title: 'Resume deleted',
        description: `${title} has been deleted`,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      await analyzeResume(id);
      toast({
        title: 'Analysis complete',
        description: 'Your resume has been analyzed',
      });
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleSetPrimary = async (id: string, title: string) => {
    try {
      await setPrimaryResume(id);
      toast({
        title: 'Primary resume updated',
        description: `${title} is now your primary resume`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to set primary resume. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUploadSuccess = () => {
    // Refresh the list after successful upload
    fetchResumes();
  };

  const handleView = (resume: Resume) => {
    setViewingResume(resume);
    setIsViewModalOpen(true);
  };

  if (isLoading && resumes.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-slate-600">Loading resumes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Resumes</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and optimize your resumes with AI
              </p>
            </div>
            <ResumeUploadModal onSuccess={handleUploadSuccess} />
          </div>

          {resumes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  No resumes yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
                  Upload your first resume to get started with AI-powered analysis and optimization
                </p>
                <ResumeUploadModal onSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="truncate">{resume.title}</CardTitle>
                            {resume.is_primary && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1 flex-shrink-0">
                                <Star className="h-3 w-3 fill-current" />
                                Primary
                              </span>
                            )}
                          </div>
                          <CardDescription>
                            Uploaded {new Date(resume.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* ATS Score */}
                      {resume.ats_score !== null && resume.ats_score !== undefined && (
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              ATS Score
                            </p>
                            <div className="flex items-baseline gap-2">
                              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {Math.round(resume.ats_score)}
                              </div>
                              <span className="text-lg text-slate-500">/100</span>
                            </div>
                          </div>
                          
                          {resume.keyword_match_score !== null && (
                            <div className="border-l pl-6">
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                Keyword Match
                              </p>
                              <div className="flex items-baseline gap-2">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {Math.round(resume.keyword_match_score ?? 0)}
                                </div>
                                <span className="text-sm text-slate-500">%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Strengths & Weaknesses */}
                      {(resume.strengths || resume.weaknesses) && (
                        <div className="grid md:grid-cols-2 gap-4 pt-2">
                          {resume.strengths && resume.strengths.length > 0 && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="text-sm font-semibold text-green-900 dark:text-green-400 mb-2">
                                ✓ Strengths
                              </p>
                              <ul className="space-y-1">
                                {resume.strengths.slice(0, 3).map((strength, i) => (
                                  <li key={i} className="text-sm text-green-800 dark:text-green-300">
                                    • {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {resume.weaknesses && resume.weaknesses.length > 0 && (
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                              <p className="text-sm font-semibold text-orange-900 dark:text-orange-400 mb-2">
                                ⚠ Areas to Improve
                              </p>
                              <ul className="space-y-1">
                                {resume.weaknesses.slice(0, 3).map((weakness, i) => (
                                  <li key={i} className="text-sm text-orange-800 dark:text-orange-300">
                                    • {weakness}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAnalyze(resume.id)}
                          disabled={analyzingId === resume.id}
                        >
                          {analyzingId === resume.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Analyze
                            </>
                          )}
                        </Button>

                        {!resume.is_primary && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetPrimary(resume.id, resume.title)}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Set as Primary
                          </Button>
                        )}

                        <Button variant="outline" size="sm" onClick={() => handleView(resume)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>

                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(resume.id, resume.title)}
                          disabled={deletingId === resume.id}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          {deletingId === resume.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Resume Count */}
          {resumes.length > 0 && (
            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} uploaded
            </div>
          )}
        </div>

        {/* Resume View Modal */}
        {viewingResume && (
          <ResumeViewModal
            resume={viewingResume}
            open={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
}