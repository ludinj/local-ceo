CREATE UNIQUE INDEX "Invitation_company_pending_email_key"
ON "Invitation" (
  "companyId",
  LOWER("invitedEmail")
)
WHERE "status" = 'PENDING';