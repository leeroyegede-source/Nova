# NovaAI - Autonomous Interactive App Builder

NovaAI is an incredibly powerful, autonomous, full-stack God-tier software engine capable of designing, building, and executing React-based web and mobile applications dynamically within a live Sandpack preview engine, and persisting generated code with integrated Mock backend SDKs.

## Overview & Functionalities

1. **Omni-LLM Orchestration**: Routes code generation requests between Claude 4 Opus (primary) and fallbacks to ensure applications are always generated correctly.
2. **Context-Aware Ideation & Agent Build System**: Generates self-contained React apps based entirely on natural language prompts.
3. **Iterative Diff Engine (Memory)**: You can request changes to existing generated applications naturally, and NovaAI will alter only what's necessary without wiping the entire application.
4. **Mock Backend SDK (NovaBackend)**: A virtual SDK automatically imported by the generated code to perform backend logic:
   - `nova.db.insert / select`: Natively saves your generated data to your browser's persistent `localStorage`.
   - `nova.auth.signUp / login`: Provides simulated user authentication handling.
   - `nova.storage`, `nova.automation.triggerEmail`, `nova.pdf`: All return promises to emulate delays and realistic backend APIs natively inside the web environment.
5. **Project Persistence**: Accidental browser refreshes won't lose your generated apps. The main app hydrates your session securely upon initialization.
6. **Code Export Module**: A natively integrated `.jsx`/`.tsx` local file exporter to retrieve standard React source code directly to your machine.

## How To Use (Direct Scenarios)

### Scenario 1: Building an E-Commerce Cart
- Go to the Playground.
- Prompt: "Build an interactive E-commerce storefront with a shopping cart using the NovaBackend SDK to save products to db."
- It will render inside the Sandbox. 
- Try to add products, wait for the mock delay, and watch it resolve exactly tailored to the generated code.

### Scenario 2: Making Incremental Edits
- After generating Scenario 1, you type into the prompt: "Make the 'Add to Cart' button orange and add rounded corners."
- NovaAI will preserve the logic and correctly apply styling updates in real time.

### Scenario 3: Downloading / Exporting
- **How to Download File**: After you are satisfied with a generated app in the Sandbox Preview, simply look at the upper-right corner tool bar and click **"Export Code"**.
- The raw source code will automatically download as `NovaAppExport.jsx`.

## Installation and Deployment

**Requirements:**
- Node.js (v18+)

**Installation:**
1. Clone or download this repository.
2. Run `npm install` to install all Next.js, Framer Motion, and Sandpack dependencies.
3. Establish your `.env.local` containing:
   ```env
   CLAUDE_API_KEY=your_claude_key
   ```
4. Run `npm run dev`. Navigate to `http://localhost:3000`.

**Deployment (Vercel):**
1. Push this directory to your GitHub or GitLab.
2. Import the project into Vercel.
3. Setup `CLAUDE_API_KEY` under the Environment Variables section in the Vercel Dashboard.
4. Click Deploy.

## How to Connect a Database (Production Upgrades)
To turn your `NovaBackend` simulations into a live scalable backend setup with Supabase:
1. Establish a free Supabase instance at https://supabase.com.
2. Grab the `SUPABASE_URL` and `SUPABASE_ANON_KEY` and add them to your `.env.local`.
3. Modify the generated `NovaBackend.js` SDK bridge in `/playground/page.tsx` to utilize real Supabase functions with `@supabase/supabase-js`. 
4. Update the AI's system prompt (inside `/api/agent/route.ts`) to inform it about any required changes in how to use the SDK.

---
*Created by SEARCH4LEE at NO.5 DR SC EGEDE CRESCENT, UDU DELTA STATE.*
