/**
 * Template photo library — maps the curated /imgs/ folder to the pages where
 * each photo shines. Centralized so that adding a new photo or wiring a new
 * screen is a one-liner.
 *
 * Usage:
 *   import { TEMPLATE_PHOTOS } from '@/components/bright/templatePhotos';
 *   <img src={TEMPLATE_PHOTOS.investment.hero} />
 */

export const TEMPLATE_PHOTOS = {
  investment: {
    hero: '/imgs/savings-growth-investment-concept.jpg',
    growth: '/imgs/money-savings-growth-concept.jpg',
    crypto: '/imgs/abstract-fintech-banking-technology.jpg',
    planning: '/imgs/financial-planning-steps-infographic.jpg',
  },
  cards: {
    hero: '/imgs/premium-credit-card-payment-transaction.jpg',
    interface: '/imgs/credit-card-payment-interface-illustration.jpg',
    terminal: '/imgs/credit-card-payment-terminal.jpg',
    mobilePayment: '/imgs/secure-mobile-banking-app-transaction.jpg',
  },
  crypto: {
    hero: '/imgs/modern-fintech-digital-banking-technology-abstract.jpg',
    abstract: '/imgs/abstract-fintech-banking-technology.jpg',
    growth: '/imgs/savings-growth-investment-concept.jpg',
  },
  loans: {
    hero: '/imgs/modern-bank-headquarters-exterior.jpg',
    building: '/imgs/modern-bank-building-exterior.jpg',
    architecture: '/imgs/modern-bank-building-exterior-architecture.jpg',
  },
  accounts: {
    hero: '/imgs/modern-bank-headquarters-building-exterior.jpg',
    exterior: '/imgs/modern-bank-building-exterior.jpg',
    community: '/imgs/credit-union-community-team-outdoors.jpg',
  },
  bills: {
    hero: '/imgs/happy-family-saving-money-piggy-bank.jpg',
    family: '/imgs/family-managing-finances-kitchen.jpg',
    online: '/imgs/happy-family-managing-finances-online-banking.jpg',
  },
  scheduled: {
    hero: '/imgs/financial-planning-steps-infographic.jpg',
    planning: '/imgs/savings-growth-investment-concept.jpg',
  },
  security: {
    vault: '/imgs/secure-bank-vault-gold-bars.jpg',
    gold: '/imgs/bank-vault-gold-bars-security.jpg',
    protection: '/imgs/secure-mobile-banking-protection.jpg',
    login: '/imgs/secure-mobile-banking-login.jpg',
    safety: '/imgs/secure-mobile-banking-safety-tips.jpg',
    online: '/imgs/secure-online-banking-mobile-app.jpg',
  },
  community: {
    teamOutdoor: '/imgs/credit-union-community-team-outdoors.jpg',
    diverseA: '/imgs/diverse-community-banking-team.jpg',
    diverseB: '/imgs/diverse-community-group-office.jpg',
    sponsorship: '/imgs/cara-credit-union-community-sponsorship-group.jpg',
    family: '/imgs/happy-family-managing-finances-online-banking.jpg',
  },
  offices: {
    openPlan: '/imgs/modern-open-plan-office-business-workspace.jpg',
    workspace: '/imgs/modern-professional-business-office-workspace.jpg',
    collab: '/imgs/modern-professional-office-workspace-collaboration.jpg',
    redChairs: '/imgs/modern-professional-office-workspace-red-chairs.jpg',
    desk: '/imgs/modern-professional-office-workspace.jpg',
  },
  research: {
    paper: '/imgs/fintech-banking-research-paper-abstract.jpg',
    fintech: '/imgs/modern-fintech-digital-banking-technology-abstract.jpg',
  },
} as const;

export type TemplatePhotoSection = keyof typeof TEMPLATE_PHOTOS;
