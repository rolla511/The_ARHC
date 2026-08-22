# Index Audio Artist Entry

MUSIC/TRADING PLATFORM

A local prototype for an artist-first entry point. The product now starts as a subscriber onboarding, rights proof, royalty tracking, and launch support system before becoming a fully self-dependent streaming platform.

Open `index.html` directly in a browser for local-only mode, or run the server runtime:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:3000
```

When served through `arhc-server.mjs`, the app emits events to the backend and persists state in `data/runtime-state.json`.

The Robbie Rolla artist page is available at:

```text
http://127.0.0.1:3000/artist-page.html
```

Deployment split:

- Frontend/static deploy: `artist-page.html`, `artist-page.css`, and `artist-page.js`.
- Backend/API deploy: `arhc-server.mjs`, `package.json`, server runtime modules, `assets/`, `artist-audio/`, and `artist-media/`.
- The public frontend should set the `arhc-api-base` meta tag in `artist-page.html` to the deployed Render API base URL, for example `https://your-arhc-api.onrender.com/api`.
- The backend can set `ARHC_PUBLIC_ORIGIN` to the public frontend origin. If omitted, the prototype allows all origins with `*`.
- Public artist audio, video, and images are served by the backend/API deploy. The frontend resolves server-provided media paths against the Render backend origin.
- Streams remain public and do not require sign-in.
- Stream, replay, link, and download analytics are posted to the Render API.

Render server deploy:

- Server entry file: `arhc-server.mjs`.
- Start command: `npm start`.
- Health check path: `/api/health`.
- Blueprint file: `render.yaml`.
- No `index.mjs` is required for Render because `package.json` points `npm start` to `arhc-server.mjs`.

## Entry Plans

- `$45/year` Platform Access: artist page, music uploads, streaming access, launch dashboard, and support.
- Free Fan/Spectator Access: public basic profile, artist page search, messages, comments, live stream discovery, and tip intent tracking.
- Cloud Space Lease: planned storage/server space for artist live pages, uploads, stream replays, and fan viewing access.
- `$90/year` Index Protection: everything above, plus index searches, audio fingerprint enforcement, off-platform tracking requests, and royalty enforcement workflow.
- `$90/year` or `$10/month` Distribution Desk: release transfer preparation, streaming platform delivery workflow, rights proof review, scan readiness, and distribution license generation.
- `$5.99/month` Promotion Network: local paid performance search for artists, promoters, and venues with location-based matching and alerts.
- Bitcoin Tree Package: in-house wallet records, NFT/drop planning, fan support trees, and vesting projections. This is simulation-only until legal, tax, and compliance review exists.
- `$4,000/year` Business Partner Platform: verified business workspace with a 50-artist managed roster, lobby space, deal proposals, full platform access for roster artists, and Bitcoin Tree services billed separately.

## Core Flow

1. Artist chooses a yearly plan.
2. Artist creates a subscriber profile.
3. Artist configures basic customer/partner permissions, streaming station, monetization, and subscriber content terms.
4. Fan/spectator users create free basic profiles, answer how they wish to be entertained, choose music interests, and receive JVM artist routing.
5. Artist approves ownership attestation and off-platform tracking consent.
6. Artist uploads audio, artwork or visual media, ISRC, optional UPC, platform links, split notes, and ownership proof.
7. The content appears on the index screen.
8. Protection subscribers can log index search and fingerprint enforcement requests.
9. The launch dashboard helps with marketing strategy, artwork direction, rights setup, production workspace planning, distribution, live collaboration, and fan subscription planning.
10. The distribution desk reviews releases before any transfer to outside streaming platforms.
11. The promotion network can match local artists, promoters, venues, genre, radius, audience fit, and paid opportunities.
12. The Bitcoin Tree package lets artists model fan support, NFT/drop plans, and Bitcoin-based campaign projections.
13. Business partners can manage up to 50 contracted artist profiles, create lobby spaces, and request admin-reviewed deals.
14. The support page gives plain-language setup guidance for ISRC, UPC, copyright proof, leases, licenses, campaigns, and package setup.

## Runtime Rules

