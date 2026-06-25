"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ListChecks,
  Lock,
  Scale,
  Send,
  ShieldCheck,
  SquarePen,
  UserCheck,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { CTAButton } from "@/components/ui/cta-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import {
  HowItWorksTimeline,
  type TimelineStep,
} from "@/components/ui/how-it-works-timeline";

const lifecycle: TimelineStep[] = [
  {
    title: "Connect your wallet",
    description:
      "Sign in with your Web3 wallet on Arc Testnet. No account and no password - your wallet is your identity and your signature.",
    icon: Wallet,
    tone: "sky",
    meta: "Step 1",
  },
  {
    title: "Post a job and fund escrow",
    description:
      "The client defines the work, deadline, and budget, then locks the funds into an on-chain escrow contract in a single transaction.",
    icon: SquarePen,
    tone: "emerald",
    meta: "Step 2",
  },
  {
    title: "A freelancer is selected",
    description:
      "Freelancers browse open jobs and apply. The client picks one, which assigns the job on-chain. The work is now under contract.",
    icon: UserCheck,
    tone: "sky",
    meta: "Step 3",
  },
  {
    title: "Deliver the work",
    description:
      "The freelancer submits the finished deliverable as a verifiable link. The job moves into review while the funds stay safely in escrow.",
    icon: Send,
    tone: "amber",
    meta: "Step 4",
  },
  {
    title: "Approve and release payment",
    description:
      "When the client approves the delivery, the escrow releases the funds to the freelancer. Wallet-confirmed and settled on Arc.",
    icon: CheckCircle2,
    tone: "emerald",
    meta: "Step 5",
  },
  {
    title: "Resolve any issues",
    description:
      "If the two sides disagree, either can raise a dispute. A neutral arbitrator reviews the evidence and resolves it - a refund to the client or a release to the freelancer.",
    icon: Scale,
    tone: "rose",
    meta: "If needed",
  },
];

const clientFlow = ["Post and fund the job", "Review applicants and select one", "Review the delivered work", "Approve to release, or raise a dispute"];
const freelancerFlow = ["Browse escrow-backed jobs", "Apply to the ones that fit", "Deliver the finished work", "Get paid the moment it is approved"];

const trustPoints = [
  {
    icon: Lock,
    title: "Funds are locked, not held by us",
    body: "Escrow is an on-chain smart contract, not a company wallet. Juvra never takes custody of your money.",
  },
  {
    icon: ShieldCheck,
    title: "Wallet-confirmed settlement",
    body: "Every money movement - funding, release, refund - requires a signature from the rightful party in their own wallet.",
  },
  {
    icon: Scale,
    title: "Neutral dispute resolution",
    body: "If something goes wrong, a designated arbitrator can resolve the dispute. AI assists the review but never moves funds.",
  },
];

const faqs = [
  {
    q: "Do I need crypto experience?",
    a: "No. If you can connect a wallet, you can use Juvra. The escrow handles the hard part for you.",
  },
  {
    q: "What network and token does it use?",
    a: "Juvra runs on Arc Testnet and settles work in USDC.",
  },
  {
    q: "Who holds my money?",
    a: "No one. Funds sit in the escrow smart contract until the work is approved or a dispute is resolved.",
  },
  {
    q: "What if the work is never delivered?",
    a: "You can raise a dispute. A neutral arbitrator reviews the evidence and can refund the client.",
  },
  {
    q: "Does the AI move my funds?",
    a: "Never. The Juvra agent is advisory only. Every action is confirmed by a human in their own wallet.",
  },
];

export default function HowItWorksPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="The escrow workflow, explained"
        eyebrowIcon={ListChecks}
        title="How It Works"
        description="Juvra makes freelance payment safe by holding funds in on-chain escrow until the work is approved. Here is the whole flow, in plain language."
      />

      {/* Two journeys */}
      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        <GlassCard interactive className="p-6">
          <span className="flex size-11 items-center justify-center rounded-xl border border-status-open/25 bg-status-open/10 text-status-open">
            <BriefcaseBusiness className="size-5" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-white">For clients</h2>
          <p className="mt-1 text-sm text-zinc-400">Hire with confidence. Your money only moves when you approve the work.</p>
          <ol className="mt-5 space-y-3">
            {clientFlow.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-mono text-[11px] text-[#34d399]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </GlassCard>

        <GlassCard interactive className="p-6">
          <span className="flex size-11 items-center justify-center rounded-xl border border-status-assigned/25 bg-status-assigned/10 text-status-assigned">
            <UserCheck className="size-5" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-white">For freelancers</h2>
          <p className="mt-1 text-sm text-zinc-400">Take work knowing the money is already funded before you start.</p>
          <ol className="mt-5 space-y-3">
            {freelancerFlow.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-mono text-[11px] text-[#38bdf8]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </GlassCard>
      </section>

      {/* Escrow lifecycle timeline */}
      <section className="mt-16">
        <h2 className="text-display-2 font-semibold text-white">The escrow lifecycle</h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-zinc-400">
          Every job moves through the same transparent, on-chain path from posting to payment.
        </p>
        <div className="mt-8 max-w-3xl">
          <HowItWorksTimeline steps={lifecycle} />
        </div>
      </section>

      {/* Trust and safety */}
      <section className="mt-16">
        <h2 className="text-display-2 font-semibold text-white">Why it is safe</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <GlassCard key={point.title} interactive className="p-6">
                <span className="flex size-11 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{point.body}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-display-2 font-semibold text-white">Common questions</h2>
        <div className="mt-8 divide-y divide-white/[0.08] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-5 py-4 open:bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white marker:hidden">
                {faq.q}
                <span className="text-zinc-500 transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <GlassCard glow className="flex flex-col items-center gap-5 p-10 text-center sm:p-14">
          <h2 className="text-display-2 font-semibold text-balance heading-gradient">Ready to work with escrow protection?</h2>
          <p className="max-w-md text-base leading-7 text-zinc-400">
            Browse open, escrow-backed jobs on Arc, or post your own and fund it in one transaction.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <CTAButton asChild size="lg">
              <Link href="/jobs">
                <BriefcaseBusiness className="size-4" />
                Explore Jobs
              </Link>
            </CTAButton>
            <GlowButton asChild size="lg">
              <Link href="/post">
                <SquarePen className="size-4" />
                Post a Job
                <ArrowRight className="size-4" />
              </Link>
            </GlowButton>
          </div>
        </GlassCard>
      </section>
    </AppShell>
  );
}
