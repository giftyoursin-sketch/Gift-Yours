# Development and Deployment Workflow

- **Rule**: Whenever making code changes, ALWAYS ask the user to preview and verify the changes on `localhost` first. Do NOT push to GitHub or deploy to Vercel automatically.
- **Rule**: ONLY after the user has explicitly confirmed the localhost preview and says "push to vercel" (or gives a similar deployment command), proceed to push the code and trigger the Vercel deployment.

# GLOBAL DEVELOPMENT RULES (FOLLOW FOR EVERY FUTURE CHANGE)

## 1. Desktop + Mobile

Every change must be implemented for BOTH Desktop and Mobile. Both layouts must remain consistent with the same design language.

## 2. Mobile First Priority ⭐⭐⭐⭐⭐

Mobile UX has the highest priority. Whenever implementing any feature:

1. Design for Mobile first.
2. Then optimize for Tablet.
3. Then optimize for Desktop.
   The mobile experience should always feel like a premium shopping application.

## 3. Responsive Verification

After every UI change, verify:
✓ Alignment, Padding, Margins
✓ Image Scaling, Typography
✓ Buttons, Cards, Grid Layout
✓ Carousel, Navigation, Sticky Elements
✓ Touch Targets, Overflow, White Space, Section Spacing, Loading States
Everything must be visually correct on Mobile, Tablet, and Desktop.

## 4. Image Validation

After every change verify:
✓ Images are not stretched, not cropped incorrectly, keep correct aspect ratio
✓ Images load correctly, look sharp, remain responsive, align properly inside cards
✓ Product galleries behave correctly

## 5. Layout Validation

Before considering any task complete: Check No broken alignment, overlapping elements, unnecessary white space, oversized cards/buttons, inconsistent spacing, horizontal scrolling, layout shifting, broken responsiveness. Fix every issue immediately.

## 6. Error Checking

After every implementation automatically verify for React Errors, Next.js Errors, Console Errors, Hydration Errors, Build Errors, TypeScript Errors, API Errors, Responsive Errors. Resolve all issues before considering the task complete.

## 7. Preview Workflow

Code -> Local Preview -> Desktop Review -> Tablet Review -> Mobile Review -> Fix Issues -> Final Verification -> Wait for my approval -> Only deploy when explicitly told "Deploy to Vercel".

## 8. UI Quality

Every new UI must be Premium, Modern, Minimal, Consistent, Responsive, Fast, Accessible, Touch Friendly, User Friendly. Never create desktop-only layouts.

## 9. Existing Design Language

Maintain Typography, Colors, Border Radius, Spacing, Shadows, Animations, Buttons, Cards, Icons. Do not introduce inconsistent UI styles.

## 10. Final Quality Checklist

Before marking any task as complete, confirm:
✅ Desktop/Tablet/Mobile layout is perfect.
✅ Images are aligned correctly, no responsiveness issues.
✅ No console/build errors, no UI inconsistencies, no overflow issues.
✅ Performance remains smooth.
If any issue is found, automatically fix it before asking for review.