The server owns the current event rules:

- `jvm.time.updated`: sets the JVM internal clock, timezone, and calendar ledger used for review windows, content lifecycle, and Bitcoin access trade timestamps.
- `subscriber.created`: creates the artist subscriber profile and records the chosen plan.
- `basic.permissions.updated`: saves basic artist customer/partner permissions, monetization, live streaming/radio access, station name, CAPTCHA requirement, and age/content terms.
- `basic.subscription.exchange.requested`: creates a 7-day review request to exchange one included artist subscription for another.
- `fan.profile.created`: creates a free fan/spectator profile with entertainment expectation, public/private visibility, genre interests, and JVM search consent.
- `fan.tip.recorded`: records a fan tip intent against an artist page while the final coin/value/tip/payout math is still pending.
- `fan.artist.access.trade.requested`: records a fan request to buy platform Bitcoin and trade it for artist Bitcoin access before subscribed/private artist content opens.
- `cloud.space.purchased`: records a planned cloud space lease for an artist live page, including buyer username, email, wallet-password setup flag, selected package, and terms.
- `content.submitted`: adds a song/release, marks proof status, and creates an index review request for protection subscribers.
- `content.lifecycle.pinned`: pins or unpins an artist page post, allowing up to 3 pinned posts to remain stored for up to 2 years.
- `content.lifecycle.refreshed`: refreshes a content item date before deletion, restarting its 6-month recent-content cycle or 2-year pinned cycle.
- `tracking.requested`: opens a royalty, index search, or enforcement request.
- `promotion.profile.created`: activates the $5.99/month promotion module profile with GPS consent.
- `promotion.gig.created`: posts a paid performance opportunity.
- `promotion.match.run`: matches profiles against paid gigs by genre, location, and pay.
- `distribution.release.submitted`: creates a distribution release review with billing choice, ISRC, target platforms, proof files, and transfer authority.
- `distribution.review.run`: simulates ISRC and fingerprint review, then generates a distribution license only when proof, authority, scan consent, and ISRC are present.
- `bitcoin.tree.created`: creates an in-house artist wallet record, Bitcoin Tree campaign, NFT/drop plan, and fan vesting setup.
- `bitcoin.projection.run`: calculates a simulated support goal, reward pool, monthly unlock, and supporter count model.
- `partner.created`: creates a verified business partner platform with annual price, terms, lobby, and 50-seat cap.
- `partner.artist.registered`: adds a contracted artist profile to the business roster and creates an internal artist sub-coin record.
- `partner.deal.created`: creates a business-to-artist deal proposal marked for admin review.
- `partner.market.snapshot`: summarizes the internal Awobe Inc. Coin root, artist sub-coins, roster usage, and internal deal value.
- `payment.capture.requested`: records a pending PayPal payment request when runtime or PayPal env is not ready.
- `payment.paypal.order.created`: records a PayPal order, approval URL, payer, billing cycle, wallet state, and market purpose.
- `payment.paypal.capture.verified`: records PayPal capture verification and only then approves the order for ARHC processing.
- `payment.paypal.webhook.received`: records PayPal webhook delivery and optional webhook signature verification.
- `wallet.verification.updated`: records wallet review state before closed-market Bitcoin credit can proceed.
- `runtime.reset`: resets the runtime state back to demo data.

Runtime endpoints:

- `GET /api/health`
- `GET /api/state`
- `GET /api/featured-artists/robbie-rolla`
- `GET /api/public/analytics`
- `POST /api/public/analytics`
- `POST /api/events`
- `POST /api/payments/paypal/create-order`
- `POST /api/payments/paypal/capture-order`
- `POST /api/webhooks/paypal`

## PayPal Payment Capture

The ARHC payment path is PayPal-first. PayPal handles card/payment capture; the ARHC runtime records payment state, wallet verification, and closed-market credit eligibility. The app should not store card numbers.

Required production env:

```bash
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_RETURN_URL=http://127.0.0.1:3000/#billing
PAYPAL_CANCEL_URL=http://127.0.0.1:3000/#billing
```

Order processing rule:

