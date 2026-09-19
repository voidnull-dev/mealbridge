# MealBridge

A plain HTML, CSS and JavaScript application for GLA University hostel representatives and NGOs in Mathura. Google is the only sign-in provider. There are no seeded organizations, listings, accounts, reservations, demo cards, fake NGOs, or fake hostel partners.

## Run

Use Node.js 22 or later: `npm run dev`. Open http://127.0.0.1:5173. No frontend package installation or compilation is needed. `npm run build` copies the site into `dist`; `npm test` checks quantity and time validation. Three.js is vendored JavaScript for the WebGL scene, with its license in assets/vendor.

## Firebase deployment

The provided public web configuration targets `meal-f9e82` in `js/firebase-config.js`. It is not a service-account credential. Analytics is not loaded.

1. In Firebase Authentication, enable Google as the only provider. Add the deployed hostname `mealbridge-community-surya.codexloner.chatgpt.site` and local development hosts to Authorized domains.
2. Create the default Cloud Firestore database, preferably near the Cloud Functions region `asia-south1`. Start with locked rules; never use test-mode rules for this app.
3. Enable Blaze billing to deploy Cloud Functions. The user must approve and complete billing activation. Do not enable paid services on their behalf without authorization.
4. From an authenticated Firebase CLI session with project deployment permission: `npm ci --prefix functions`, then `firebase deploy --project meal-f9e82 --only firestore:rules,functions`.
5. Sign in with the authorized administrator `suryanshdevniranjan@gmail.com`. The server checks the verified Google email before setting the admin custom claim. The client refreshes the token, then shows `/admin`. An email comparison in the frontend never grants permissions.
6. Test Google login on the deployed domain; register separate authorized Hostel and NGO accounts, approve them, and test publishing, simultaneous reservations, cancellation and collection. Production organizations must be real and approved, not test fixtures.

The Sites host remains owner-private. That access gateway is separate from Firebase Google sign-in; wider access requires an explicit publishing/audience change.

## Security and data model

`users/{uid}` stores a permanent role, organization name, review status and private verification details. The onboard transaction refuses an existing document, and browser writes/deletes are denied. Signing out, reloading or clearing browser storage cannot change the portal.

`organizations/{uid}` contains only approved public organization fields. `listings` contains public meal information and transactional reserved/collected counters. `pickupDetails` contains private contact and access instructions. `reservations` is readable only by its hostel, NGO and administrator. `pickupSecrets` is not browser-readable; only the reserving NGO can request its code. Five failed code checks temporarily lock collection attempts.

All mutations run in authenticated callable Cloud Functions and Firestore transactions. Availability is checked again on the server. Reservation and publish request IDs prevent duplicate records on retry. Partial collection releases the entire reservation and increments only actual collection. Closed or expired listings never show returned boxes as available. Active reservations cannot have their food or pickup information edited underneath them. Admin decisions contain reviewer identity, timestamp and a review note.

## Real GLA data

Source: https://www.gla.ac.in/campus-life/hostel (checked 19 September 2026). The official page confirms hostel/mess facilities and the Mathura address, but does not give a current named hostel directory. The selectable GLA hostel reference uses the university’s 2022 Self Study Report, pages 66–67: https://www.gla.ac.in/Uploads/image/920imguf_Update-8feb23.pdf. These are documented names, not seeded partner accounts; current names need administrative confirmation. Applicants must select one of the documented GLA hostel identities; the server rejects arbitrary hostel names. An administrator still verifies current authorization directly with GLA before approval. No university partnership or NGO participation is claimed. NGO names are never preloaded: an applicant must provide a real registered organization, registration identifier, official HTTPS website, service area and verification details, followed by manual administrator review. The 3D scene and meal photo are illustrative, not actual GLA imagery. They are presentation assets, not demo food/organization records.

## Current activation status

Backend deployment and live end-to-end verification are pending project access and the billing decision. Local domain tests pass; these do not replace Firebase emulator or production authorization/concurrency verification. Never describe this checkout as production-activated until the deployment and real Google login are verified.
