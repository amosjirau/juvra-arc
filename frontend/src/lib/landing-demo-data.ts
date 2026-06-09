export type DemoLandingJob = {
  amount: string;
  category: string;
  client: string;
  clientRep: string;
  contractId: string;
  deadline: string;
  freelancer: string;
  href: string;
  image: string;
  milestone: string;
  milestoneAmounts: [string, string, string];
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

export const DEMO_LANDING_STATS = {
  escrowedVolume: 12400,
  activeContracts: 7,
  trustScore: "4.8",
} as const;

export const DEMO_LANDING_JOBS: [DemoLandingJob, DemoLandingJob, DemoLandingJob, DemoLandingJob] = [
  {
    amount: "1,200 USDC",
    category: "Design",
    client: "0xA1f2...B7e2",
    clientRep: "Verified",
    contractId: "ESC-DEMO-01",
    deadline: "12 Jun 2026",
    freelancer: "0xD31a...9A41",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format",
    milestone: "UI + wallet flow",
    milestoneAmounts: ["300 USDC", "600 USDC", "300 USDC"],
    progress: 62,
    status: "In progress",
    title: "Build an Arc escrow dashboard",
    trustScore: 4.8,
  },
  {
    amount: "2,500 USDC",
    category: "Security",
    client: "0x44c8...F109",
    clientRep: "Verified Elite",
    contractId: "ESC-DEMO-02",
    deadline: "18 Jun 2026",
    freelancer: "Awaiting match",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
    milestone: "Review scope",
    milestoneAmounts: ["500 USDC", "1,250 USDC", "750 USDC"],
    progress: 24,
    status: "Open",
    title: "Create smart contract audit checklist",
    trustScore: 4.9,
  },
  {
    amount: "3,800 USDC",
    category: "AI / Automation",
    client: "0x9B21...C774",
    clientRep: "Verified",
    contractId: "ESC-DEMO-03",
    deadline: "21 Jun 2026",
    freelancer: "0x81c0...4F2d",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop&auto=format",
    milestone: "Agent review",
    milestoneAmounts: ["950 USDC", "1,900 USDC", "950 USDC"],
    progress: 86,
    status: "Submitted",
    title: "Develop agentic dispute summary module",
    trustScore: 4.7,
  },
  {
    amount: "900 USDC",
    category: "Frontend",
    client: "0x63E5...10bC",
    clientRep: "Verified",
    contractId: "ESC-DEMO-04",
    deadline: "25 Jun 2026",
    freelancer: "Awaiting match",
    href: "/jobs",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop&auto=format",
    milestone: "Figma to Next.js",
    milestoneAmounts: ["225 USDC", "450 USDC", "225 USDC"],
    progress: 18,
    status: "Open",
    title: "Design creator marketplace landing page",
    trustScore: 4.8,
  },
];

export const DEMO_DASHBOARD_ACTIVITY: DemoDashboardActivity[] = [
  {
    action: "Escrow funded",
    amount: "1,200 USDC",
    color: "#34d399",
    contract: "ESC-DEMO-01",
    time: "2h ago",
  },
  {
    action: "Delivery submitted",
    amount: "3,800 USDC",
    color: "#60a5fa",
    contract: "ESC-DEMO-03",
    time: "4h ago",
  },
  {
    action: "Agent reviewed job risk",
    amount: "2,500 USDC",
    color: "#B46CFF",
    contract: "ESC-DEMO-02",
    time: "Today",
  },
  {
    action: "Dispute summary prepared",
    amount: "900 USDC",
    color: "#FF7A18",
    contract: "ESC-DEMO-04",
    time: "Yesterday",
  },
];
