export const seedOwners = [
  { name: "Maya Chen", email: "seed.maya@grouphub.local" },
  { name: "Aarav Patel", email: "seed.aarav@grouphub.local" },
  { name: "Sofia Reyes", email: "seed.sofia@grouphub.local" },
  { name: "Noah Williams", email: "seed.noah@grouphub.local" },
  { name: "Priya Nair", email: "seed.priya@grouphub.local" },
  { name: "Liam O'Connor", email: "seed.liam@grouphub.local" },
];

export const seedProjects = [
  {
    ownerEmail: "seed.maya@grouphub.local",
    title: "CampusCare: daily wellness check-ins for students",
    category: "Health & Wellness",
    stage: "Prototype",
    commitment: "4 hrs/week",
    compensation: "volunteer",
    experienceLevel: "beginner",
    skills: ["React", "Node.js", "MongoDB", "UI/UX"],
    tags: ["health", "student", "web"],
    location: "Remote",
    maxTeamSize: 6,
    teamSize: 3,
    applicantCount: 14,
    daysAgo: 2,
    description:
      "CampusCare is a lightweight daily check-in app that helps students notice burnout early. A two-tap mood log surfaces patterns over time and nudges people toward campus resources when things trend downward.",
    whyBuilding:
      "We watched friends disappear into finals week and only speak up after they had already burnt out. A tiny daily habit plus gentle, private signals felt like the lowest-friction way to catch it sooner.",
    targetAudience:
      "Undergraduate and graduate students juggling coursework, part-time work, and extracurriculars who want a low-effort way to track how they are doing.",
    currentStatus:
      "Clickable prototype with the check-in flow and a private trend view. We need help turning the prototype into a real app and designing the resource hand-off screens.",
    milestones: [
      { title: "Ship the daily check-in flow", status: "Done" },
      { title: "Build the weekly trend dashboard", status: "InProgress" },
      { title: "Pilot with one campus club", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.aarav@grouphub.local",
    title: "GreenRoute: the carbon-aware commute planner",
    category: "Environment",
    stage: "MVP",
    commitment: "6 hrs/week",
    compensation: "equity",
    experienceLevel: "intermediate",
    skills: ["Next.js", "Python", "Data Science", "PostgreSQL"],
    tags: ["climate", "sustainability", "web"],
    location: "Remote",
    maxTeamSize: 5,
    teamSize: 2,
    applicantCount: 9,
    daysAgo: 5,
    description:
      "GreenRoute compares transit, cycling, and driving options for a trip and shows the real carbon cost of each. Users can save recurring commutes and see how small route changes add up over a month.",
    whyBuilding:
      "Most map apps optimize for speed only. We want to make the greener choice the visible one, without asking people to do carbon math in their heads.",
    targetAudience:
      "City commuters and students choosing between transit, bikes, and rideshare who care about cost and emissions but do not want to research every route.",
    currentStatus:
      "The MVP handles two cities and pulls open transit data. Next up is a reliable emissions model and a saved-commute comparison view.",
    milestones: [
      { title: "Validate the emissions model", status: "InProgress" },
      { title: "Add saved commute comparisons", status: "Todo" },
      { title: "Expand to a third city", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.sofia@grouphub.local",
    title: "StudyCircle: find your perfect study partner",
    category: "Education",
    stage: "Concept",
    commitment: "3 hrs/week",
    compensation: "volunteer",
    experienceLevel: "beginner",
    skills: ["React", "Firebase", "Product Design", "Figma"],
    tags: ["education", "student", "edtech"],
    location: "Austin, TX",
    maxTeamSize: 4,
    teamSize: 1,
    applicantCount: 6,
    daysAgo: 8,
    description:
      "StudyCircle matches students in the same course with compatible study styles and schedules. Instead of a huge group chat, you get a small, compatible pod with a shared session plan.",
    whyBuilding:
      "Study groups usually form by luck. We want to match by course, availability, and how people like to study so pods actually stick together.",
    targetAudience:
      "Students in large lecture courses who want accountability partners but do not know where to start.",
    currentStatus:
      "We have the onboarding flows mapped in Figma and a bare React shell. The biggest open question is the matching logic and how to keep pods from going stale.",
    milestones: [
      { title: "Finalize the matching criteria", status: "InProgress" },
      { title: "Build the pod session planner", status: "Todo" },
      { title: "Test with one course community", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.noah@grouphub.local",
    title: "OpenLedger: split expenses without the spreadsheet",
    category: "Finance",
    stage: "Idea",
    commitment: "2 hrs/week",
    compensation: "volunteer",
    experienceLevel: "any",
    skills: ["TypeScript", "Node.js", "PostgreSQL", "React"],
    tags: ["finance", "open-source", "saas"],
    location: "Remote",
    maxTeamSize: 5,
    teamSize: 1,
    applicantCount: 3,
    daysAgo: 12,
    description:
      "OpenLedger is an open-source expense splitter built for student clubs and shared houses. It handles recurring bills, partial payments, and a clean settle-up view that does not require a spreadsheet.",
    whyBuilding:
      "Existing splitters are built for trips, not for a year of rent, utilities, and club purchases. We want something transparent and hackable that a treasurer can actually audit.",
    targetAudience:
      "Student club treasurers, housemates, and small teams who share recurring costs and want an open, self-hostable tool.",
    currentStatus:
      "Still at the idea plus data-model stage. We are writing the schema and RFC, and we need one more backend-minded person to help shape the API.",
    milestones: [
      { title: "Write the data-model RFC", status: "InProgress" },
      { title: "Build the settle-up prototype", status: "Todo" },
      { title: "Open-source the first release", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.priya@grouphub.local",
    title: "PatchPals: gamified first contributions to open source",
    category: "Technology",
    stage: "Prototype",
    commitment: "5 hrs/week",
    compensation: "volunteer",
    experienceLevel: "beginner",
    skills: ["Next.js", "TypeScript", "Node.js", "Technical Writing"],
    tags: ["open-source", "devtools", "beginners"],
    location: "Remote",
    maxTeamSize: 6,
    teamSize: 3,
    applicantCount: 11,
    daysAgo: 4,
    description:
      "PatchPals turns a messy first pull request into a guided, rewarding path. New contributors get curated issues, a checklist, and a friendly reviewer loop instead of being dropped into a huge repo alone.",
    whyBuilding:
      "The hardest part of open source is the first contribution. We want to make that first merged PR feel achievable and a little bit fun.",
    targetAudience:
      "Bootcamp grads and self-taught developers who want their first open-source contribution but find large projects intimidating.",
    currentStatus:
      "Prototype works with two partner repositories. We need help hardening the issue-curation pipeline and writing contributor guides.",
    milestones: [
      { title: "Curate issues from two repos", status: "Done" },
      { title: "Build the contributor checklist", status: "InProgress" },
      { title: "Add a weekly streak view", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.liam@grouphub.local",
    title: "ShelfLife: a local book exchange for your neighborhood",
    category: "Community & Nonprofit",
    stage: "MVP",
    commitment: "4 hrs/week",
    compensation: "volunteer",
    experienceLevel: "any",
    skills: ["React Native", "Node.js", "MongoDB", "UI/UX"],
    tags: ["community", "local", "mobile"],
    location: "Portland, OR",
    maxTeamSize: 4,
    teamSize: 2,
    applicantCount: 7,
    daysAgo: 6,
    description:
      "ShelfLife helps neighbors trade and lend physical books without shipping or fees. List a shelf, browse nearby, and coordinate a porch pickup in a few taps.",
    whyBuilding:
      "Little free libraries are great but you never know what is inside. We want the discovery of a marketplace with the trust and closeness of a neighborhood exchange.",
    targetAudience:
      "Readers in dense neighborhoods and small towns who want to share books locally and meet a few neighbors along the way.",
    currentStatus:
      "MVP is live for one neighborhood with a simple listing and request flow. We are looking for a designer to make browsing feel more like a bookshelf than a feed.",
    milestones: [
      { title: "Launch the listing flow", status: "Done" },
      { title: "Redesign the browse experience", status: "InProgress" },
      { title: "Add lending history", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.maya@grouphub.local",
    title: "Moodboard: collaborative inspiration boards for design teams",
    category: "Design",
    stage: "Concept",
    commitment: "3 hrs/week",
    compensation: "equity",
    experienceLevel: "intermediate",
    skills: ["Figma", "React", "Tailwind CSS", "UI/UX"],
    tags: ["design", "saas", "b2b"],
    location: "Remote",
    maxTeamSize: 5,
    teamSize: 2,
    applicantCount: 8,
    daysAgo: 9,
    description:
      "Moodboard is a shared canvas where design teams collect references, comment in context, and agree on a direction before anyone opens a design file. Boards stay living documents instead of one-off screenshots.",
    whyBuilding:
      "Design direction debates get scattered across chat threads and slide decks. A shared, visual board with lightweight feedback keeps the team aligned without another meeting.",
    targetAudience:
      "Small product and brand design teams that want a lightweight, opinionated alternative to sprawling whiteboard tools.",
    currentStatus:
      "Concept and early prototypes. We are validating whether teams want another tool or a tight integration with the ones they already use.",
    milestones: [
      { title: "Interview five design teams", status: "InProgress" },
      { title: "Prototype the comment layer", status: "Todo" },
      { title: "Decide on the first integration", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.aarav@grouphub.local",
    title: "FarmLink: moving surplus produce before it spoils",
    category: "Food & Beverage",
    stage: "Research",
    commitment: "6 hrs/week",
    compensation: "equity",
    experienceLevel: "intermediate",
    skills: ["Flutter", "Firebase", "Product Design"],
    tags: ["food", "sustainability", "marketplace"],
    location: "Remote",
    maxTeamSize: 6,
    teamSize: 2,
    applicantCount: 5,
    daysAgo: 15,
    description:
      "FarmLink connects small farms with nearby restaurants and food banks when they have a surplus. A simple listing and claim flow helps food move in hours instead of being composted.",
    whyBuilding:
      "A huge amount of good produce is lost because the coordination is manual and slow. We want a tiny tool that makes the nearest useful buyer the easiest option.",
    targetAudience:
      "Small and mid-size farms, local restaurants, and community food banks that already coordinate by phone and text.",
    currentStatus:
      "In discovery. We are interviewing farms and mapping the listing-to-pickup workflow before committing to a build.",
    milestones: [
      { title: "Interview ten local farms", status: "InProgress" },
      { title: "Map the pickup workflow", status: "Todo" },
      { title: "Prototype the listing flow", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.sofia@grouphub.local",
    title: "Cue: practice rooms and honest feedback for student musicians",
    category: "Music & Audio",
    stage: "Idea",
    commitment: "2 hrs/week",
    compensation: "volunteer",
    experienceLevel: "beginner",
    skills: ["React", "Node.js", "UI/UX"],
    tags: ["music", "community", "student"],
    location: "Remote",
    maxTeamSize: 4,
    teamSize: 1,
    applicantCount: 4,
    daysAgo: 18,
    description:
      "Cue helps student musicians find practice space and swap constructive feedback on rough recordings. Think of it as a low-pressure open mic for works in progress.",
    whyBuilding:
      "Practice rooms are booked by luck and feedback is usually from friends who are too nice. We want a small, trusted loop for both.",
    targetAudience:
      "Student musicians and small ensembles who need space and honest, specific feedback before a recital or gig.",
    currentStatus:
      "Idea stage. We are scoping whether to start with room booking or feedback, and need a designer to help shape a calm, non-intimidating experience.",
    milestones: [
      { title: "Choose the first wedge", status: "InProgress" },
      { title: "Sketch the feedback flow", status: "Todo" },
      { title: "Run a small pilot", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.noah@grouphub.local",
    title: "SafeStep: a night-walk companion that checks in",
    category: "Social Impact",
    stage: "Prototype",
    commitment: "4 hrs/week",
    compensation: "volunteer",
    experienceLevel: "any",
    skills: ["React Native", "Node.js", "MongoDB", "UI/UX"],
    tags: ["health", "community", "mobile"],
    location: "New York, NY",
    maxTeamSize: 5,
    teamSize: 2,
    applicantCount: 12,
    daysAgo: 3,
    description:
      "SafeStep lets someone share a live route and an arrival deadline with a trusted contact. If the check-in is missed, the contact gets a clear, calm prompt instead of a vague missed call.",
    whyBuilding:
      "Walking home alone at night is common and the existing options are either heavy panic buttons or nothing. We want a quiet safety net that people will actually use every day.",
    targetAudience:
      "Students, night-shift workers, and anyone walking home alone who wants a simple check-in with someone they trust.",
    currentStatus:
      "Prototype covers route sharing and the missed check-in alert. We need help with battery-efficient location tracking and a careful privacy review.",
    milestones: [
      { title: "Build the missed check-in alert", status: "Done" },
      { title: "Reduce background battery use", status: "InProgress" },
      { title: "Complete a privacy review", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.priya@grouphub.local",
    title: "LeetMentor: mock interviews with an AI coach",
    category: "Data & AI",
    stage: "MVP",
    commitment: "8 hrs/week",
    compensation: "paid",
    experienceLevel: "intermediate",
    skills: ["Python", "Machine Learning", "Next.js", "MongoDB"],
    tags: ["ai", "edtech", "machine-learning"],
    location: "Remote",
    maxTeamSize: 5,
    teamSize: 3,
    applicantCount: 18,
    daysAgo: 1,
    description:
      "LeetMentor runs realistic mock interviews and gives candidates structured feedback on clarity, trade-offs, and where they got stuck. It is built for practice, not for memorizing answers.",
    whyBuilding:
      "Interview prep tools mostly grade whether the answer passes. We want feedback on the reasoning and communication, which is where most candidates actually lose points.",
    targetAudience:
      "Students and early-career engineers preparing for their first technical interviews without a mentor to practice with.",
    currentStatus:
      "MVP supports one coding prompt and a text transcript. We are adding voice, better feedback rubrics, and a practice history view.",
    milestones: [
      { title: "Ship the first feedback rubric", status: "Done" },
      { title: "Add voice-based practice", status: "InProgress" },
      { title: "Build practice history", status: "Todo" },
    ],
  },
  {
    ownerEmail: "seed.liam@grouphub.local",
    title: "StudioBoard: production scheduling for indie film crews",
    category: "Video & Film",
    stage: "Concept",
    commitment: "5 hrs/week",
    compensation: "equity",
    experienceLevel: "intermediate",
    skills: ["React", "TypeScript", "PostgreSQL", "Product Management"],
    tags: ["video", "saas", "b2b"],
    location: "Los Angeles, CA",
    maxTeamSize: 6,
    teamSize: 2,
    applicantCount: 6,
    daysAgo: 11,
    description:
      "StudioBoard keeps indie film crews on the same schedule without a producer text chain. It combines a shoot calendar, call sheets, and simple availability so a small crew can move fast without stepping on each other.",
    whyBuilding:
      "Small productions cannot afford heavy production software, so they fall back to spreadsheets and group chats. We want the essentials, built for a five-person crew.",
    targetAudience:
      "Indie filmmakers, student film crews, and small production companies running projects with limited budgets.",
    currentStatus:
      "Concept and user interviews. We are deciding between a scheduling-first or call-sheet-first launch and looking for someone who has run a real indie set.",
    milestones: [
      { title: "Interview three indie producers", status: "InProgress" },
      { title: "Pick the launch wedge", status: "Todo" },
      { title: "Wireframe the call sheet", status: "Todo" },
    ],
  },
];