1. `create-order` creates the PayPal order and writes a pending ARHC payment record.
2. The payer approves and pays through PayPal.
3. `capture-order` or a verified `PAYMENT.CAPTURE.COMPLETED` webhook verifies the capture.
4. Only verified capture changes the ARHC payment to `Order Processing Approved`.
5. Closed-market platform Bitcoin or artist Bitcoin credit still waits for wallet verification and the outsourced blockchain/market provider connection.

Recurring billing is not implemented yet. The current form records yearly, monthly, and one-time billing intent while using PayPal Orders for capture. PayPal Subscriptions can be added later for fan month-to-month artist access and annual artist/business renewal billing.

## Robbie Rolla Artist Page

`artist-page.html` is the Robbie Rolla public-facing artist page for deployment testing. It includes:

- Public viewing with no sign-in required.
- Server-controlled featured artist data from `/api/featured-artists/robbie-rolla`.
- Anonymous public analytics through `/api/public/analytics`.
- A generated live-studio hero image at `assets/robbie-rolla-live.png`.
- Artist camera and microphone preview for live-stream readiness.
- Fan chat and song-request interaction.
- Promotional fan lanes for listeners, visual fans, live-room viewers, and direct supporters.
- Recent music cards that target direct server-uploaded audio files.
- Public audio players for streaming with no sign-in required.
- A single featured video player with rotating previews and a menu for selecting one full video.
- Paid download buttons that create PayPal Orders through `/api/payments/paypal/create-order`.
- Tip support through PayPal Orders.

Paid downloads do not unlock from order creation alone. They stay locked until PayPal capture verification is connected through `/api/payments/paypal/capture-order` or a verified PayPal webhook.

Upload Robbie Rolla audio directly into:

```text
artist-audio/robbie-rolla/
```

Current artist page file targets:

- `we-belong-part-1.mp3` - We Belong - ISRC `QT7J52600020`
- `we-belong-part-2-for-wishing.mp3` - For Wishing - ISRC `QT7J52600021`

Current public artist media targets:

- `artist-media/robbie-rolla/robbie-rolla-gy-cover.png`
- `artist-media/robbie-rolla/robbie-rolla-gq-cover-light.png`
- `artist-media/robbie-rolla/robbie-rolla-pool.png`
- `artist-media/robbie-rolla/robbie-rolla-snow.png`
- `artist-media/robbie-rolla/robbie-rolla-beach.png`
- `artist-media/robbie-rolla/robbie-rolla-yacht.png`
- `artist-media/robbie-rolla/robbie-rolla-race.png`
- `artist-media/robbie-rolla/robbie-rolla-richie-case.mov`
- `artist-media/robbie-rolla/robbie-rolla-da-hustlas-prayer.mov`

The server serves common audio types including WAV, MP3, M4A, AAC, FLAC, and OGG. It also supports byte-range requests for server-hosted media, which lets browser audio and video players stream public files directly from the backend.

Tracked public events:

- `page.viewed`
- `fan.path_clicked`
- `link.clicked`
- `stream.link_clicked`
- `stream.started`
- `stream.stopped`
- `stream.played`
- `stream.completed`
- `video.selected`
- `video.played`
- `video.completed`
- `download.payment_started`
- `download.attempted`
- `download.missing_file`
- `download.started`

This tracking is view-only and does not require fan login. The main ARHC application can keep its signup and account flows; the featured artist page stays public unless a later access rule changes it.

Promotional links currently implemented:

- Audiomack: `https://audiomack.com/robbie-rolla/song/becky-gold-edition`
- Amazon Music artist page: `https://music.amazon.com/artists/B0GNS9HWBD/robbie-rolla`
- Amazon Music Tears of Joy: `https://music.amazon.com/albums/B0GPNQGSTW`
- Amazon Music GOT IT: `https://music.amazon.com/albums/B0GPFNR7BC`
- Amazon Music road runner: `https://music.amazon.com/albums/B0GNSGLYGH`

Optional official image upload slots:

- `assets/robbie-rolla-featured-cover.jpg`
- `assets/robbie-rolla-road-runner-cover.jpg`

