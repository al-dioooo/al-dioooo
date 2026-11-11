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
        "Proposal: review the signal log below."
    ],

    stats: [
        { value: "4+", unit: "YEARS", caption: "SHIPPING WEB AND MOBILE" },
        { value: "6", unit: "CLIENTS", caption: "SERVED AT BLOOMREEF DEV" },
        { value: "50+", unit: "BRANCHES", caption: "ON BACK-OFFICE SYSTEMS" },
        { value: "1ST", unit: "PLACE", caption: "IFEST UNPAD 2026" }
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
    activity: { top: 8, hide: ["rafi1912/Project_Big_Data_Klp4"] },

    comms: [
        { slug: "website", label: "WEBSITE", value: "al.is-a.dev", href: "https://al.is-a.dev" },
        { slug: "linkedin", label: "LINKEDIN", value: "aldio-lisafron", href: "https://linkedin.com/in/aldio-lisafron" },
        { slug: "instagram", label: "INSTAGRAM", value: "@al.dioooo", href: "https://instagram.com/al.dioooo" },
        { slug: "email", label: "EMAIL", value: "contact@al.is-a.dev", href: "mailto:contact@al.is-a.dev" }
    ],

    sections: [
        { slug: "loadout", title: "LOADOUT", sub: "stack_and_tools" },
        { slug: "signal", title: "SIGNAL LOG", sub: "activity" },
        { slug: "comms", title: "COMMS", sub: "transmission_channels" }
    ]
}
