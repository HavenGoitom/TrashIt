Design and build a complete modern responsive web application called **TrashIt**.

I will attach the TrashIt API/Postman documentation separately. Treat that documentation as the source of truth for the application's available backend features, endpoints, request structures, authentication, posts, favorites, messaging, notifications, profiles, reports, admin functionality, and AI features.

Do not invent a different backend architecture. Design the frontend around the documented API and make the UI ready to connect to the existing backend.

==================================================
1. PRODUCT IDEA
==================================================

TrashIt is a marketplace/reuse platform where people can give materials a second life.

A user can:

- create a SELL post for something they have
- create a BUY post for something they need
- browse public posts
- search and filter posts
- favorite posts
- message other users
- receive notifications
- manage their profile
- report inappropriate posts or users
- use AI to get ideas for what they can make from a material
- receive AI-powered BUY ↔ SELL matches

Important:

There is NO separate buyer role and seller role.

Every normal user can both buy and sell.

The user chooses whether a specific post is:

- BUY
- SELL

Do not create separate buyer and seller dashboards or roles.

==================================================
2. VISUAL DIRECTION
==================================================

The attached image is the main visual inspiration.

Study its visual language carefully.

The application should have:

- cute illustrated visual elements
- friendly hand-drawn doodles
- imperfect organic outlines
- rounded shapes
- playful micro-illustrations
- expressive characters
- small decorative elements around important UI
- visual elements that interact with cards and content
- a warm, human feeling
- subtle motion
- an approachable personality

Do NOT copy the exact image, characters, vehicle, beach, composition, or colors.

Instead, translate the aesthetic into a professional TrashIt product.

The result should feel like:

"professional marketplace + playful illustrated world"

rather than:

"children's cartoon application"

The interface should still look trustworthy, modern, clean, and suitable for a real startup.

==================================================
3. COLOR SYSTEM
==================================================

Do NOT use purple.

The main visual palette should be based on:

- warm creamy yellow
- soft cream
- muted beige
- warm light brown
- muted orange
- dark brown
- charcoal
- near-black
- off-white

The primary background should feel like a very light creamy paper or warm beige rather than pure white.

Use darker brown/charcoal areas for contrast.

Avoid extremely bright saturated colors.

The overall palette should feel:

- warm
- earthy
- slightly vintage
- premium
- calm
- friendly
- natural

Suggested visual direction:

Primary background:
very light creamy yellow/beige

Secondary surfaces:
warm cream

Primary dark:
deep brown / charcoal

Accent:
muted burnt orange

Secondary accent:
soft golden yellow

Text:
dark brown/charcoal

Muted text:
warm gray/brown

Success:
muted natural green

Error:
muted red

Keep the colors soft and slightly desaturated.

Do not make the entire application orange.

Orange should be an accent, not the dominant color.

==================================================
4. BACKGROUND
==================================================

Do not use a completely flat sterile background.

Create a subtle paper-like or textured feeling.

The texture should be extremely subtle.

It should look like:

- soft paper grain
- tiny imperfections
- hand-crafted material
- subtle noise

The texture must never interfere with readability.

On cards and forms, use cleaner surfaces so the content remains easy to read.

==================================================
5. DOODLE LANGUAGE
==================================================

This is one of the most important parts of the design.

Create a consistent TrashIt doodle language inspired by the uploaded image.

Use:

- small stars
- hearts
- arrows
- clouds
- little sparks
- loops
- motion lines
- smiley faces
- leaves
- recycling symbols
- tiny bottles
- cardboard boxes
- cans
- clothes
- tires
- jars
- plants
- simple illustrated objects

The doodles should use hand-drawn imperfect strokes rather than perfectly geometric vector shapes.

They should feel intentionally hand drawn.

Use doodles around:

- hero sections
- AI features
- post cards
- empty states
- section headers
- onboarding
- loading states
- success states

Do not put doodles everywhere.

The interface must remain professional.

Use them as visual storytelling elements.

==================================================
6. INTERACTION BETWEEN UI AND ILLUSTRATIONS
==================================================

Take inspiration from the uploaded image where the doodles interact with the character.

Apply the same idea to the interface.

For example:

A SELL card showing a stack of cardboard boxes can have:

- a small hand-drawn arrow pointing toward the boxes
- motion lines around the stack
- a tiny doodle saying "use me"
- a little leaf or spark around the image

A BUY post can have:

- a small magnifying-glass doodle
- arrows pointing toward the requested item
- subtle hand-drawn emphasis around the price or quantity

The AI feature can have an illustrated little character holding materials and thinking.

Empty states can have a character looking around for something.

Loading states can show small doodled objects moving toward a recycling symbol.

The illustrations should feel like they belong to the UI.

==================================================
7. TYPOGRAPHY
==================================================

Use a clean modern sans-serif as the main UI font.

The application should remain highly readable.

Use typography hierarchy:

Large:
hero headings

Medium:
section headings

Small:
supporting text

Strong:
prices, post types, important actions

The visual identity can include a slightly playful display style for selected headings, but the majority of text must remain clean and professional.

Do not use an overly childish font.

Do not use excessive handwritten typography.

Handwritten lettering should only be used occasionally inside decorative doodles.

==================================================
8. GENERAL UI SHAPE LANGUAGE
==================================================

Avoid rigid corporate rectangles.

Use:

- rounded cards
- rounded buttons
- slightly irregular decorative shapes
- soft corners
- pill-shaped labels where appropriate
- organic illustration containers

Cards should have comfortable padding.

Buttons should feel substantial and tactile.

Use subtle borders.

Use shadows carefully.

Do not create huge floating shadows everywhere.

The design should feel lightweight.

==================================================
9. BRAND
==================================================

Brand name:

TrashIt

The logo should feel simple and memorable.

Possible visual direction:

A simplified recycling/upcycling symbol combined with a playful illustrated element.

Do not make it look like a traditional garbage company.

TrashIt should communicate:

"Turn unwanted things into useful things."

The logo can include subtle hand-drawn characteristics while still being suitable for a real product.

==================================================
10. APPLICATION STRUCTURE
==================================================

Create the following main areas:

PUBLIC:

- Landing / Home
- Browse Posts
- Post Details
- Login
- Register

AUTHENTICATED USER:

- Home / Discover
- Create Post
- My Posts
- Favorites
- Matches
- Messages
- Notifications
- Profile
- AI "What Could I Make?"

ADMIN:

- Admin Dashboard
- Users
- Posts
- Reports
- Statistics

Use the backend documentation to align exact functionality and data.

==================================================
11. LANDING PAGE
==================================================

Create a strong visual landing page.

Hero section:

Large headline around the idea:

"Give old things a new life."

Supporting text explaining TrashIt as a platform for buying, selling, reusing, and discovering possibilities in unwanted materials.

Primary CTA:

"Explore TrashIt"

Secondary CTA:

"Create a post"

Hero visual:

Use a custom illustrated TrashIt scene inspired by the uploaded image's style.

Instead of copying the people in the reference image, create original TrashIt-related characters interacting with reused materials.

For example:

A friendly illustrated character carrying a cardboard box, plastic bottles, clothing, jars, or old household items.

Surround the character with small doodles.

Use curved hand-drawn lines and small illustrated objects around them.

Make the character expressive and friendly.

==================================================
12. HOME / DISCOVER
==================================================

The logged-in home screen should immediately expose the marketplace.

Top:

- friendly greeting
- search bar
- notification icon
- profile avatar

Main sections:

"Discover"

"Looking for something?"

"People are giving these things a second life"

Tabs:

- All
- BUY
- SELL

Post cards should be visually attractive.

Each card should show:

- image
- BUY or SELL label
- title
- description preview
- price
- quantity
- user
- location when available
- favorite button
- subtle decorative doodle

Do not overcrowd cards.

==================================================
13. POST CARD DESIGN
==================================================

Cards are a major component.

Create a reusable PostCard component.

Structure:

Image area

Top corner:
BUY / SELL badge

Image:
large visual area

Favorite:
floating heart button

Content:

Title

Short description

Price

Quantity

User information

Optional location

Bottom:

View details / action

The card should feel like an illustrated marketplace card.

Use subtle doodles around the outside of selected cards.

Do not make every card visually different.

Consistency is important.