## JVM Internal Time System

The prototype now has a JVM internal clock instead of relying on each browser/device to decide platform time.

- Runtime mode reads the current state, calculates the event timestamp from JVM internal time, then applies the event.
- Local-only mode uses the same JVM offset and timezone model in browser state.
- The platform can set a timezone such as `America/New_York`, `America/Chicago`, `America/Denver`, `America/Los_Angeles`, or `UTC`.
- The JVM calendar ledger records internal clock changes and labels.
- Content expiration, pinned-post retention, subscription exchange windows, Bitcoin access trade timestamps, review windows, and distribution license IDs should use JVM time.
- The internal clock still advances normally after being set; it stores an offset from the host clock so platform time can move independently of a user's device setting.

## Basic Subscriber Linking Rules

Basic subscriber artists can enter existing ISRC and UPC values at no charge. If they want the platform to link identifiers directly, the action is fee-based:

- Platform ISRC link request: `$1.50`
- Platform UPC link request: `$1.00`
- Both ISRC and UPC link request: `$2.50`

Before platform linking can move forward:

- Ownership, copyright, license, lease, or split proof must be uploaded.
- JVM/runtime review must verify basic proof.
- Unclear proof escalates to admin.
- Audio fingerprint scan must be completed.
- Visual watermark scan must be completed when artwork or visuals are attached.
- Sample usage must be reviewed when reported or detected.

Samples do not automatically disqualify ISRC linking. Public use, public domain, licensed samples, and explained sample usage can continue through review. Distribution licensing is stricter and requires a more detailed explanation plus targeted approval search before the platform issues a distribution authority record.

## Basic Artist Permissions

Basic subscriber artists are creator customer/partners, not full business partners. They can:

- Sell music and receive monetization.
- Set their own artist subscription price.
- Access live video streaming.
- Create a live audio/radio station link.
- Stream their own music through their station.
- Stream music from artists they subscribe to.
- Subscribe to 50 artist pages included with the artist subscription.
- Request a subscription exchange from one artist page to another.

Basic accounts are not eligible for index scanning unless they upgrade. To prevent fraud and subscription hopping, CAPTCHA-style verification is required and subscription exchange requests stay pending for up to 7 days. Any artist subscriptions beyond the included 50 must be paid to the artist being subscribed to.

Basic artists must accept platform subscribers as subscribers. Artists choose who can see their content through profile audience settings and subscription terms.

Content standards:

- Under-18 available profiles: no profanity, no explicit violent content, no nudity, no prostitution promotion, no drug use promotion, and no narcotics sales promotion.
- Subscriber artists under 18: held to the under-18-safe standard across profile, music presentation, artwork, and streams.
- 18+ profiles: no pornography, no full nudity, no repeated sexually explicit streaming, no sexual props/toys, and no sex solicitation or implication of sex-for-pay.

## Fan and Spectator Access

Fans and spectators begin with free basic profiles. Signup and artist subscription are separate. Fan signup includes access to content marked public, public artist page discovery, and public interaction surfaces. Subscribed/private artist access requires the fan to buy platform Bitcoin and request a trade into that artist's Bitcoin access record.

The platform should ask one primary question first: how does the fan wish to be entertained? The answer is paired with checkbox interests such as genre, live performance, radio-style listening, artist conversations, discovery, and support/tipping behavior.

The fan side establishes:

- Public basic entry to artist pages through internal and external search.
- Public-marked content can be viewed after fan signup.
- Artist subscriber content, private rooms, replays, early releases, and gated interaction require artist Bitcoin access.
- Optional public fan profile visibility.
- Profile picture upload for identity confirmation and personal presence so artists can recognize who their fans/spectators are.
- Public messages, comments, live interaction, live stream chat, and live listening access on artist pages.
- No fan/spectator music uploads.
- No fan/spectator self-hosted live streams.
- JVM routing from fan expectations and genre interests to artist pages the fan is likely to prefer watching or listening to.
- Monetization support through free tips and live-stream comments.
- Tips are not trades. A tip can be given freely, paid directly into the artist support ledger, and still add to the artist's value signal.
- A fan can choose the tip cash-out path, where the platform receives a `15%` fee in the current test rule and the artist keeps the rest.
- A fan can choose the artist investment/perks path, where the artist receives platform-managed blockchain perks and artist benefits instead of immediate cash-out. The exact perks are determined by platform management.
- A platform Bitcoin purchase and artist Bitcoin trade path for artist subscription access.
- A cloud-space lease path so artist pages can later buy platform storage for uploads, live pages, replays, and fan viewing access.

