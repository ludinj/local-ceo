# Feature: AI Agents Architecture

## Overview
Local CEO features company-scoped AI agents capable of inspecting business data and performing approved actions.

## Built-in Agents
1. **Local CEO**: Executive assistant providing holistic business analysis, sales reporting, and strategy recommendations.
2. **Accountant Agent**: Analyzes invoices, expenses, cash flow, and tax reporting metrics.
3. **Marketing Agent**: Analyzes customer demographics and suggests promotional campaigns.

## Tool Integration & Governance
- Agents interact with data strictly through permitted TypeScript functions (`getSales()`, `getInventory()`, `getInvoices()`, `getCustomers()`, `getExpenses()`, `getEmployees()`, `getAnalytics()`).
- All tools execute within the context of the user's active `companyId`.
- Read-only execution by default; write operations (e.g. creating purchase orders) require explicit human confirmation.
- Built using **Vercel AI SDK** with Gemini / Groq model backends.