==================================================
14. CREATE POST
==================================================

Create a beautiful multi-section posting form.

First question should be visually prominent:

"What are you posting?"

Large selectable choices:

SELL

"I have something someone might need."

BUY

"I'm looking for something."

Make these two choices feel visually distinct.

Then fields according to the backend documentation:

- title
- description
- type
- images
- price
- quantity

Support:

Fixed price

OR

Minimum / maximum price

Support:

Fixed quantity

OR

Minimum / maximum quantity

Allow multiple images where supported.

Image upload area should use an illustrated drop zone.

Example empty state:

a small doodle of a box with little stars around it.

Show uploaded images in a clean grid.

Provide clear validation messages.

==================================================
15. POST DETAILS
==================================================

Create a strong detail page.

Large image gallery.

Post information:

- type
- title
- description
- price
- quantity
- status
- seller/buyer information
- date
- location if available

Actions:

- Favorite
- Message
- Report

For the owner:

- Edit
- Change status
- Delete

Do not display owner-only actions to other users.

Make the page feel safe and trustworthy.

==================================================
16. SEARCH AND FILTERING
==================================================

Create a professional marketplace search experience.

Search:

"Search materials, products, or things you need..."

Filters:

- BUY / SELL
- price range
- quantity range
- status
- sorting

Sorting:

- newest
- oldest

Use clean filter drawers or panels on mobile.

On desktop, filters may appear as a sidebar.

==================================================
17. FAVORITES
==================================================

Create a Favorites page showing saved posts.

Use a warm empty state when there are no favorites.

Example:

An illustrated character looking at an empty shelf with tiny doodles.

Message:

"Nothing here yet."

CTA:

"Explore posts"

==================================================
18. MY POSTS
==================================================

Create a dashboard section for the user's own posts.

Tabs:

- Active
- Sold
- Closed

Show cards/list items with:

- image
- title
- BUY/SELL
- price
- quantity
- status
- created date
- actions

Actions:

Edit

Change status

Delete

==================================================
19. MESSAGING
==================================================

Create a modern marketplace messaging experience.

Desktop:

Conversation list on the left.

Conversation content on the right.

Mobile:

Conversation list screen → conversation screen.

Show:

- participant
- related post
- messages
- timestamps
- read state

Input at bottom.

Send button.

Use the existing WebSocket functionality for real-time communication.

Show subtle real-time feedback.

New messages should feel responsive.

==================================================
20. NOTIFICATIONS
==================================================

Create a notification center.

Notifications may include:

- new messages
- conversations
- AI match notifications
- post-related notifications
- other documented events

Unread notifications should be visually obvious but subtle.

Provide:

Mark as read

Mark all as read

Include a notification badge in the global navigation.

==================================================
21. AI — WHAT COULD I MAKE?
==================================================

This should be one of the most visually interesting parts of the product.

Feature:

"What Could I Make?"

The user enters a material.

Example:

"wine bottles"

The AI returns practical ideas.

Each result should show:

- title
- description
- steps
- difficulty

Create a playful AI experience.

Input:

"What do you have?"

Examples:

Plastic bottles

Old tires

Cardboard boxes

Wine bottles

Old clothes

Glass jars

After submitting:

show an illustrated AI loading state.

Example:

Little doodles of the material moving around a recycling symbol.

Results should appear as beautiful cards.

Each idea card can have a small relevant illustration.

Difficulty should be shown clearly.

The feature must feel useful rather than gimmicky.

==================================================
22. AI MATCHES
==================================================

Create a dedicated "Matches" section.

Explain the feature simply:

"We found people looking for what you have."

or:

"Someone has what you're looking for."

Each match should clearly show:

BUY POST

↕

SELL POST

Show:

- item
- title
- price
- quantity
- users

Provide CTA:

"View match"

and/or

"Message user"

Use a visual connection between the BUY and SELL cards.

For example:

a hand-drawn curved arrow or illustrated linking line.

Do not make the matching system look complicated.

The UI should make the concept immediately understandable.

==================================================
23. PROFILE
==================================================

Profile page should include:

- profile information
- name
- username
- email
- bio
- location
- account information

Actions:

- edit profile
- change password
- delete account

