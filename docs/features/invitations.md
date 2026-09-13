# Feature: Invitations

## Overview
Invitations allow company owners/managers to invite new team members via email.

## Key Requirements
- Issue invitations containing `companyId`, `invitedEmail`, `role`, `token`, `expiration`, and `status`.
- Send invitation emails with secure accept links.
- Accepting an invitation automatically creates a `CompanyMembership` for the user upon sign-up or login.
