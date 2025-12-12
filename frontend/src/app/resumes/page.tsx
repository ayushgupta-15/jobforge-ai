'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye, Trash2, Loader2 } from 'lucide-react';
import ResumeUploadModal from '@/components/modals/ResumeUploadModal';
import { useResumeStore } from '@/lib/store/stores';

export default function ResumesPage() {
  const { resumes, isLoading, fetchResumes, deleteResume, analyzeResume } = useResumeStore();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  if (isLoading && resumes.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
              <h1 className="text-3xl font-bold">Resumes</h1>
              <p className="text-slate-600">Manage and optimize your resumes</p>
            </div>
            <ResumeUploadModal onSuccess={fetchResumes} />
          </div>

          {resumes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
                <p className="text-slate-600 mb-4">Upload your first resume to get started</p>
                <ResumeUploadModal onSuccess={fetchResumes} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <Card key={resume.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle>{resume.title}</CardTitle>
                          <CardDescription>
                            Uploaded {new Date(resume.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      {resume.is_primary && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {resume.ats_score !== null && (
                          <div>
                            <p className="text-sm text-slate-600">ATS Score</p>
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold">{resume.ats_score}</div>
                              <span className="text-sm text-slate-600">/100</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => analyzeResume(resume.id)}
                        >
                          Analyze
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteResume(resume.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
