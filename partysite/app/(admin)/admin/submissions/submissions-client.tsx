'use client';

import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

interface Submission {
  _id: Id<'helpOutSubmissions'>;
  _creationTime: number;
  userId: string;
  roleSlug: string;
  twitterHandle?: string;
  discordUsername?: string;
  discordUserId?: string;
  hasPoliticalExperience: boolean;
  region?: string;
  state?: string;
  county?: string;
  city?: string;
  zipCode: string;
  email: string;
  phoneNumber?: string;
  name: string;
  nickname?: string;
  helpWith: string;
  submittedAt: number;
  reviewed: boolean;
  reviewedAt?: number;
  reviewedBy?: string;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function SubmissionRow({
  submission,
  roleTitle,
  onView,
  onMarkReviewed,
}: {
  submission: Submission;
  roleTitle: string;
  onView: (s: Submission) => void;
  onMarkReviewed: (id: Id<'helpOutSubmissions'>) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{submission.name}</span>
          {submission.nickname && (
            <span className="text-muted-foreground"> ({submission.nickname})</span>
          )}
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
          {roleTitle}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        {submission.email} · {submission.city}, {submission.state} {submission.zipCode}
      </div>
      <div className="text-sm text-muted-foreground">
        Submitted: {formatDate(submission.submittedAt)}
        {submission.reviewed && <span className="ml-2 text-green-600">✓ Reviewed</span>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onView(submission)}>
          View Details
        </Button>
        {!submission.reviewed && (
          <Button variant="secondary" size="sm" onClick={() => onMarkReviewed(submission._id)}>
            Mark Reviewed
          </Button>
        )}
      </div>
    </div>
  );
}

function SubmissionDetail({
  submission,
  roleTitle,
  onClose,
}: {
  submission: Submission;
  roleTitle: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Application Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Role</h3>
            <p className="text-muted-foreground">{roleTitle}</p>
          </div>
          <div>
            <h3 className="font-medium">Name</h3>
            <p>
              {submission.name}
              {submission.nickname && (
                <span className="text-muted-foreground"> ({submission.nickname})</span>
              )}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-muted-foreground">{submission.email}</p>
          </div>
          {submission.phoneNumber && (
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-muted-foreground">{submission.phoneNumber}</p>
            </div>
          )}
          {submission.twitterHandle && (
            <div>
              <h3 className="font-medium">Twitter</h3>
              <p className="text-muted-foreground">{submission.twitterHandle}</p>
            </div>
          )}
          {submission.discordUsername && (
            <div>
              <h3 className="font-medium">Discord</h3>
              <p className="text-muted-foreground">{submission.discordUsername}</p>
            </div>
          )}
          {submission.discordUserId && (
            <div>
              <h3 className="font-medium">Discord ID</h3>
              <p className="text-muted-foreground">{submission.discordUserId}</p>
            </div>
          )}
          <div>
            <h3 className="font-medium">Location</h3>
            <p className="text-muted-foreground">
              {[submission.city, submission.county, submission.state, submission.zipCode]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
          {submission.region && (
            <div>
              <h3 className="font-medium">Region</h3>
              <p className="text-muted-foreground">{submission.region}</p>
            </div>
          )}
          <div>
            <h3 className="font-medium">Political Experience</h3>
            <p className="text-muted-foreground">
              {submission.hasPoliticalExperience ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <h3 className="font-medium">How They Want to Help</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{submission.helpWith}</p>
          </div>
          <div>
            <h3 className="font-medium">Submitted</h3>
            <p className="text-muted-foreground">{formatDate(submission.submittedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function roleTitleMap(
  forms: { roleSlug: string; title: string }[] | undefined,
): Record<string, string> {
  const m: Record<string, string> = {};
  if (!forms) return m;
  for (const f of forms) {
    m[f.roleSlug] = f.title;
  }
  return m;
}

export function SubmissionsClient() {
  const forms = useQuery(api.helpOut.listHelpOutFormsAdmin);
  const [roleFilter, setRoleFilter] = useState<string | 'all'>('all');
  const [reviewedFilter, setReviewedFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const submissions = useQuery(api.helpOut.listSubmissions, {
    roleSlug: roleFilter === 'all' ? undefined : roleFilter,
    reviewed: reviewedFilter === 'all' ? undefined : reviewedFilter === 'reviewed',
  });
  const markReviewed = useMutation(api.helpOut.markReviewed);

  const titles = roleTitleMap(forms);

  const filteredSubmissions: Submission[] = (submissions ?? []).filter((s) => {
    if (reviewedFilter === 'pending') return !s.reviewed;
    if (reviewedFilter === 'reviewed') return s.reviewed;
    return true;
  });

  const handleMarkReviewed = async (id: Id<'helpOutSubmissions'>) => {
    try {
      await markReviewed({ submissionId: id });
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <p className="text-muted-foreground">View and manage help-out applications</p>
      </div>

      <div className="flex gap-4">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as string | 'all')}
        >
          <option value="all">All Roles</option>
          {(forms ?? []).map((f) => (
            <option key={f.roleSlug} value={f.roleSlug}>
              {f.title}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={reviewedFilter}
          onChange={(e) => setReviewedFilter(e.target.value as 'all' | 'pending' | 'reviewed')}
        >
          <option value="pending">Pending Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredSubmissions.length === 0 && (
          <p className="text-muted-foreground">No submissions found.</p>
        )}
        {filteredSubmissions.map((submission) => (
          <SubmissionRow
            key={submission._id}
            submission={submission}
            roleTitle={titles[submission.roleSlug] ?? submission.roleSlug}
            onView={setSelectedSubmission}
            onMarkReviewed={handleMarkReviewed}
          />
        ))}
      </div>

      {selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          roleTitle={titles[selectedSubmission.roleSlug] ?? selectedSubmission.roleSlug}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