Tip and trade math are separate. The tip ledger records free tip value, artist value boost, support path, cash-out rate, payout value, and net value without requiring a coin trade. Artist access trades are separate records where fan dollar base/platform Bitcoin purchase, root value, artist route coin value, artist Bitcoin access amount, and access window are tracked.

Current tip cash-out test rule:

- Platform tip fee: `fan-base tip value * 15%`.
- Artist tip payout: `fan-base tip value - platform tip fee`.
- Investment/perks path payout: `$0` immediate cash-out; value remains in the artist/blockchain benefit ledger until management-defined perks are assigned.

## Artist Page Content Lifecycle

Artist pages should be served as recent active content, not as permanent artist databases or libraries.

- Public/private access can be set for artist page posts, stream replays, and live streams.
- Content marked public is available to signed-up fans through the public artist page experience.
- Private/subscriber content requires the approved artist Bitcoin access trade path.
- Unpinned artist page content is kept for 6 months from its created or refreshed date, then becomes eligible for deletion.
- Artists can refresh a content date before deletion to keep the item active for another 6 months.
- Artists can pin up to 3 posts.
- Pinned posts can be stored for up to 2 years without reuploading.
- Pinned posts can also have their date refreshed before deletion.
- The goal is to keep artists active, encourage fresh creation, and prevent the artist page from turning into a stale permanent library.

## Current Profile Types

The prototype currently has five profile types:

- Artist Subscriber profile.
- Fan/Spectator profile.
- Promotion Network profile for artists, promoters, or venues.
- Business Partner profile.
- Partner Artist/Roster Artist profile.

Basic permissions, content uploads, distribution releases, Bitcoin Trees, cloud space leases, tips, gigs, and deals are records attached to those profiles rather than separate profile types. Every signup/profile form now collects email or username, account password confirmation where applicable, financial wallet password confirmation, and profile terms. Password values are validated in the browser but the prototype stores only configured/not-configured flags; production should hash account passwords, isolate wallet credentials, and use secure authentication.

Artist content intake supports multiple file upload selections for WAV, MP3, MP4 sound files, document files, JPEG images, general artwork/visuals, proof files, split sheets, and video files.

## Plugin Direction

- Production Workspace: audio versions, metadata, collaborators, artwork, lyric sheets, approvals.
- Distribution Desk: smart links, EPK, release scheduler, playlist/blog/radio pitch tracker.
- Distribution Transfer System: release intake, rights proof review, ISRC scan, audio fingerprint check, generated distribution license, platform delivery queue.
- Security and Rights: proof vault, split sheet builder, fingerprint enforcement, dispute requests.
- Fan Tools: subscriber feed, polls, fan messages, top supporters, live sessions, listening parties.
- Monetization: fan subscriptions, tips, paid events, funding goals, replay access, payouts.
- Bitcoin Tree: artist wallet record, NFT/drop plan, fan support tree, vesting projection, marketing campaign funding model.
- Business Partner Platform: $4,000/year partner workspace, 50 artist seats, lobby, deal proposals, admin review, internal market simulation.
- Collaboration Lives: live performances, creative think tanks, co-writing sessions, subscriber Q&A.
- Promotion Network: searchable local artists/promoters, GPS consent, paid gig alerts, booking workflow.

## JVM Tool Search and Artist Matching

JVM should connect artist profiles with promoters, managers, labels, business partners, and other artists instead of leaving every search manual.