Make profile editing simple.

Use a friendly profile header with a subtle illustration or doodle.

==================================================
24. REPORTING
==================================================

Users should be able to report:

- posts
- users

Create a simple modal.

Ask:

"What's wrong with this?"

Provide a reason field/options according to the backend.

Do not make the process intimidating.

After submission:

show a clear success state.

==================================================
25. ADMIN DASHBOARD
==================================================

Create a professional admin dashboard.

Use a more structured visual style than the public marketplace, while still keeping the TrashIt brand.

Dashboard:

statistics cards

Users

Posts

Reports

Moderation

Use charts where useful.

Admin functionality should follow the provided documentation.

Include:

- view users
- suspend users
- view posts
- remove posts
- view reports
- resolve reports
- view statistics

Admin screens should prioritize clarity and information density.

==================================================
26. RESPONSIVE DESIGN
==================================================

The application must be designed responsively.

Desktop:

full navigation

wide marketplace grids

sidebar filters

two-column messaging

large illustrations

Tablet:

condensed layout

Mobile:

bottom navigation or compact mobile navigation

single-column cards

mobile filters

mobile messaging flow

full-width buttons where appropriate

Do not simply shrink the desktop interface.

Design the mobile experience intentionally.

==================================================
27. MOBILE NAVIGATION
==================================================

Use a simple mobile bottom navigation.

Suggested:

Home

Browse

Create

Matches

Messages

Profile

Notifications can be represented by a badge on the relevant navigation item or header.

The Create button should have strong visual emphasis.

==================================================
28. DESKTOP NAVIGATION
==================================================

Header:

TrashIt logo

Browse

Create Post

Matches

Messages

AI

Notifications

Profile

Admin should appear only to admin users.

Keep the header simple.

==================================================
29. MICRO-INTERACTIONS
==================================================

Use subtle animations.

Examples:

Cards slightly lift when hovered.

Buttons gently respond when clicked.

Favorite heart animates when selected.

Notification badges appear smoothly.

Doodles can subtly move.

AI loading animation should feel playful.

Match connection lines can draw themselves.

Images can softly fade in.

Page transitions should be subtle.

Do not over-animate.

The application should feel polished, not distracting.

==================================================
30. ILLUSTRATION SYSTEM
==================================================

Create a reusable TrashIt illustration style.

Characters should have:

- simple expressive faces
- rounded bodies
- casual modern clothing
- friendly poses
- slightly exaggerated proportions
- cute but not childish expressions

Illustrations should use the same visual language across the entire application.

Possible recurring character actions:

- carrying boxes
- holding bottles
- sorting materials
- looking through objects
- celebrating a successful reuse
- thinking about an idea
- messaging someone
- discovering a match

These characters should become part of the TrashIt identity.

==================================================
31. EMPTY STATES
==================================================

Every important empty state should have a small illustrated scene.

Examples:

No favorites

No posts

No messages

No notifications

No matches

No search results

No AI results

Each should contain:

illustration

short friendly message

clear CTA

Use doodles sparingly around the illustration.

==================================================
32. ERROR STATES
==================================================

Do not show ugly generic error screens.

Create friendly error messages.

Example:

"Something went wrong."

"Looks like this little pile got messy. Try again."

But keep error text professional enough for a real application.

Provide:

Retry

Back

or appropriate action.

==================================================
33. LOADING STATES
==================================================

Use skeleton loading for major marketplace lists.

For AI features, use a more playful illustrated loading state.

For messaging, use normal conversation loading indicators.

Do not use unnecessary spinners everywhere.

==================================================
34. ACCESSIBILITY
==================================================

Maintain strong accessibility.

Ensure:

- readable contrast
- usable font sizes
- visible focus states
- buttons have clear labels
- inputs have labels
- icons have accessible meaning
- keyboard navigation works
- color is never the only indicator

Do not sacrifice usability for visual style.

==================================================
35. DESIGN SYSTEM
==================================================

Create reusable components.

At minimum:

Button

Input

Textarea

Select

Modal

Badge

Card

PostCard

PostTypeBadge

PriceDisplay

QuantityDisplay

Avatar

NotificationItem

ConversationItem

MessageBubble

