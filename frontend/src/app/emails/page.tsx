'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useApplicationStore, useEmailStore } from '@/lib/store/stores';

export default function EmailsPage() {
  const { toast } = useToast();
  const {
    templates,
    schedules,
    isLoading,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    fetchSchedules,
    sendEmail,
    cancelSchedule,
  } = useEmailStore();
  const { applications, fetchApplications } = useApplicationStore();

  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: '',
    subject: '',
    body: '',
    is_default: false,
    is_active: true,
  });
  const [sendForm, setSendForm] = useState({
    to_email: '',
    template_id: '',
    application_id: '',
    subject: '',
    body: '',
    send_at: '',
  });

  useEffect(() => {
    fetchTemplates();
    fetchSchedules();
    fetchApplications();
  }, [fetchApplications, fetchSchedules, fetchTemplates]);

  const templateOptions = useMemo(
    () => templates.filter(t => t.is_active),
    [templates]
  );

  const handleTemplateSubmit = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      toast({
        title: 'Missing fields',
        description: 'Name, subject, and body are required.',
      });
      return;
    }
    try {
      await createTemplate({
        name: templateForm.name,
        category: templateForm.category || undefined,
        subject: templateForm.subject,
        body: templateForm.body,
        is_default: templateForm.is_default,
        is_active: templateForm.is_active,
      });
      setTemplateForm({
        name: '',
        category: '',
        subject: '',
        body: '',
        is_default: false,
        is_active: true,
      });
      toast({ title: 'Template created' });
    } catch {
      toast({ title: 'Failed to create template', description: 'Please try again.' });
    }
  };

  const handleSend = async () => {
    if (!sendForm.to_email) {
      toast({ title: 'Recipient required', description: 'Add a recipient email address.' });
      return;
    }
    try {
      await sendEmail({
        to_email: sendForm.to_email,
        template_id: sendForm.template_id || undefined,
        application_id: sendForm.application_id || undefined,
        subject: sendForm.subject || undefined,
        body: sendForm.body || undefined,
        send_at: sendForm.send_at ? new Date(sendForm.send_at).toISOString() : undefined,
      });
      setSendForm({
        to_email: '',
        template_id: '',
        application_id: '',
        subject: '',
        body: '',
        send_at: '',
      });
      toast({ title: 'Email queued', description: 'Your email has been scheduled.' });
    } catch {
      toast({ title: 'Failed to send email', description: 'Check your SMTP settings.' });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const selected = templates.find(t => t.id === templateId);
    setSendForm(prev => ({
      ...prev,
      template_id: templateId,
      subject: selected?.subject || prev.subject,
      body: selected?.body || prev.body,
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Email Automation</h1>
            <p className="text-slate-600">
              Create templates, schedule follow-ups, and track sends.
            </p>
          </div>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="schedule">Send & Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Template</CardTitle>
                  <CardDescription>
                    Use variables like {'{company_name}'}, {'{job_title}'}, {'{user_name}'}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Template name"
                      value={templateForm.name}
                      onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })}
                    />
                    <Input
                      placeholder="Category (optional)"
                      value={templateForm.category}
                      onChange={(event) => setTemplateForm({ ...templateForm, category: event.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Subject"
                    value={templateForm.subject}
                    onChange={(event) => setTemplateForm({ ...templateForm, subject: event.target.value })}
                  />
                  <Textarea
                    placeholder="Email body"
                    rows={6}
                    value={templateForm.body}
                    onChange={(event) => setTemplateForm({ ...templateForm, body: event.target.value })}
                  />
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={templateForm.is_default}
                      onCheckedChange={(checked) => setTemplateForm({ ...templateForm, is_default: checked })}
                    />
                    <span className="text-sm text-slate-600">Mark as default template</span>
                  </div>
                  <Button onClick={handleTemplateSubmit} disabled={isLoading}>
                    Create Template
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {templates.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center text-slate-600">
                      No templates yet. Create your first follow-up template.
                    </CardContent>
                  </Card>
                ) : (
                  templates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.subject}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 whitespace-pre-line">
                          {template.body}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            {template.category || 'general'}
                          </span>
                          {template.is_default && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            Use Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Send or Schedule Email</CardTitle>
                  <CardDescription>
                    Leave subject/body blank to use the selected template.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Recipient email"
                    type="email"
                    value={sendForm.to_email}
                    onChange={(event) => setSendForm({ ...sendForm, to_email: event.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select value={sendForm.template_id} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateOptions.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={sendForm.application_id}
                      onValueChange={(value) => setSendForm({ ...sendForm, application_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Attach application (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {applications.map((application) => (
                          <SelectItem key={application.id} value={application.id}>
                            {application.company_name} - {application.job_title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Subject (optional)"
                    value={sendForm.subject}
                    onChange={(event) => setSendForm({ ...sendForm, subject: event.target.value })}
                  />
                  <Textarea
                    placeholder="Body (optional)"
                    rows={5}
                    value={sendForm.body}
                    onChange={(event) => setSendForm({ ...sendForm, body: event.target.value })}
                  />
                  <Input
                    type="datetime-local"
                    value={sendForm.send_at}
                    onChange={(event) => setSendForm({ ...sendForm, send_at: event.target.value })}
                  />
                  <Button onClick={handleSend} disabled={isLoading}>
                    Send / Schedule
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {schedules.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center text-slate-600">
                      No scheduled emails yet.
                    </CardContent>
                  </Card>
                ) : (
                  schedules.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{schedule.subject}</CardTitle>
                        <CardDescription>
                          To {schedule.to_email} • {new Date(schedule.send_at).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 whitespace-pre-line">
                          {schedule.body}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            {schedule.status}
                          </span>
                          {schedule.last_error && (
                            <span className="text-xs text-red-600">{schedule.last_error}</span>
                          )}
                        </div>
                        {schedule.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelSchedule(schedule.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