- Artist promotion profiles track genre, city, fan count, average views, estimated stage draw, minimum pay, and management/label readiness.
- Promoter show posts track event type, genre, location, pay, expected audience, minimum fan count, and minimum average views.
- JVM show matching scores artist-to-show fit by genre, location, pay, fan count, average views, and stage draw.
- Matched shows are recommended as paid performance income opportunities and artist page promotion moments.
- JVM collaboration matching suggests artists that may work well together for features, co-writing rooms, live sets, shared show bills, and fan-base growth.
- JVM growth-event suggestions recommend events an artist should appear at to build audience, increase views, and promote the artist page.
- JVM business leads route artists seeking management, label review, or contracts toward partner lobbies and admin-reviewed deal workflows.
- Manager, label, and contract leads remain review-only until formal business, legal, and artist acceptance steps exist.

Ideal service plugins for the app/site:

- Identity and Access Plugin: profile signup, username/email login, password reset, terms records, age gates, role permissions.
- Artist Upload Plugin: WAV/MP3/MP4 intake, document proof upload, JPEG/artwork upload, video upload, metadata, file validation, upload review.
- Fan Presence Plugin: spectator profile pictures, identity confirmation, comments, messages, moderation, following, favorites, notifications.
- Live Interaction Plugin: artist-owned live rooms, spectator chat, pinned comments, polls, Q&A, tip prompts, replay access. Spectators interact but do not broadcast.
- JVM Match Plugin: fan expectation intake, genre checkboxes, artist routing, search indexing, recommendation scoring.
- Cloud Space Plugin: artist page storage packages, stream replay storage, bandwidth/CDN accounting, lease billing, storage quotas.
- Wallet and Tip Ledger Plugin: wallet setup, tip intents, source ledger, payout states, fraud checks, statements.
- Coin Root Control Plugin: root coin registry, branch coin issuance, branch-to-root binding, settlement rules, anti-undercut controls, market snapshots.
- Rights and Compliance Plugin: KYC/KYB, wallet compliance, tax forms, securities review, content rules, audit logs.

## Internal Awobe/JGR Bitcoin Method Notice

Plain-text internal method record:

```text
Awobe/JGR Bitcoin Method
Bound creator: Jason GLamount Reeves
Index wrapper: Jason GLamount Reeves Index Wrapper
Use fee for third-party platform owners: 2% of the total sum for use of the Awobe/JGR Bitcoin Method
Fee recipient: Jason GLamount Reeves
Owner platform exemption: Jason GLamount Reeves / Awobe platform is not charged this fee
```

The Awobe/JGR Bitcoin Method notice is an internal/plain-text record, not a public site wrapper. It should not appear on public pages simply because someone accesses public files. The 2% method-use fee applies to other platform owners who choose to use this method, not to Jason GLamount Reeves as the owner of this platform.

Third-party method-use fee:

```text
external platform method use fee = total sum * 2%
```

Example:

```text
total sum = $10,000
method use fee = $10,000 * 2% = $200
fee payable by external platform owner to Jason GLamount Reeves
```

This prototype records the intended internal attribution and external-platform licensing fee rule. Formal ownership, licensing, enforceability, intellectual property protection, and collection rights should be reviewed with qualified legal counsel before public launch or third-party use.

## Rooted Coin Structure

The coin system should be rooted so branch coins cannot detach from the source outlet or be bought out in a way that undercuts the platform. A safer structure is:

- One root source coin controlled by the platform treasury/governance layer.
- Artist branch coins are created by artists but issued from the root, not beside it.
- The purchase value of the root coin or chain/block source becomes the base value for the artist branch/sub-coin.
- Branch base value starts as: `root coin purchase value * base value multiplier`.
- Branch implied internal value starts as: `branch base value * branch coin supply`.
- Every branch coin has a parent root reference, artist reference, supply rule, settlement route, and burn/retire rule.
- Tips and fan purchases settle through the root outlet first, then credit the artist branch ledger.
- Branch coins can represent artist access, support, tips, badges, or internal value, but cannot become independent outside currencies without compliance approval.
- Buyouts should be handled as branch acquisition proposals that require root approval, artist approval, and a lock period. The branch should not transfer away from the root.
- Undercutting controls should include minimum settlement rules, transfer limits, branch freeze/retire rights, fraud review, and source-of-funds checks.

