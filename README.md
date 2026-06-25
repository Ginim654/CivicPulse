CivicPulse is a beautiful, modern, single-page collaborative platform that empowers citizens to identify, report, validate, track, and resolve community issues (like potholes, water leakages, damaged streetlights, and waste concerns).
Built with a high-fidelity, vibrant Neon Aurora design system and optimized for instant, zero-configuration deployment.
Key Features:
• Vibrant Aurora Aesthetics: A custom, modern dark theme utilizing glowing Neon Purple (#c084fc) and Cyan (#22d3ee) accents, frosted glass containers (backdrop-filter), and animated ambient background gradients.
• Dynamic Sign-In System: Beautiful login splash overlay to capture user credentials, automatically generate avatar initials, and initialize civic score points.
• Image & Video-Based Issue Reporting: Drag-and-drop file upload with immediate image preview.
• AI-Powered Categorization Mock: Interactive scanline effect that simulates image analysis, confidence metrics, and auto-tags category inputs.
• Geo-location & Interactive Maps: Full-screen maps utilizing Leaflet.js (100% open-source, no API keys required). Pinpoints exact issue locations.
• Community Verification: A democratic upvoting and verification system to establish priority, plus inline community commenting.
• Impact Dashboards: Live analytics powered by Chart.js displaying issue breakdowns and status counts.
• Predictive Insights: Auto-generated predictive warnings showing infrastructure hotspots (e.g. pipe leakage risks).
• Municipal Work Queue: Administrative dispatcher view to transition issues through states (Reported ➔ Verified ➔ In Progress ➔ Resolved).
• Gamification Engine: Direct integration of XP levels, points (+50 XP for reporting, +10 XP for verifying, +50 XP Welcome bonus) and badges (First Alert, Fixer Helper, etc.) saved locally in your browser storage.
• Session Management: Easily log out via the navigation sidebar footer to reset and test the login flow.
Technology Used:
Frontend & Visual Design System
• Structure: Semantic HTML5 markup.
• Styling: Pure CSS3 Variables using a frosted-glass glassmorphism design system. It features dynamic transitions, neon color accents, and responsive layouts tailored for mobile, tablet, and desktop interfaces.
• Icons: Font Awesome vector icons loaded dynamically via CDN.\
Google Technologies Utilized:
1. Google AI Studio & Gemini API (AI Automation)
• Gemini 2.5 Flash Model: Utilized as the multimodal computer vision intelligence engine. It analyzes user-uploaded photos (or videos) of community hazards, detects the issue type, suggests a descriptive title, writes a summary, and evaluates the hazard level.
• Google AI SDK: Used in the serverless functions to establish a secure, low-latency connection between the website and Google’s Gemini API servers.
2. Google Fonts API (Typography & Design)
• Plus Jakarta Sans: Imported directly from Google’s font servers. This premium, clean sans-serif typeface is used throughout the CSS system to ensure high-end readability and clean modern typography.
3. V8 Engine & Chrome DevTools (Execution & Diagnostics)
• Google V8 JavaScript Engine: Powers the lightning-fast, client-side execution of all state management, routing, and dynamic Leaflet/Chart components.
• Chrome DevTools: Used for auditing website performance, tracking localStorage states, and verifying network requests.
