# Feature: Invoices & Billing

## Overview
Enables companies to create, issue, and manage professional invoices for products and services.

## Key Requirements
- Invoice generation with custom line items, tax, discounts, and total calculation.
- Invoice status lifecycle: `DRAFT`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED`.
- Automated PDF invoice export/download.
- Exposure of invoice data to financial AI agents (`getInvoices()`).
