# Feature: Authentication

## Overview
Authentication handles user sign-up, sign-in, session persistence, password reset, and identity management using **Supabase Auth**.

## Key Requirements
- User registration and login using email/password and magic links.
- Session persistence handled via HTTP-only cookies in Next.js App Router.
- User profile management.
- Redirect flow: `Register/Login → User Home → Select/Create Company → Company Dashboard`.

## Data Model Connection
- Global `User` table managed in sync with Supabase Auth `auth.users`.
- Identity is separate from Company Membership (`CompanyMembership`).