In simple terms: root coin controls issuance, branch coins express artist markets, and payouts flow back through the root outlet so the tree stays connected.

### JVM Settlement Rule

The payout math should be generic and app/runtime controlled so management can tune it without rewriting the product. The current default rule is implemented as `calculateJvmSettlement` in `arhc-app.js` and `arhc-server.mjs`.

A portable copy of the method also exists in `arhc-method.mjs` for use in a separate service or platform. It exports:

- `createMethodNotice`
- `calculateExternalPlatformFee`
- `calculateBranchBase`
- `calculateJvmSettlement`
- `calculateTipSupport`
- `calculateTotalBranchMarketValue`
- `createAssetLeaseRecord`
- `createArtistCoinRecord`

Default rule:

```text
artist route coin value = artist-market side of the trade
fan-base coin value = dollar-backed fan side of the trade
blockchain value before payout = artist route coin value + fan-base coin value
blockchain value after payout = blockchain value before payout * payout ratio
default payout ratio = 0.5
artist payout value = min(fan-base coin value, blockchain value before payout - blockchain value after payout)
retained artist market value = artist route coin value
```

This means the artist coin can increase in market value inside the blockchain, while the fan-base side tracks real dollar-backed value. Before payout, the blockchain records the total trade expression. After payout, the chain retains half the sum by default, and the artist route coin can remain in market circulation.

### Branch Market And Asset Lease Rule

The blockchain should show the total value of all branch/sub-coins:

```text
total branch market value = sum of all branch/sub-coin market values
```

Artist route coins retain market value after payout and can be traded in the fan blockchain market for leased artist assets. Those assets benefit the artist but are owned by the platform.

Asset lease rule:

```text
fan holder trades artist route coin value
artist receives use/benefit/perk from the leased asset
platform owns the leased asset
blockchain records lease value as branch market activity
```

Examples of platform-owned assets that could be leased for artist benefit:

- Cloud storage and live replay space.
- Promotion campaign placement.
- Studio/session time.
- Video production resources.
- Featured artist page placement.
- Equipment or service credits.

The portable `arhc-method.mjs` module includes `calculateTotalBranchMarketValue` for chain-wide branch totals and `createAssetLeaseRecord` for platform-owned artist asset leases.

### Draft Trade Settlement Example

The platform root coin is the source/anchor coin. In the test model it can be set at `$5.00`, but fans do not buy or access the platform root coin directly.

The fan-base coin is dollar-based:

- `$1.00` fan purchase or support equals `$1.00` fan-base coin value.
- Fan-base coin is the cash-backed side of the trade.
- Free tips stay separate from trades and can add artist value without exchange.

The artist route coin is artist-defined:

- The artist can set denomination and perceived route coin value.
- The route coin value is based on entertainment service, content preservation, fan demand, and the artist market.
- Artist route coins can remain in rotation after a fan-base trade.
- Owning platform root coins gives the artist the rooted authority to continue creating artist route coins.

Example:

- Total expressed chain activity: `$10,000`.
- Fan-base coin side: `$5,000` real dollar-backed value.
- Artist route coin side: `$5,000` artist-market value still in rotation.
- Because the total expression is `$10,000` but only `$5,000` is cash-backed, the fan-base side represents half of the displayed market expression.
- If the route coin is settled back through the root chain at a half-value settlement, `$5,000` route coin value can settle as `$2,500` within that chain block.
- With a `$5.00` platform root test value, `$2,500` settlement equals `500` platform-root reference units.

The important rule is that settlement increases the total root-chain value record while the artist route coin can retain artist-market value in circulation. The platform tracks the true dollar-backed fan-base value, the root-chain settlement value, and the artist-route circulation value separately, then redistributes value according to the approved settlement rules.

## Promotion Module Structure

The promotion feature is designed so it can later run independently from the main artist dashboard:

- `Profiles API`: artist, promoter, venue, genre, city, radius, GPS consent.
- `Geo Match API`: location search, complementary genre matching, audience fit, distance.
- `Gig API`: paid opportunity, date, pay, venue, requirements, offer status.
- `Alert API`: notify artists and promoters when a paid performance match appears.
- `Booking API`: accept offer, deposit, confirmation, show completion, payout.

