export type DemoStats = {
  activeContracts: number;
  averageCompletionTime: string;
  escrowedVolume: number;
  pendingReleases: number;
  trustScore: string;
};

export type DemoJob = {
  amount: string;
  category: string;
  clientRep: string;
  deadline: string;
  href: string;
  image: string;
  milestone: string;
  progress: number;
  status: string;
  title: string;
  trustScore: number;
};

export type DemoDashboardActivity = {
  action: string;
  amount: string;
  color: string;
  contract: string;
  time: string;
};

export type DemoDashboard = {
  activity: DemoDashboardActivity[];
  chart: Array<{ month: string; volume: number }>;
  recommendation: string;
};

export type DemoAgent = {
  contract: string;
  confidence: string;
  recommendation: string;
  reason: string;
  risk: string;
  status: string;
};

export type DemoEscrowFlow = {
  clientWallet: string;
  freelancerWallet: string;
  lockedAmount: string;
  milestones: [
    { label: "Start"; amount: string; status: "done" },
    { label: "Build"; amount: string; status: "active" },
    { label: "Review"; amount: string; status: "pending" },
  ];
  status: string;
};

export const DEMO_STATS: DemoStats = {
  activeContracts: 7,
  averageCompletionTime: "2.4 days",
  escrowedVolume: 12400,
  pendingReleases: 3,
  trustScore: "4.8",
};

export const DEMO_JOBS: [DemoJob, DemoJob, DemoJob, DemoJob] = [
  {
    amount: "1,200 USDC",
    category: "Design",
    clientRep: "Verified",
    deadline: "12 Jun 2026",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format",
    milestone: "UI + wallet flow",
    progress: 62,
    status: "In progress",
    title: "Build Arc Escrow Dashboard",
    trustScore: 4.8,
  },
  {
    amount: "2,500 USDC",
    category: "Security",
    clientRep: "Verified Elite",
    deadline: "18 Jun 2026",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
    milestone: "Review scope",
    progress: 24,
    status: "Open",
    title: "Create Smart Contract Audit Checklist",
    trustScore: 4.9,
  },
  {
    amount: "3,800 USDC",
    category: "AI / Automation",
    clientRep: "Verified",
    deadline: "21 Jun 2026",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop&auto=format",
    milestone: "Agent review",
    progress: 86,
    status: "Submitted",
    title: "Develop Agentic Dispute Summary Module",
    trustScore: 4.7,
  },
  {
    amount: "900 USDC",
    category: "Frontend",
    clientRep: "Verified",
    deadline: "25 Jun 2026",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop&auto=format",
    milestone: "Figma to Next.js",
    progress: 18,
    status: "Open",
    title: "Design Creator Marketplace Landing Page",
    trustScore: 4.8,
  },
];

export const DEMO_DASHBOARD: DemoDashboard = {
  activity: [
    {
      action: "Escrow funded",
      amount: "1,200 USDC",
      color: "#34d399",
      contract: "ESC-1048",
      time: "2h ago",
    },
    {
      action: "Milestone submitted",
      amount: "500 USDC",
      color: "#60a5fa",
      contract: "ESC-1048",
      time: "5h ago",
    },
    {
      action: "Agent reviewed dispute",
      amount: "3,800 USDC",
      color: "#B46CFF",
      contract: "ESC-1046",
      time: "Yesterday",
    },
    {
      action: "Funds released",
      amount: "500 USDC",
      color: "#FF7A18",
      contract: "ESC-1048",
      time: "Yesterday",
    },
  ],
  chart: [
    { month: "Mar", volume: 3200 },
    { month: "Apr", volume: 7600 },
    { month: "May", volume: 9800 },
    { month: "Jun", volume: DEMO_STATS.escrowedVolume },
  ],
  recommendation:
    "Three submitted milestones are ready for human review. Agent analysis can summarize evidence, but fund movement still requires wallet confirmation.",
};

export const DEMO_AGENT: DemoAgent = {
  confidence: "94%",
  contract: "ESC-1048",
  recommendation: "Release 500 USDC milestone",
  reason: "Deliverables match approved scope.",
  risk: "Low",
  status: "Verified",
};

export const DEMO_ESCROW_FLOW: DemoEscrowFlow = {
  clientWallet: "0xA91F...8B21",
  freelancerWallet: "0xF34D...1CE9",
  lockedAmount: "1,200 USDC",
  milestones: [
    { label: "Start", amount: "400 USDC", status: "done" },
    { label: "Build", amount: "500 USDC", status: "active" },
    { label: "Review", amount: "300 USDC", status: "pending" },
  ],
  status: "Active",
};
