// All copy for the site lives here so the screen version and the
// printable checklist always say the same thing.

export const author = {
  name: 'Namit Sarna',
  course: 'MSc AI for Business Transformation, Aston University',
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
  hook: 'The AI you approved may not be the AI that’s running.',
  support: 'Eight questions for boards, and why sign-off is a licence, not a verdict.',
  idea: 'Sign-off is a licence, not a verdict.',
  // Used wherever the slogan needs its context spelled out.
  licenceNote: 'Here, “licence” means conditional organisational approval, not a legal licence, certification or accreditation.',
  // Search and social previews: no slogan, since it would appear without its context.
  description:
    'The AI you approved may not be the AI that’s running. Eight questions for boards before they sign off on AI, and after.',
};

// The drift story: what changes after approval.
export const drift = [
  { key: 'approved', label: 'Day one', title: 'The board approves a model.', body: 'It was tested, it passed, and the minutes say yes.' },
  { key: 'model', label: 'Change 1', title: 'The vendor updates the model.', body: 'Hosted models can change after approval, often without a meeting.' },
  { key: 'data', label: 'Change 2', title: 'It is fed new data.', body: 'New sources, new customers, new patterns it never saw in testing.' },
  { key: 'permissions', label: 'Change 3', title: 'It is given new permissions.', body: 'It can now act, not just suggest.' },
  { key: 'use', label: 'Change 4', title: 'It is used in new ways.', body: 'A team finds a new job for it. Nobody asks the board.' },
];

export type PillarId = 'value' | 'risk' | 'readiness' | 'accountability';
export type Art = 'switch' | 'scales' | 'inject' | 'headline' | 'update' | 'manual' | 'clock' | 'stack';

export interface Question {
  n: string;
  q: string;
  why: string;
  good: string;
  art: Art;
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
    tagline: 'Does it change a decision that matters?',
    questions: [
      {
        n: '01',
        q: 'What would we lose if we switched it off tomorrow?',
        why: 'If nobody can answer, the AI isn’t changing a decision that matters yet.',
        good: 'A named outcome with a baseline and target, and a clear answer to what breaks without it.',
        art: 'switch',
      },
      {
        n: '02',
        q: 'What does acting gain, and what does waiting cost?',
        why: 'Boards should weigh AI against the status quo, not against perfection.',
        good: 'The value of acting and the cost of delay are both estimated, in money and in risk.',
        art: 'scales',
      },
    ],
  },
  {
    id: 'risk',
    name: 'Risk',
    tagline: 'Where are the red lines?',
    questions: [
      {
        n: '03',
        q: 'What happens when someone tries to make it misbehave?',
        why: 'AI can be manipulated through its inputs: prompt injection, data leakage and poisoned data.',
        good: 'A threat model before build, adversarial testing before launch, and a security owner who signs off.',
        art: 'inject',
      },
      {
        n: '04',
        q: 'Which failure would we never want to explain in public?',
        why: 'Naming the unacceptable failure is how a board sets real limits.',
        good: 'A written risk appetite with named red lines, set by the board, with the EU AI Act risk tier checked where it applies.',
        art: 'headline',
      },
    ],
  },
  {
    id: 'readiness',
    name: 'Readiness',
    tagline: 'Is it still the thing we approved?',
    questions: [
      {
        n: '05',
        q: 'If the vendor updated the model last night, would we know?',
        why: 'Hosted models can change after approval. The system you tested may not be the one running.',
        good: 'Version pinning or change notices in vendor contracts. Re-testing triggered by material model changes, with routine updates handled through normal change control.',
        art: 'update',
      },
      {
        n: '06',
        q: 'How fast can we go back to doing it by hand?',
        why: 'Rollback only works if the manual process still exists and people still know it.',
        good: 'A tested fallback procedure, a named person with authority to invoke it, and a recorded drill or recovery test. A manual fallback only counts if it can actually operate in practice.',
        art: 'manual',
      },
    ],
  },
  {
    id: 'accountability',
    name: 'Accountability',
    tagline: 'Can someone actually act?',
    questions: [
      {
        n: '07',
        q: 'Who can switch it off at 3am, and do they know it?',
        why: 'Accountability on paper fails if the person can’t act when it matters.',
        good: 'A named owner with the authority and the means to stop it, tested in a drill.',
        art: 'clock',
      },
      {
        n: '08',
        q: 'Approving 200 AI outputs a day: is anyone still deciding?',
        why: 'At high volume, human review drifts into rubber-stamping (automation bias).',
        good: 'Review load sized so people can actually judge, with overrides logged and sampled.',
        art: 'stack',
      },
    ],
  },
];

export const pilotTrap = {
  figure: '30%+',
  tag: 'Predicted',
  claim:
    'In July 2024, Gartner predicted that at least 30% of generative AI projects would be abandoned after proof of concept by the end of 2025, citing poor data quality, inadequate risk controls, escalating costs or unclear business value.',
  source: 'Gartner press release, 29 July 2024',
  caveat: 'A prediction about the end of 2025, not a measured abandonment rate.',
  line: 'Getting AI live was the 2025 problem. Keeping it approved is the next one.',
  reasons: ['Poor data quality', 'Inadequate risk controls', 'Escalating costs', 'Unclear business value'],
};

