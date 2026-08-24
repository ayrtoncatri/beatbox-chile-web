-- Additive Ley 21.719: cookie consent category + parental consent evidence for NNA.

ALTER TYPE "PrivacyConsentCategory" ADD VALUE IF NOT EXISTS 'COOKIES';

ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "parentalGuardianName" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "parentalConsentAt" TIMESTAMP(3);
