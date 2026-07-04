"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Lock,
  Scale,
  ShieldCheck,
  SquarePen,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { EditorialHeader, EditorialShell, Reveal } from "@/components/shell/EditorialShell";

const lifecycle = [
  { meta: "Step 1", title: "Connect your wallet", description: "Sign in with your Web3 wallet on Arc Testnet. No account, no password — your wallet is your identity and your signature." },
  { meta: "Step 2", title: "Post a job and fund escrow", description: "The client defines the work, deadline, and budget, then locks the funds into an on-chain escrow contract in a single transaction." },
  { meta: "Step 3", title: "A freelancer is selected", description: "Freelancers browse open jobs and apply. The client picks one, which assigns the job on-chain. The work is now under contract." },
  { meta: "Step 4", title: "Deliver the work", description: "The freelancer submits the finished deliverable as a verifiable link. The job moves into review while the funds stay safely in escrow." },
  { meta: "Step 5", title: "Approve and release payment", description: "When the client approves the delivery, the escrow releases the funds to the freelancer. Wallet-confirmed and settled on Arc." },
  { meta: "If needed", title: "Resolve any issues", description: "If the two sides disagree, either can raise a dispute. A neutral arbitrator reviews the evidence and resolves it — a refund to the client or a release to the freelancer." },
];

const clientFlow = ["Post and fund the job", "Review applicants and select one", "Review the delivered work", "Approve to release, or raise a dispute"];
const freelancerFlow = ["Browse escrow-backed jobs", "Apply to the ones that fit", "Deliver the finished work", "Get paid the moment it is approved"];

const trustPoints = [
  { icon: Lock, title: "Funds are locked, not held by us", body: "Escrow is an on-chain smart contract, not a company wallet. Juvra never takes custody of your money." },
  { icon: ShieldCheck, title: "Wallet-confirmed settlement", body: "Every money movement — funding, release, refund — requires a signature from the rightful party in their own wallet." },
  { icon: Scale, title: "Neutral dispute resolution", body: "If something goes wrong, a designated arbitrator can resolve the dispute. AI assists the review but never moves funds." },
];

const faqs = [
  { q: "Do I need crypto experience?", a: "No. If you can connect a wallet, you can use Juvra. The escrow handles the hard part for you." },
  { q: "What network and token does it use?", a: "Juvra runs on Arc Testnet and settles work in USDC." },
  { q: "Who holds my money?", a: "No one. Funds sit in the escrow smart contract until the work is approved or a dispute is resolved." },
  { q: "What if the work is never delivered?", a: "You can raise a dispute. A neutral arbitrator reviews the evidence and can refund the client." },
  { q: "Does the AI move my funds?", a: "Never. The Juvra agent is advisory only. Every action is confirmed by a human in their own wallet." },
];

function JourneyCard({
  body,
  icon: Icon,
  steps,
  title,
}: {
  body: string;
  icon: typeof BriefcaseBusiness;
  steps: string[];
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-6">
      <span className="flex size-11 items-center justify-center rounded-xl border border-line text-ink">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 font-serif text-xl text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
      <ol className="mt-5 space-y-3">
        {steps.map((step, i) => (
          <li className="flex items-start gap-3 text-sm text-ink" key={step}>
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[11px] text-ink-soft">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <EditorialShell>
      <EditorialHeader
        description="Juvra makes freelance payment safe by holding funds in on-chain escrow until the work is approved. Here is the whole flow, in plain language."
        eyebrow="The escrow workflow, explained"
        title="How it works"
      />

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <JourneyCard
            body="Hire with confidence. Your money only moves when you approve the work."
            icon={BriefcaseBusiness}
            steps={clientFlow}
            title="For clients"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <JourneyCard
            body="Take work knowing the money is already funded before you start."
            icon={UserCheck}
            steps={freelancerFlow}
            title="For freelancers"
          />
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-serif text-3xl tracking-[-0.01em] text-ink">The escrow lifecycle</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink-soft">
            Every job moves through the same transparent, on-chain path from posting to payment.
          </p>
        </Reveal>
        <div className="mt-10 max-w-3xl">
          {lifecycle.map((step, i) => (
            <Reveal delay={i * 0.05} key={step.title}>
              <div className="flex gap-6 border-t border-line py-6">
                <div className="w-20 shrink-0">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft">
                    {step.meta}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">{step.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-serif text-3xl tracking-[-0.01em] text-ink">Why it&apos;s safe</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {trustPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <Reveal delay={i * 0.06} key={point.title}>
                <div className="h-full rounded-2xl border border-line bg-paper-raised p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-line text-ink">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg text-ink">{point.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{point.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-serif text-3xl tracking-[-0.01em] text-ink">Common questions</h2>
        </Reveal>
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-raised">
          {faqs.map((faq) => (
            <details className="group border-t border-line px-5 py-4 first:border-t-0" key={faq.q}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink marker:hidden">
                {faq.q}
                <span className="text-ink-soft transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-paper-raised p-10 text-center sm:p-14">
          <h2 className="max-w-xl font-serif text-3xl tracking-[-0.01em] text-ink sm:text-4xl">
            Ready to work with escrow protection?
          </h2>
          <p className="max-w-md text-base leading-7 text-ink-soft">
            Browse open, escrow-backed jobs on Arc, or post your own and fund it in one transaction.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
              href="/jobs"
            >
              <BriefcaseBusiness className="size-4" />
              Explore jobs
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition-colors duration-300 hover:bg-ink/[0.04]"
              href="/post"
            >
              <SquarePen className="size-4" />
              Post a job
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </EditorialShell>
  );
}
