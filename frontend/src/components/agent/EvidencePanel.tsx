"use client";

import { LinkIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createEvidenceItem,
  deleteEvidenceItem,
  loadJobEvidence,
  upsertEvidenceItems,
  type EvidenceItem,
} from "@/lib/agent/evidence";
import { shortAddress } from "@/lib/format";

type EvidenceForm = {
  deliveryEvidenceUrl: string;
  repoUrl: string;
  screenshotUrl: string;
  extraEvidenceNote: string;
  clientComplaint: string;
  freelancerResponse: string;
  revisionNote: string;
};

const emptyForm: EvidenceForm = {
  clientComplaint: "",
  deliveryEvidenceUrl: "",
  extraEvidenceNote: "",
  freelancerResponse: "",
  repoUrl: "",
  revisionNote: "",
  screenshotUrl: "",
};

export function EvidencePanel({
  jobId,
  onEvidenceChange,
  submittedBy,
}: {
  jobId: string;
  onEvidenceChange?: (items: EvidenceItem[]) => void;
  submittedBy?: string;
}) {
  const [form, setForm] = useState<EvidenceForm>(emptyForm);
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = loadJobEvidence(jobId);
    const savedItems = saved?.items ?? [];

    setItems(savedItems);
    setUpdatedAt(saved?.updatedAt ?? null);
    onEvidenceChange?.(savedItems);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [jobId, onEvidenceChange]);

  function updateField(field: keyof EvidenceForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addEvidence() {
    const created: EvidenceItem[] = [];
    const author = submittedBy?.trim() || undefined;

    if (form.deliveryEvidenceUrl.trim() || form.extraEvidenceNote.trim()) {
      created.push(
        createEvidenceItem({
          evidenceUrl: clean(form.deliveryEvidenceUrl),
          note: clean(form.extraEvidenceNote),
          submittedBy: author,
          type: "delivery",
        })
      );
    }

    if (form.repoUrl.trim()) {
      created.push(
        createEvidenceItem({
          evidenceUrl: clean(form.repoUrl),
          note: "GitHub/repo URL",
          submittedBy: author,
          type: "delivery",
        })
      );
    }

    if (form.screenshotUrl.trim()) {
      created.push(
        createEvidenceItem({
          evidenceUrl: clean(form.screenshotUrl),
          note: "Screenshot URL",
          submittedBy: author,
          type: "delivery",
        })
      );
    }

    if (form.clientComplaint.trim()) {
      created.push(
        createEvidenceItem({
          note: `Client complaint: ${form.clientComplaint.trim()}`,
          submittedBy: author,
          type: "dispute",
        })
      );
    }

    if (form.freelancerResponse.trim()) {
      created.push(
        createEvidenceItem({
          note: `Freelancer response: ${form.freelancerResponse.trim()}`,
          submittedBy: author,
          type: "dispute",
        })
      );
    }

    if (form.revisionNote.trim()) {
      created.push(
        createEvidenceItem({
          note: form.revisionNote.trim(),
          submittedBy: author,
          type: "revision",
        })
      );
    }

    const saved = upsertEvidenceItems(jobId, created);

    if (!saved) {
      return;
    }

    setItems(saved.items);
    setUpdatedAt(saved.updatedAt);
    setForm(emptyForm);
    onEvidenceChange?.(saved.items);
  }

  function removeEvidence(evidenceId: string) {
    const saved = deleteEvidenceItem(jobId, evidenceId);
    const nextItems = saved?.items ?? [];

    setItems(nextItems);
    setUpdatedAt(saved?.updatedAt ?? null);
    onEvidenceChange?.(nextItems);
  }

  const hasFormValue = Object.values(form).some((value) => value.trim());

  return (
    <Card className="premium-card-hover rounded-[2rem] border-white/10 bg-white/[0.045]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <LinkIcon className="size-5 text-cyan-100" />
          Evidence
        </CardTitle>
        {updatedAt && (
          <p className="text-xs text-zinc-500">
            Last updated {formatEvidenceDate(updatedAt)}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            onChange={(event) =>
              updateField("deliveryEvidenceUrl", event.target.value)
            }
            placeholder="Delivery evidence URL"
            value={form.deliveryEvidenceUrl}
          />
          <Input
            onChange={(event) => updateField("repoUrl", event.target.value)}
            placeholder="GitHub/repo URL"
            value={form.repoUrl}
          />
          <Input
            onChange={(event) =>
              updateField("screenshotUrl", event.target.value)
            }
            placeholder="Screenshot URL"
            value={form.screenshotUrl}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Textarea
            className="min-h-[78px]"
            onChange={(event) =>
              updateField("extraEvidenceNote", event.target.value)
            }
            placeholder="Extra evidence note"
            value={form.extraEvidenceNote}
          />
          <Textarea
            className="min-h-[78px]"
            onChange={(event) =>
              updateField("revisionNote", event.target.value)
            }
            placeholder="Revision note"
            value={form.revisionNote}
          />
          <Textarea
            className="min-h-[78px]"
            onChange={(event) =>
              updateField("clientComplaint", event.target.value)
            }
            placeholder="Client complaint"
            value={form.clientComplaint}
          />
          <Textarea
            className="min-h-[78px]"
            onChange={(event) =>
              updateField("freelancerResponse", event.target.value)
            }
            placeholder="Freelancer response"
            value={form.freelancerResponse}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Submitted by{" "}
            <span className="font-mono text-zinc-300">
              {submittedBy ? shortAddress(submittedBy) : "Not connected"}
            </span>
          </p>
          <Button
            className="w-full sm:w-fit"
            disabled={!hasFormValue}
            onClick={addEvidence}
            type="button"
          >
            <Plus className="size-4" />
            Add evidence
          </Button>
        </div>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-500">
              No local evidence has been added for this job.
            </p>
          ) : (
            items.map((item) => (
              <div
                className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10"
                key={item.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-200/15 bg-cyan-200/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-cyan-100">
                        {item.type}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatEvidenceDate(item.createdAt)}
                      </span>
                    </div>
                    {item.evidenceUrl && (
                      <p className="break-all font-mono text-xs text-emerald-100">
                        {item.evidenceUrl}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-sm leading-5 text-zinc-300">
                        {item.note}
                      </p>
                    )}
                    {item.submittedBy && (
                      <p className="text-xs text-zinc-500">
                        Submitted by{" "}
                        <span className="font-mono text-zinc-300">
                          {shortAddress(item.submittedBy)}
                        </span>
                      </p>
                    )}
                  </div>
                  <Button
                    className="h-8 px-2 text-rose-100 hover:text-rose-50"
                    onClick={() => removeEvidence(item.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function clean(value: string) {
  return value.trim() || undefined;
}

function formatEvidenceDate(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}