export interface Stage {
  id: string;
  name: string;
  decision: string;
  checks: string[];
}

export const gateRule = 'If a critical control fails, do not progress.';
export const gateNote = 'An illustrative way to think about staged approval, not a validated method. Which controls are critical depends on each system’s risk assessment.';
export const loopLabel = 'Material change: reassess';
export const changeKinds = ['model', 'data', 'permissions', 'use'];

export const stages: Stage[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    decision: 'Approve test',
    checks: ['Use case and baseline', 'Risk assessment and data owner', 'Measurable success criteria'],
  },
  {
    id: 'scale',
    name: 'Scale',
    decision: 'Approve rollout',
    checks: ['Performance thresholds met', 'Failure scenarios tested', 'Monitoring and override verified'],
  },
  {
    id: 'run',
    name: 'Run',
    decision: 'Approve operation',
    checks: ['Named owner and audit trail', 'Drift and incident monitoring', 'Reassessed after any material change'],
  },
];

export const scoreInstruction = [
  'Score 1 only where there is evidence the control is operating; otherwise score 0.',
  'Mark a control as critical only where this system’s risk assessment requires it. A critical control without evidence blocks approval, whatever the total.',
  'The score counts controls with evidence of operation. It is not a safety, maturity or compliance rating and does not replace a system-specific risk assessment. Verdicts are prompts for discussion, not approval recommendations, whatever the score.',
];

export interface ScoreItem {
  id: string;
  label: string;
  text: string;
  // A short example of the evidence that would justify a tick.
  evidence: string;
  // Questions from the 8 to start with when this control has no evidence.
  startWith: string[];
}

export const scoreItems: ScoreItem[] = [
  { id: 'policy', label: 'Policy', text: 'Board-approved AI governance policy', evidence: 'For example: the approved policy, the board minute approving it and a review date.', startWith: ['04', '01'] },
  { id: 'inventory', label: 'Inventory', text: 'All AI identified, including shadow AI and agents', evidence: 'For example: a current register of AI systems, vendors and agents, each with an owner.', startWith: ['05', '03'] },
  { id: 'owner', label: 'Owner', text: 'One accountable executive', evidence: 'For example: documented ownership, including the authority to pause the system.', startWith: ['07', '06'] },
  { id: 'appetite', label: 'Appetite', text: 'Risk appetite and tolerances defined', evidence: 'For example: approved tolerances and the thresholds that trigger escalation.', startWith: ['04', '02'] },
  { id: 'assurance', label: 'Assurance', text: 'Continuous assurance, not a one-off check', evidence: 'For example: monitoring records against thresholds, drift checks, incident records and a tested fallback procedure.', startWith: ['05', '08'] },
];

export const verdicts: { title: string; line: string }[] = [
  { title: 'No evidence. No sign-off.', line: 'No control has evidence that it is operating. Start with the questions below.' },
  { title: 'Not ready to sign off', line: 'One control has evidence. The rest are still promises.' },
  { title: 'Not yet', line: 'More gaps than evidence. Worth discussing before any significant spend.' },
  { title: 'Gaps remain', line: 'Some evidence, some gaps. A board might discuss whether a contained pilot, with conditions on what is missing, is reasonable.' },
  { title: 'One gap left', line: 'One control lacks evidence. Worth finding before any wider rollout is discussed.' },
  { title: 'All five evidenced', line: 'Each control has evidence of operation. That supports a sign-off discussion but is not an approval in itself. Agree which material changes would trigger a fresh review.' },
];
export const blockedVerdict = {
  title: 'Blocked',
  line: 'A control you marked critical has no evidence. In this exercise, that blocks approval whatever the total.',
};

export interface Framework {
  name: string;
  tag: string;
  line: string;
  href: string;
  motif: 'iso' | 'nist' | 'eu' | 'uk';
}

export const frameworks: Framework[] = [
  { name: 'ISO/IEC 42001', tag: 'International standard', line: 'Standard for an AI management system. Organisations can be certified against it.', href: 'https://www.iso.org/standard/42001', motif: 'iso' },
  { name: 'NIST AI RMF', tag: 'Voluntary framework', line: 'Voluntary US framework built around four functions: Govern, Map, Measure, Manage.', href: 'https://www.nist.gov/itl/ai-risk-management-framework', motif: 'nist' },
  { name: 'EU AI Act', tag: 'Law', line: 'Binding EU regulation (2024/1689) with risk-based obligations that apply in phases.', href: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', motif: 'eu' },
  { name: 'UK AI principles', tag: 'Government principles', line: 'Five non-statutory principles, applied by existing regulators within their remits.', href: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach', motif: 'uk' },
];

export const toolkit = {
  name: 'UK AI Risk Management Toolkit (DSIT guidance)',
  line: 'Practical guidance for managing AI risks, published on 8 September 2026. Guidance, not a mandatory legal standard.',
  href: 'https://www.gov.uk/government/publications/ai-risk-management-toolkit',
};

export const disclaimer = 'Illustrative examples for academic discussion. Not legal, compliance or professional advice, and not a validated or certified method.';

export const allQuestions = pillars.flatMap((p) => p.questions.map((q) => ({ ...q, pillar: p.id, pillarName: p.name })));
