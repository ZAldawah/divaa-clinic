# Divaa Beauty Clinic

Welcome to the official repository for the **Divaa Beauty Clinic** website.

Divaa Beauty Clinic is a premium medspa located in Katy & Houston, TX, specializing in advanced aesthetic treatments including:
- **Dermal Fillers** (Lip, Cheek, Under-Eye)
- **Neurotoxins** (Botox, Dysport, Letybo)
- **Collagen Biostimulators** (Sculptra, Radiesse)
- **Skin Rejuvenation** (Microneedling, PRP/PRF, Radiofrequency)
- **Facials & Hydrofacials**

## Tech Stack
This application is built for high performance and SEO optimization using industry-standard web technologies:
- **Framework**: Next.js 15 (App Router)
- **Styling**: Custom CSS & Tailwind CSS
- **Deployment**: Vercel (Recommended)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure Highlights
- `src/app/`: Contains the Next.js App Router pages and global CSS.
- `src/components/`: Reusable UI components (Navbar, Footer, Carousels).
- `src/components/layout/ServiceLayout.jsx`: The master DRY component that powers all individual service landing pages.
- `public/pictures/`: All optimized static imagery used across the site.
