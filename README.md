# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

--- 

 🎯 The Main App: AI SEO Agent

  A tool that helps marketers create lots of SEO content pages automatically. Think of it like
  having an AI assistant that can take one keyword and turn it into hundreds of content ideas.

  🔧 What We Fixed First

  - Tailwind CSS: The styling system wasn't working - we fixed all the configuration errors so
  the app looks good

  🎨 The User Interface

  - Clean, professional design with blue gradients and card layouts
  - Header with AI bot icon and status indicators
  - Main form where you type in a keyword (like "AI tools")
  - Results display that shows keyword clusters with metrics

  ⚙️ The Smart Parts (Components)

  1. KeywordDiscovery Component
    - Has an input box for your seed keyword
    - Shows a "Discover Keywords" button
    - Displays results in organized clusters
    - Shows search volume, difficulty, and opportunity level
  2. ProgressIndicator Component
    - Shows 5 steps of AI processing with animations
    - Has a progress bar that fills up
    - Makes it feel like real AI is working

  🤖 The Behind-the-Scenes Services

  1. Mock MCP Client (mcpClient.js)
    - Pretends to connect to real SEO data services
    - Simulates getting search volumes and keyword suggestions
    - Will be replaced with real APIs later
  2. Keyword Service (keywordService.js)
    - Takes your seed keyword and generates related keywords
    - Groups them into themes (tools, guides, comparisons, etc.)
    - Calculates which ones are good opportunities

  🚀 How It Works

  1. You type "AI tools"
  2. The app shows a progress animation
  3. It generates clusters like:
    - "AI Tools & Software" (12,500 searches/month)
    - "AI Tools Guide" (8,900 searches/month)
    - "AI Tools Comparison" (6,200 searches/month)
  4. Each cluster shows difficulty and opportunity ratings

  💡 The Big Picture

  Instead of manually researching keywords for hours, a marketer can now:
  - Enter one keyword
  - Get hundreds of related keywords automatically
  - See which ones are worth targeting
  - Have a roadmap for creating lots of SEO content

  It's like having a research assistant that works in seconds instead of hours!