// Everything the README says, in one place. Edit here, then run
// `node scripts/render.mjs` to redraw the cards and README.md.

export const profile = {
    name: "Aldio Lisafron",
    unit: "al-dioooo",
    headline: "Full-stack Product Engineer",
    tagline: "AI-powered Web & Mobile Products",
    site: "https://al.is-a.dev",

    // Hero status columns, carried over from the hand-made banner
    status: {
        left: [
            { icon: "signal", text: "Connection: Online" },
            { icon: "terminal", text: "Shell: /bin/zsh" },
            { icon: "laptop", text: "Claude: Skills Ready" }
        ],
        right: [
            { icon: "mapPin", text: "Buitenzorg City, ID" },
            { icon: "sliders", text: "Conjuring Innovation" },
            { icon: "building", text: "SE@IPB University" }
        ]
    },

    // Lines Pod 042 types under the name, in turn
    pod: [
        "Primary directive: build systems that are useful, and keep them standing under pressure.",
        "Now: Product Engineer at Ngonlenin ID, and a student at IPB University.",
        "Proposal: review the mission records below."
    ],

    about: "Full-stack product engineer with 4+ years shipping web and mobile products, from modular ERP and commerce platforms to AI assistants. I design, build, and deploy the whole stack, with attention to access control, audit trails, and human review of AI output.",

    stats: [
        { value: "4+", unit: "YEARS", caption: "SHIPPING WEB AND MOBILE" },
        { value: "6", unit: "CLIENTS", caption: "SERVED AT BLOOMREEF DEV" },
        { value: "50+", unit: "BRANCHES", caption: "ON BACK-OFFICE SYSTEMS" },
        { value: "1ST", unit: "PLACE", caption: "IFEST UNPAD 2026" }
    ],

    experience: [
        {
            date: "AUG 2026 — PRESENT",
            type: "FULL-TIME · HYBRID",
            role: "Product Engineer",
            org: "NGONLENIN ID",
            note: "POS and business operations platform for merchants."
        },
        {
            date: "AUG 2026 — PRESENT",
            type: "INTERNSHIP · REMOTE",
            role: "Full Stack Engineer",
            org: "RASYLVA.ID",
            note: "Biotalyzer: biota field data turned into analysis and reports."
        },
        {
            date: "JUN 2022 — OCT 2025",
            type: "SOFTWARE HOUSE",
            role: "Full-stack DevOps & UI/UX Designer",
            org: "BLOOMREEF DEV",
            note: "Systems for 6 clients, with back-office software across 50+ branches."
        },
        {
            date: "2020 — PRESENT",
            type: "SELF-EMPLOYED",
            role: "Freelance Full-stack Developer",
            org: "FREELANCE",
            note: "Client work from requirements and UI/UX through deployment."
        },
        {
            date: "JUL 2021 — DEC 2021",
            type: "INTERNSHIPS",
            role: "Web Developer Intern",
            org: "KLHK · KARYA MITRA USAHA",
            note: "An asset-lending tracker, a storefront and a company blog."
        }
    ],

    missions: [
        {
            slug: "aksesin",
            kind: "HACKATHON",
            year: "2026",
            title: "AKSESIN",
            tag: "1ST PLACE · IFEST UNPAD 2026",
            text: "AI accessibility travel companion that checks whether a trip fits a person's access needs before they leave.",
            stack: ["NEXT.JS", "EXPO", "FASTIFY", "MASTRA"],
            link: "aksesin.onefatir.dev",
            href: "https://aksesin.onefatir.dev"
        },
        {
            slug: "modular-erp",
            kind: "BLOOMREEF",
            year: "2022 — 2024",
            title: "MODULAR ERP",
            tag: "BUSINESS OPERATIONS PLATFORM",
            text: "Independently deployable modules for inventory, cashier and payments, accounting, reconciliation, reporting and audit trails.",
            stack: ["REACT", "LARAVEL", "TAILWIND CSS"],
            link: "al.is-a.dev/work/modular-erp",
            href: "https://al.is-a.dev/work/modular-erp"
        },
        {
            slug: "gdgoc-ipb",
            kind: "COMMUNITY",
            year: "2026",
            title: "GDGOC IPB",
            tag: "CREATIVE TECHNOLOGIST",
            text: "Chapter website with an interactive 3D campus and a member dashboard for Google Developer Group on Campus IPB University.",
            stack: ["NEXT.JS", "THREE.JS", "CONVEX"],
            link: "gdgocipb.com",
            href: "https://gdgocipb.com"
        },
        {
            slug: "lokerin",
            kind: "COMPETITION",
            year: "2026",
            title: "LOKERIN",
            tag: "ITASEFEST 2026 · ITASE 7.0",
            text: "Voice-first job board for informal work and internships in Banyumas, used by talking or typing.",
            stack: ["NEXT.JS", "TAILWIND CSS", "MOTION", "MAPBOX"],
            link: "lokerin.site",
            href: "https://lokerin.site"
        },
        {
            slug: "siren",
            kind: "PERSONAL",
            year: "2026",
            title: "SIREN",
            tag: "MARITIME DOMAIN AWARENESS",
            text: "Flags illegal fishing, AIS gaps and zone violations in Indonesian waters from Global Fishing Watch data.",
            stack: ["NEXT.JS", "POSTGRESQL", "PGVECTOR", "MAPBOX"],
            link: "al.is-a.dev/work/siren",
            href: "https://al.is-a.dev/work/siren"
        },
        {
            slug: "yorha-garden",
            kind: "PERSONAL",
            year: "2026",
            title: "YORHA GARDEN",
            tag: "NIER-THEMED PERSONAL TOOLS",
            text: "A macOS desktop with Pod 042, Raycast themes and an extension for a coding agent, all in YoRHa style.",
            stack: ["SWIFT", "PYTHON", "TYPESCRIPT"],
            link: "yorhagarden.xyz",
            href: "https://yorhagarden.xyz"
        }
    ],

    // Icons are keyed into scripts/data/icons.json
    loadout: [
        { label: "CORE LANGUAGES", items: ["php", "javascript", "typescript", "html", "css"] },
        { label: "WEB APPLICATIONS", items: ["laravel", "react", "nextjs", "vue", "inertia", "tailwindcss"] },
        { label: "MOBILE, BACKEND AND DATA", items: ["react-native", "expo", "fastify", "drizzle", "mysql", "postgresql"] },
        { label: "DESIGN, 3D AND WORKFLOW", items: ["figma", "canva", "threejs", "webgl", "git", "github"] }
    ],
    appliedAi: ["MASTRA AGENTS", "MODEL CONTEXT PROTOCOL", "RAG ON PGVECTOR", "VOICE AND VISION"],

    // The signal log river: how many repositories get a named current, and
    // "owner/name" entries to keep out of the named ones
    activity: { top: 8, hide: [] },

    education: [
        {
            date: "AUG 2024 — AUG 2028",
            type: "EXPECTED",
            school: "IPB University",
            programme: "Bachelor of Applied Software Engineering Technology (D4), Sekolah Vokasi",
            gpa: { value: 3.66, of: 4 }
        },
        {
            date: "2019 — 2022",
            type: "VOCATIONAL HIGH SCHOOL",
            school: "SMK Negeri 1 Ciomas",
            programme: "Software Engineering (RPL)"
        }
    ],
    certifications: [
        "CLAUDE ACADEMY · BUILDING WITH THE CLAUDE API",
        "CLAUDE ACADEMY · MCP ADVANCED TOPICS",
        "CLAUDE ACADEMY · CLAUDE CODE 101",
        "GOOGLE FOR EDUCATION · GEMINI CERTIFIED UNIVERSITY STUDENT"
    ],

    comms: [
        { slug: "website", label: "WEBSITE", value: "al.is-a.dev", href: "https://al.is-a.dev" },
        { slug: "linkedin", label: "LINKEDIN", value: "aldio-lisafron", href: "https://linkedin.com/in/aldio-lisafron" },
        { slug: "instagram", label: "INSTAGRAM", value: "@al.dioooo", href: "https://instagram.com/al.dioooo" },
        { slug: "email", label: "EMAIL", value: "contact@al.is-a.dev", href: "mailto:contact@al.is-a.dev" }
    ],

    sections: [
        { slug: "service", title: "SERVICE RECORD", sub: "experience" },
        { slug: "missions", title: "MISSIONS", sub: "selected_work" },
        { slug: "loadout", title: "LOADOUT", sub: "stack_and_tools" },
        { slug: "signal", title: "SIGNAL LOG", sub: "activity" },
        { slug: "training", title: "TRAINING", sub: "education" },
        { slug: "comms", title: "COMMS", sub: "transmission_channels" }
    ]
}