## Distribution Module Structure

Distribution is separate from artist site/app subscription because it affects outside platform credibility and royalty delivery.

- `Release Intake API`: audio master, artwork, ISRC, optional UPC, metadata, target platforms.
- `Rights Review API`: copyright proof, license, lease, split sheet, ownership attestation.
- `Scan API`: ISRC lookup, audio fingerprint readiness, copyright infringement search status.
- `Distribution License API`: generated authority record allowing Index Audio to distribute the release.
- `Transfer Queue API`: future delivery workflow for streaming platforms once legitimate platform connections exist.
- `Royalty Return API`: future monthly reporting once streaming royalties come back from connected platforms.

## Bitcoin Tree Module Structure

The Bitcoin Tree package should remain in-house until it has legal and financial review. The prototype does not create real wallets, custody funds, deploy NFTs, issue tokens, promise returns, or provide financial advice.

- `Wallet Record API`: artist wallet label and optional address placeholder.
- `Root Coin Purchase API`: records root coin purchase value, chain/block source, branch coin symbol, branch supply, and branch base value.
- `NFT Drop API`: asset, campaign description, supporter access terms, ownership language.
- `Fan Tree API`: supporter levels, tree branches, badges, access, and campaign role.
- `Vesting Projection API`: simulated reward pool, vesting period, monthly unlock model.
- `Compliance Review API`: legal review, tax review, risk disclosure, securities check.
- `Settlement API`: future payout/ledger layer only after the legal model is approved.

## Business Partner Module Structure

The business partner model is not an individual merchant model. Businesses are verified platform partners with a managed artist roster.

- `Partner Profile API`: business identity, annual package, terms, lobby name, seat limit.
- `Roster API`: up to 50 contracted artist profiles under one partner platform.
- `Lobby API`: business and artist profile interaction space for deals, campaigns, contracts, and live opportunities.
- `Deal Review API`: proposals stay in admin review before contract activation.
- `Access API`: roster artists can access full platform features except Bitcoin Tree services unless separately reviewed and billed.
- `Internal Market API`: Awobe Inc. Coin is the simulated root coin; roster artist sub-coins are generated internally for planning only.
- `Compliance API`: future legal, securities, tax, KYC/KYB, and risk review before any real internal market activity.

## AI Compatibility

The HTML includes predictable `data-ai-section`, `data-ai-action`, and `data-ai-record` hooks so a ChatGPT or Codex-style helper can understand the workflow:

- `subscriber-signup`
- `fan-spectator-profile`
- `fan-artist-matches`
- `fan-tip-ledger`
- `content-upload`
- `launch-ai-helper`
- `artist-support`
- `promotion-network-signup`
- `paid-performance-opportunity`
- `local-performance-matches`
- `distribution-intake`
- `distribution-release-queue`
- `distribution-license-record`
- `bitcoin-tree-setup`
- `bitcoin-tree-list`
- `bitcoin-vesting-projection`
- `business-partner-onboarding`
- `partner-artist-registration`
- `business-artist-deal`
- `partner-roster`
- `partner-internal-market`
- `create-subscriber`
- `create-fan-profile`
- `record-fan-tip`
- `submit-content`
- `create-promotion-profile`
- `create-paid-gig`
- `create-distribution-release`
- `create-bitcoin-tree`
- `create-business-partner`
- `register-partner-artist`
- `create-deal-proposal`
- `content`
- `fan-artist-match`
- `fan-tip`
- `performance-match`
- `distribution-release`
- `bitcoin-tree`
- `business-partner`
- `partner-artist`
- `partner-deal`

This is still a local prototype. A production version should add secure authentication, real file storage, payment processing, signed consent records, statement imports, payout provider onboarding, rights review queues, auditable enforcement logs, a backend server, geolocation services, notification delivery, live streaming infrastructure, booking/payment ledgers, wallet compliance, blockchain transaction review, partner KYB/KYC, securities review, internal market controls, and fan-facing risk disclosures.
