# Toolz - The Device Orchestrator

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Less Noise. More Toolz.**
> A high-precision Android toolkit designed for people who value speed over clutter. 30+ tools, one seamless experience.

This repository contains the source code for the Toolz landing page, showcasing the capabilities of the Toolz Android application.

## 📱 About Toolz

Toolz is more than just a collection of scripts. It's a cohesive system of 30+ tools built for stability and speed. Currently at **v1.0.7** with stable support for Android 12 through 15.

### Key App Features
- **Focus Flow:** Deep-system integration that tracks app usage and scores productivity. Includes accessibility-powered hard locks.
- **Privacy Vault:** Encrypted SQLCipher storage for passwords and notifications. Local-first and biometric-locked.
- **Media Engine:** Media3-backed playback with local indexing and catalog management.
- **FFmpeg Core:** Professional-grade on-device file conversion.
- **Smart Vision:** High-performance OCR and scanner tools.
- **System Native:** Built with Jetpack Compose and Hilt, integrating seamlessly with Autofill, Quick Settings, and App Widgets.

---

## 💻 Tech Stack (Landing Page)

The landing page is built with modern web technologies to ensure a fast, responsive, and high-performance experience:

- **Framework:** [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data/Form Handling:** [TanStack Query](https://tanstack.com/query), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)

---

## 🚀 Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed. This project also includes a `bun.lock` file, so you can use [Bun](https://bun.sh/) for faster installs.

### Installation

```bash
# Clone the repository
git clone https://github.com/freroxx/toolz.git

# Navigate to the project directory
cd toolz

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start the development server
npm run dev
# or
bun run dev
```

### Building for Production

```bash
# Build the project
npm run build
# or
bun run build

# Preview the production build
npm run preview
# or
bun run preview
```

### Testing

```bash
# Run unit tests (Vitest)
npm test

# Run Playwright tests
npx playwright test
```

---

## 🛠 Project Structure

- `src/components/landing`: Contains the individual sections of the landing page (Hero, Features, Showcase, etc.).
- `src/pages`: Main application routes (Index, NotFound).
- `src/hooks`: Custom React hooks.
- `src/lib`: Utility functions and configurations.
- `api/`: Backend API routes (if applicable).

---

## 📄 License

This project is open-core and community-driven. Check the [Source](https://github.com/freroxx/toolz) for more details.

---

Built with ❤️ for the Android community.
