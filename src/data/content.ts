// All copy for the site lives here so the screen version and the
// printable checklist always say the same thing.

export const author = {
  name: 'Namit Sarna',
  course: 'MSc AI for Business Transformation (with Capgemini), Aston University',
  linkedin: 'https://www.linkedin.com/in/namitsarna',
};

export const event = {
  name: 'AI Essentials, Assurance & Business Leadership',
  hosts: 'TÜV SÜD and Aston University',
  venue: 'IET London, Savoy Place',
  date: '4 November 2026',
  dateShort: '4 NOV 2026',
};

export const site = {
  title: 'Before you sign off on AI',
  description:
    'Eight questions every board should ask before approving AI investment. An interactive board checklist, investment gate and scorecard.',
};

export type PillarId = 'value' | 'risk' | 'readiness' | 'accountability';

export interface Question {
  n: string;
  q: string;
  why: string;
  good: string;
}

export interface Pillar {
  id: PillarId;
  name: string;
  tagline: string;
  questions: [Question, Question];
}

export const pillars: Pillar[] = [
  {
    id: 'value',
    name: 'Value',
    tagline: 'Is it worth doing?',
    questions: [
      {
        n: '01',
        q: 'What problem, and what metric?',
        why: 'AI without a business case turns into a science project that never ships.',
        good: 'One named problem, a current baseline, a target, and a date to check it.',
      },
      {
        n: '02',
        q: 'What does doing nothing cost?',
        why: 'Boards should compare AI against the status quo, not against perfection.',
        good: 'The cost of delay and the cost of failure are both estimated, in money and in risk.',
      },
    ],
  },
  {
    id: 'risk',
    name: 'Risk',
    tagline: 'What could go wrong?',
    questions: [
      {
        n: '03',
        q: 'Is it secure by design?',
        why: 'AI widens the attack surface: prompt injection, data leakage and poisoned inputs.',
        good: 'A threat model before build, adversarial testing before launch, and a security owner who signs off.',
      },
      {
        n: '04',
        q: 'How much harm can we tolerate?',
        why: 'Without an agreed risk appetite, every incident becomes a crisis.',
        good: 'A written AI risk appetite, with the EU AI Act risk tier checked wherever it applies.',
      },
    ],
  },
  {
    id: 'readiness',
    name: 'Readiness',
    tagline: 'Can we run it safely?',
    questions: [
      {
        n: '05',
        q: 'Is the data fit, owned and lawful?',
        why: 'A model can only be as good as its data, and UK GDPR still applies.',
        good: 'A named data owner, a recorded lawful basis, and quality and bias checks run.',
      },
      {
        n: '06',
        q: 'Can we monitor and roll back?',
        why: 'Models drift quietly after launch.',
        good: 'Live performance monitoring, alert thresholds, and a tested fallback to the manual process.',
      },
    ],
  },
  {
    id: 'accountability',
    name: 'Accountability',
    tagline: 'Who answers for it?',
    questions: [
      {
        n: '07',
        q: 'Who owns it when it fails?',
        why: '“The algorithm did it” is not an answer a regulator or customer accepts.',
        good: 'One accountable executive, plus clear ownership for building, running and reviewing it.',
      },
      {
        n: '08',
        q: 'Is human override real?',
        why: 'A reviewer with no context, no time or no authority is a rubber stamp.',
        good: 'Reviewers can see why, have time to act, can say no, and every override is logged.',
      },
    ],
  },
];

export interface Stage {
  id: string;
  name: string;
  summary: string;
  checks: string[];
}

export const stages: Stage[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    summary: 'Approve a small, time-boxed pilot.',
    checks: [
      'Use case and success metric agreed',
      'Risk tier and threat model done',
      'Data owner named',
      'Budget capped, with an end date',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    summary: 'Release funding to roll out.',
    checks: [
      'Pilot hit its metrics',
      'Monitoring and alerts live',
      'Human override tested in practice',
      'Security review passed',
    ],
  },
  {
    id: 'run',
    name: 'Run',
    summary: 'Keep it earning its place.',
    checks: [
      'Scheduled audit cycle',
      'Incident log reviewed by a board committee',
      'Drift and fairness re-tested',
      'Clear criteria for switching it off',
    ],
  },
];

export interface ScoreItem {
  id: string;
  label: string;
  text: string;
  // Questions from section 2 to start with when this item is missing.
  startWith: string[];
}

export const scoreItems: ScoreItem[] = [
  { id: 'policy', label: 'Policy', text: 'AI policy approved at board level', startWith: ['04', '07'] },
  { id: 'inventory', label: 'Inventory', text: 'A list of every AI tool in use, including unapproved ones', startWith: ['03', '05'] },
  { id: 'owner', label: 'Owner', text: 'One named accountable executive', startWith: ['07', '08'] },
  { id: 'appetite', label: 'Appetite', text: 'A written AI risk appetite, agreed', startWith: ['04', '02'] },
  { id: 'assurance', label: 'Assurance', text: 'Independent assurance planned, such as ISO/IEC 42001', startWith: ['03', '06'] },
];

export const verdicts: { title: string; line: string }[] = [
  { title: 'Not ready to sign off', line: 'There is nothing yet to stand behind. Start with the questions below.' },
  { title: 'Not ready to sign off', line: 'One foundation is in place. The board would be signing off on trust.' },
  { title: 'Not yet', line: 'The gaps are bigger than the cover. Close them before you approve spend.' },
  { title: 'Pilot only', line: 'Approve a capped, time-boxed pilot, with conditions on the missing pieces.' },
  { title: 'Nearly ready', line: 'One gap left. Close it and you can sign off with a clear conscience.' },
  { title: 'Ready to sign off, with confidence', line: 'All five foundations are in place. This board can say yes, and mean it.' },
];

export interface Framework {
  tag: string;
  name: string;
  line: string;
  href: string;
  motif: 'iso' | 'nist' | 'eu' | 'uk';
}

export const frameworks: Framework[] = [
  {
    tag: 'Standard',
    name: 'ISO/IEC 42001',
    line: 'The certifiable management system standard for AI. Proof you run AI with discipline.',
    href: 'https://www.iso.org/standard/42001',
    motif: 'iso',
  },
  {
    tag: 'Framework',
    name: 'NIST AI RMF',
    line: 'Four functions for AI risk: Govern, Map, Measure, Manage.',
    href: 'https://www.nist.gov/itl/ai-risk-management-framework',
    motif: 'nist',
  },
  {
    tag: 'Regulation',
    name: 'EU AI Act',
    line: 'Risk tiers set the rules. Applies to UK firms selling or deploying AI into the EU.',
    href: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    motif: 'eu',
  },
  {
    tag: 'Principles',
    name: 'UK AI principles',
    line: 'Safety, transparency, fairness, accountability and contestability, applied by existing regulators.',
    href: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach',
    motif: 'uk',
  },
];

export const allQuestions = pillars.flatMap((p) => p.questions.map((q) => ({ ...q, pillar: p.id, pillarName: p.name })));