FilterPanel

SearchBar

ImageUploader

EmptyState

LoadingState

AIIdeaCard

MatchCard

ProfileCard

AdminStatCard

Use a consistent spacing system.

Use reusable colors and typography tokens.

Use reusable border radius values.

Do not build every screen as completely independent components.

==================================================
36. DATA / API INTEGRATION
==================================================

Use the attached TrashIt API/Postman documentation.

The frontend should be structured so the backend API can be connected cleanly.

Create a centralized API layer.

Use the documented:

- authentication endpoints
- post endpoints
- favorites endpoints
- conversation endpoints
- notification endpoints
- profile endpoints
- report endpoints
- admin endpoints
- AI endpoint
- matches endpoints

Do not create fake API endpoints that conflict with the documentation.

Use realistic mock data only for visual development where necessary.

Clearly separate mock data from real API integration.

==================================================
37. AUTHENTICATION UX
==================================================

Registration:

username

name

email

password

Login:

email

password

After successful authentication:

store token securely according to the application architecture.

Show authenticated navigation.

Protect authenticated screens.

Show admin screens only when the authenticated user has the proper role.

==================================================
38. POST CREATION UX
==================================================

The posting flow should be one of the strongest experiences in the application.

Make it feel like:

"I'm giving this thing another chance."

Use friendly copy around the form.

Provide a visible preview before submission where appropriate.

Make BUY and SELL selection extremely clear.

Do not make the process complicated.

==================================================
39. OVERALL FEEL
==================================================

The final design should feel like a combination of:

- modern startup
- sustainable marketplace
- illustrated editorial design
- friendly community application
- premium mobile/web experience

It should NOT feel like:

- a generic Bootstrap dashboard
- a children's game
- a plain ecommerce clone
- a corporate enterprise dashboard
- a purple AI application
- a garbage collection service

The strongest visual identity should come from:

1. warm creamy colors
2. dark brown/charcoal contrast
3. hand-drawn doodles
4. expressive illustrated characters
5. rounded organic cards
6. subtle paper texture
7. playful interaction between illustrations and UI
8. clean professional layout

==================================================
40. IMPORTANT DESIGN BALANCE
==================================================

The reference image is cute and highly expressive.

Keep the spirit of that image, especially:

- hand-drawn shapes
- doodles
- characters
- expressive movement
- visual storytelling
- organic composition

But make TrashIt more sophisticated.

The goal is:

"Cute enough to be memorable.
Professional enough to be trusted."

Do not fill every screen with illustrations.

Use illustrations strategically.

The marketplace content must remain the primary focus.

==================================================
41. FINAL SCREENS TO GENERATE
==================================================

Create polished designs for:

1. Landing page
2. Register
3. Login
4. Home / Discover
5. Browse all posts
6. Search results
7. Post details
8. Create BUY post
9. Create SELL post
10. Edit post
11. My Posts
12. Favorites
13. Matches
14. Match details
15. Messages
16. Conversation
17. Notifications
18. Profile
19. Edit profile
20. Change password
21. AI What Could I Make
22. AI results
23. Report modal
24. Admin dashboard
25. Admin users
26. Admin posts
27. Admin reports
28. Admin statistics
29. Empty states
30. Error states
31. Loading states

Create both desktop and mobile layouts where appropriate.

==================================================
42. DO NOT BREAK THE BACKEND CONTRACT
==================================================

The attached API documentation is the source of truth for backend communication.

Do not rename documented endpoints.

Do not invent different request fields.

Do not assume buyer/seller accounts.

Do not introduce separate buyer and seller roles.

Do not invent undocumented backend features.

Where the API does not define a visual behavior, choose a sensible UX without changing the API contract.

==================================================
43. IMPORTANT
==================================================

Start by analyzing the attached API documentation and the attached visual reference image.

Use the documentation for functionality.

Use the image for visual inspiration.

Do not copy the reference image literally.

Create an original TrashIt design system inspired by its:

- cute characters
- hand-drawn outlines
- doodles
- organic shapes
- expressive movement
- playful composition

but use TrashIt's own warm creamy yellow/brown/orange/black visual identity.

The result should be polished enough to look like a real startup product ready for development.