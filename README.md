# Electronics Hobby Club Website

> A modern, community-driven web experience for makers, tinkerers, and innovators at the Electronics Hobby Club.

![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind%20CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-radix-000000)

The Electronics Hobby Club (EHC) website is an immersive, open-source platform that highlights our projects, events, team, and outreach programs. It is built with performance and accessibility in mind, powered by Vite, React, TypeScript, Tailwind CSS, and the shadcn/ui component system. We welcome contributions from designers, developers, and community members who want to help us grow the club's digital presence.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Quality Checks](#quality-checks)
- [Key Components & Pages](#key-components--pages)
- [Styling & Design System](#styling--design-system)
- [Content Management](#content-management)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Roadmap & Ideas](#roadmap--ideas)
- [Community & Support](#community--support)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

The site serves as a home for everything happening at the Electronics Hobby Club:

- Present flagship projects, workshops, and competition wins.
- Highlight upcoming events and ways to get involved.
- Celebrate the people who make the club succeed.
- Provide easy contact options for prospective members and partners.

The repository is intentionally open so that anyone can improve content, visuals, accessibility, documentation, or automation tooling.

## Features

- **Immersive Hero Experience** – Dynamic Three.js background with animated particles, neon circuitry, and drone visuals tuned for performance.
- **Modular Landing Page** – Hero, About, What We Offer, Contact, and Footer sections compose the main page with reusable UI primitives.
- **Dedicated Pages** – `/team`, `/projects`, `/events`, and `/gallery` routes powered by React Router for deep linking and sharing.
- **Responsive & Accessible** – Tailwind CSS utilities and Radix UI components ensure consistent styling, adaptive layouts, and keyboard-friendly interactions.
- **Toast & Notification System** – Includes both shadcn/ui toasts and Sonner notifications for future interactive flows.
- **Type-Safe Data Handling** – TypeScript everywhere, with helper utilities and optional zod schemas for future validation.
- **Performance Optimized** – Vite dev tooling, lazy Three.js scene initialization, intersection observers, and reduced-motion fallbacks.

## Tech Stack

- **Framework**: React 18 + Vite 5 (lightning-fast dev server and optimized builds)
- **Language**: TypeScript 5 (strong typing, DX improvements)
- **Styling**: Tailwind CSS 3 with custom themes, gradients, and animations
- **Component System**: shadcn/ui + Radix primitives for accessible, composable UI
- **State & Data**: TanStack React Query for server state (ready for future APIs)
- **3D & Visuals**: Three.js-powered background effects in `three-background.tsx`
- **Tooling**: ESLint 9, PostCSS, autoprefixer, and modern bundler optimizations

## Project Structure

```
└── src/
    ├── pages/            # Top-level routes (Index, NotFound)
    ├── components/
    │   ├── Hero.tsx      # Animated hero with Three.js background
    │   ├── Team.tsx      # Category-based team listing
    │   ├── Gallery.tsx   # Visual showcases of club work
    │   ├── Events.tsx    # Upcoming & past events highlight
    │   ├── Projects.tsx  # Featured builds & research
    │   ├── ui/           # shadcn/ui primitives (button, card, etc.)
    │   └── three-background.tsx # Reusable WebGL scene
    ├── hooks/            # Shared hooks (e.g., mobile detection, toast)
    ├── lib/              # Utility helpers
    ├── assets/           # Static assets used by components
    └── main.tsx          # App bootstrap with router & providers
```

Use this structure as a guideline when adding new features. Keep shared logic in `hooks/` and reusable visual primitives in `components/ui/`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18.0** or newer (Vite 5 requirement)
- [npm](https://www.npmjs.com/) 9+ (or an alternative like pnpm 9+/bun 1.1+)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/<your-org>/electronics-hobby-club.git
cd electronics-hobby-club
npm install
# or: pnpm install
# or: bun install
```

### Development

Start the development server with hot reloading:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). The server auto-reloads on code changes.

### Quality Checks

- **Static analysis**: `npm run lint`
- **Type checks**: Vite + TypeScript run incrementally during dev and build
- **Production build**: `npm run build`
- **Preview production build**: `npm run preview`

Consider running lint/build before opening a pull request to catch issues early.

## Key Components & Pages

- `Hero` – Landing section with animated background and call-to-action messaging.
- `About` & `WhatWeOffer` – Explain EHC’s mission, club culture, and learning tracks.
- `Projects` – Curated list of flagship builds; extend with real project data and media.
- `Events` – Timeline and highlights of workshops, hackathons, and outreach sessions.
- `Gallery` – Image-rich showcase stored in `public/image/` with responsive layout.
- `Team` – Categorized profiles for core members, mentors, and contributors, drawing images from `public/team/images/`.
- `Navbar` & `Footer` – Persistent navigation and contact surface across all routes.

When introducing new sections, keep components small, composable, and typed. If the new UI element is reusable, place it in `components/ui/` alongside existing shadcn-based primitives.

## Styling & Design System

- Tailwind utility classes drive layout, spacing, and responsive behavior.
- Theme tokens and CSS variables live in `src/index.css` and `src/App.css`.
- shadcn/ui components are tailored via Tailwind and `class-variance-authority` for styling variants.
- Radix primitives ensure accessibility (focus management, keyboard navigation, ARIA attributes).
- Three.js background automatically respects `prefers-reduced-motion`; avoid heavy animations in additional components without similar fallbacks.

## Content Management

- **Images**: Store hero, gallery, and team images under `public/image/` and `public/team/images/`. Use descriptive file names and web-optimized sizes.
- **Team roster**: Update the array inside `src/components/Team.tsx`. Consider extracting data into JSON for easier maintenance if it grows.
- **Projects & Events**: Current data lives directly in component files; feel free to refactor into data modules, CMS integrations, or API calls.
- **Contact section**: Customize emails/social links in `src/components/Contact.tsx`.

Document any major data changes so future contributors understand the source of truth.

## Deployment

The project produces a static build under `dist/` that can be hosted almost anywhere:

- **Static hosting**: Netlify, Vercel, GitHub Pages, Cloudflare Pages, Firebase Hosting.
- **Custom servers**: Serve `dist/` via Nginx/Apache or any static file server.

Typical deployment pipeline:

1. Run `npm run build`.
2. Upload the `dist/` folder to your hosting provider.
3. Configure single-page application fallback (serve `index.html` for unknown routes) so React Router works on refresh.

For CI/CD, cache `node_modules` and run lint/build as part of PR checks.

## Contributing

We love community contributions! Here is the typical workflow:

1. **Discuss** – Open an issue to propose new ideas, report bugs, or claim roadmap tasks.
2. **Fork & Branch** – Fork the repo and create a feature branch (`feature/your-idea`).
3. **Develop** – Make your changes, keep commits focused, and add comments or tests when relevant.
4. **Lint & Build** – Run `npm run lint` and `npm run build` to ensure quality.
5. **Pull Request** – Submit a PR describing the motivation, screenshots (if UI changes), and testing steps. Link related issues.
6. **Review** – Engage with maintainer feedback. We aim for collaborative, constructive reviews.

### Contribution Guidelines

- Follow the existing code style (TypeScript, Tailwind conventions, component patterns).
- Keep components small, declarative, and accessible.
- Prefer functional components and hooks; avoid introducing class components.
- Document significant changes in the README or inline comments when helpful.
- If you add dependencies, explain the need in your PR description.

Consider adding tests or storybook examples in the future as the project grows.

## Roadmap & Ideas

These are potential areas where contributors can make a difference:

- Event management system backed by CMS or Google Sheets.
- Project portfolio with filtering, tags, and detailed case studies.
- Member application form with validation and backend integration.
- Analytics-friendly contact tracking or newsletter signup.
- Accessibility review (WCAG) and dark/light theme refinements.
- Automated image optimization pipeline.
- Continuous deployment setup and status badges.

Feel free to propose new ideas by opening an issue or starting a discussion.

## Community & Support

- **Issues**: Use GitHub Issues for bugs, feature requests, and questions.
- **Discussions**: Start a GitHub Discussion (or create one) for design debates and brainstorming.
- **Contact**: Reach the core team via the email and social links in the Contact section of the site.

If you are a member of the Electronics Hobby Club, consider pairing up with newcomers to mentor them through their first contribution.

## License

This project is intended to be open-source under the MIT License. If your clone does not yet include a `LICENSE` file, please add one (a template is available from [choosealicense.com](https://choosealicense.com/licenses/mit/)).

## Acknowledgements

- Inspired by the energy and creativity of the Electronics Hobby Club community.
- Built with love on top of the Vite + React + shadcn/ui starter ecosystem.
- Thanks to everyone who shares feedback, opens issues, triages bugs, or improves documentation.