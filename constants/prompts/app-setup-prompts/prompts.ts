const SERVER_CONTEXT_PROMPT = `  
Summarize this Rocket.Chat server's purpose using only what the admin states, following these rules:

Valid Response Format:
"This server is for [main purpose]. It will have around [number/group] users, with [formal/casual] communication. People will mostly share [content types]."

Validation Rules:
1. Must contain:
   - Clear purpose (community type/use case)
   - User estimate (number or group size)
   - Communication style
   - Primary content types
2. If any element missing/unclear, return guidance message
3. Group size estimates:
   Family: 5-15 | Team: 10-50 | Company: 50-200 | Public: 10k+
   
Guidance Message Requirements:
- List missing elements as bullet points
- Show 3 varied examples
- Explain components naturally
- Maintain friendly tone

Examples when admin_message_valid is true:  
Admin says: "Family chat with grandparents and cousins"  
Output:  
{
  "response": "This server is for family chats. It will have around 10-15 users, with casual communication. People will mostly share photos and plan events.",
  "admin_message_valid": true
}

Admin says: "Support channel for 10k+ customers"  
Output:  
{
  "response": "This server is for customer support. It will have over 10,000 users, with semi-formal communication. People will mostly ask for help in text.",
  "admin_message_valid": true
}

Examples when admin_message_valid is false:
Admin: "Social space for cat lovers"
Response:
{
  "response": "Please help us understand your server's setup by including:\n\n• Primary purpose (e.g. 'cat lover community')\n• Expected group size (e.g. '50 members' or 'public community')\n• Typical interactions (e.g. 'sharing cat photos')\n• Communication style (casual/formal)\n\nExamples:\n1. 'Company internal chat for 200 employees with formal project discussions'\n2. 'Gaming group for 1000+ members sharing streaming links casually'\n3. 'Family server with 12 relatives planning reunions and photo sharing'",
  "admin_message_valid": false
}

Admin: "Project management"
Response:
{
  "response": "Let's refine your server purpose. Please specify:\n\n🔹 What kind of projects? (e.g. 'software development', 'marketing campaigns')\n🔹 Team size estimate (e.g. '10-person team', 'entire company')\n🔹 Preferred communication style\n🔹 Main content types (documents/tasks/screenshots)\n\nSample complete descriptions:\n- 'App development team of 25 using formal updates and file sharing'\n- 'Casual study group with 8 students sharing notes and videos'\n- '5000+ user open source community discussing bug reports'",
  "admin_message_valid": false
}

Now summarize this:  
###  
{admin_message}  
###  
`;

export function createServerContextPrompt(admin_message: string): string {
    return SERVER_CONTEXT_PROMPT.replace("{admin_message}", admin_message);
}

const PERSONA_RECOMMENDATION_PROMPT = `Act as a user segmentation expert. Analyze the provided context to identify all distinct user personas. For each persona, provide:
    1. Name: A clear, memorable title reflecting their role/relationship.
    2. Description: Concise explanation of their purpose, key interactions, and community relationship.

Format personas as a numbered list using:
1. [Name] - [Description].

Differentiate personas by:
- Familial/social relationships (for private communities)
- Commercial engagement patterns (for platforms)
- Activity specialization (for interest groups)
- Access levels and interaction frequency

Focus on differentiating personas by goals, behaviors, and engagement levels. 
Include internal/external users, contributors, stakeholders, and niche groups implied by the context.
Include both broad categories and niche subgroups implied by context.

Examples of improved context-to-persona mapping:

1. For family/friends private server:
1. Immediate Family - Core members managing household logistics and shared finances.
2. Paternal Relatives - Dad's extended family engaging during cultural events.
3. Maternal Relatives - Mom's side relatives active in holiday gatherings.
4. Childhood Friends - Lifetime friends sharing memories and inside jokes.
5. School Parents - Friends' families coordinating children's activities.
6. Caregiver Circle - Relatives involved in elder care coordination.

2. For e-commerce platform:
1. Boutique Owners - Professional sellers with curated inventories.
2. Garage Sellers - Casual users decluttering personal items seasonally.
3. Flash Sale Hunters - Price-sensitive buyers monitoring deal alerts.
4. Loyalty Members - Frequent shoppers using reward programs.
5. Gift Buyers - Occasional users purchasing for special occasions.
6. B2B Bulk Buyers - Business purchasers acquiring inventory wholesale.

3. For fitness community:
1. Gym Rats - Daily users tracking macros and PRs.
2. New Year Resolvers - Seasonal members needing motivation boosts.
3. Prenatal Group - Expecting mothers following modified workouts.
4. PT Clients - 1:1 coaching participants with custom plans.
5. Retiree Walkers - Seniors focusing on joint health and social walks.
6. Sport Teams - Organized groups training for competitions.

4. For enterprise working on collaboration tool:
1. IT Admins - System configurators managing permissions/security.
2. Power Users - Department leads running complex workflows.
3. Field Staff - Mobile-only users needing offline access.
4. Contractors - Temporary collaborators with limited access.
5. Exec Observers - Leadership monitoring dashboards only.
6. Compliance Team - Auditors reviewing access logs and permissions.

context:  
###  
{context}  
###  
`;

export function createPersonaRecommendationPrompt(context: string): string {
    return PERSONA_RECOMMENDATION_PROMPT.replace("{context}", context);
}

const PERSONA_IDENTIFICATION_PROMPT = `  
Identify community personas from this message following these rules:

Valid Response Format:  
[{persona_name: "...", persona_description: "..."}, ...]

Validation Rules:  
1. Valid ONLY if ALL personas have BOTH name and description  
2. Accepts any formatting that pairs names with descriptions  
3. Invalid if:  
   - Empty message/whitespace-only  
   - Any persona lacks name or description  
   - No discernible persona pairs  
   - Only names without explanations  

Guidance Message Requirements:  
- Clearly state missing elements (names/descriptions)  
- Show 3 format variations for valid input  
- List common persona types with description examples  
- Maintain encouraging tone  

Valid Examples:  
User says: "Team Leads (department heads managing projects) and Project Managers (coordinate timelines)"  
Output:  
{
  "persona_identification_valid": true,
  "response": [
    {
      "persona_name": "Team Leads",
      "persona_description": "Department heads managing projects and team performance"
    },
    {
      "persona_name": "Project Managers",
      "persona_description": "Professionals coordinating project timelines and resources"
    }
  ]
}

User says: "Content Creators: Users posting weekly videos; Moderators: Team reviewing posts"  
Output:  
{
  "persona_identification_valid": true,
  "response": [
    {
      "persona_name": "Content Creators",
      "persona_description": "Users creating and posting weekly video content"
    },
    {
      "persona_name": "Moderators", 
      "persona_description": "Team members reviewing and approving user posts"
    }
  ]
}

Invalid Examples:  
User says: "Admins and Regular Users"  
Output:  
{
  "persona_identification_valid": false,
  "response": "Let's clarify your personas! Please:\n\n• Provide both role names AND descriptions\n• Use any format that pairs names with explanations\n\nExamples:\n1. 'Managers (oversee teams) + Staff (daily operators)'\n2. 'Content Creators: Users producing videos | Subscribers: Viewers watching content'\n3. 'Parents:\tCoordinate activities\nTeachers:\tShare lesson plans'\n\nCommon personas:\n- Customer Support (handle user queries)\n- Beta Testers (test new features)\n- Premium Members (paid subscribers)"
}

User says: "Event Organizers: People planning activities"  
Output: Valid (single complete persona)

User says: "Marketing Team: Plans campaigns || Designers"  
Output:  
{
  "persona_identification_valid": false,
  "response": "Almost there! Please:\n\n• Add description for 'Designers'\n• Ensure all roles have explanations\n\nTry formats like:\n- 'Designers (create visual assets)'\n- 'Technical Support: Troubleshoot user issues'\n- 'Members: Active community participants'"
}

Now analyze this message:  
###  
{user_message}  
###  
`;

export function createPersonaIdentificationPrompt(
    user_message: string
): string {
    return PERSONA_IDENTIFICATION_PROMPT.replace(
        "{user_message}",
        user_message
    );
}

const WELCOME_MESSAGE_RECOMMENDATION_PROMPT = `  
Generate a hyper-personalized welcome message for this exact audience:  

### Rules  
1. **Tone Alchemy**  
   - 🏠 *Family/Friends*: Warm, playful, nicknames ("Hey champ! 👋")  
   - 💻 *Professionals*: Polished, goal-oriented ("Welcome [Role]")  
   - 🎭 *Communities*: Energized, culture-coded ("Greetings, future legends! ✨")  

2. **Emoji Science**  
   | Formality   | Emoji Range | Sample Palette          |  
   |-------------|-------------|-------------------------|  
   | Casual      | 3-5         | 🎉🔥💬👀🍿               |  
   | Semi-Formal | 1-2         | 👋✨📌                   |  
   | Formal      | 0-1         | ✓💼                     |  

3. **Must Include**  
   - A **hook** (inside joke for gamers, milestone for teams)  
   - **Next step** ("Post in #intros", "Review #onboarding")  
   - **Vibe booster** (humor/emoji for casual, value proposition for formal)  

### Live Examples  
▸ Persona: *"dnd-party"*  
Context: *"50-member RPG group, chaotic-funny, campaign planning"*  
→ "Roll for charisma, nerds! 🎲 Your quest: 1) Meme in #tavern-chat 2) Claim your character sheet 📜 3) Prepare for the DM’s cruel twists 😈"  

▸ Persona: *"new-hires"*  
Context: *"Corporate onboarding, 100 users, structured"*  
→ "Welcome to [Company]. Your 30-60-90 plan awaits in #resources. Pro tip: Bookmark the org chart 📁 and join Coffee Chats ☕."  

▸ Persona: *"mom-group"*  
Context: *"Parenting support, 20 users, empathetic"*  
→ "Hey superheroes! 🦸‍♀️ Drop your #sleep-win or #rant in the village square. PSA: Judgment-free zone + secret snack hacks 🍫."  

▸ Persona: *"barista-crew"*  
Context: *"Coffee shop staff chat, 12 users, meme-heavy"*  
→ "Espresso yourself! ☕🔥 Daily mission: 1) Claim your shift in #roaster 2) Drop latte art fails in #showcase 3) Secret code: ‘unicorn’ = free pastry 🦄"  

### Now Generate  
Persona: \`{persona}\`  
Context: \`{context}\`  
→ `;

export function createWelcomeMessageRecommendationPrompt(
    persona: string,
    context: string
): string {
    return WELCOME_MESSAGE_RECOMMENDATION_PROMPT.replace(
        "{persona}",
        persona
    ).replace("{context}", context);
}

const WELCOME_MESSAGE_IDENTIFICATION_PROMPT = `  
Analyze this message to detect or create welcome messages:

**Validation Criteria**  
Mark valid (true) if:  
✅ Contains complete welcome message (quoted or obvious)  
✅ Has clear creation instructions ("Make...", "Draft...")  
✅ Hybrid input ("Here's our message: ... maybe add emojis?")  

Mark invalid (false) if:  
❌ No message/instructions detected  
❌ Only partial elements ("Make it friendly")  
❌ Unrelated content  

**Response Rules**  
- For valid messages: Return EXISTING message verbatim OR CREATE NEW using instructions  
- For invalid cases: Provide guided creation help  

**Examples**  

Valid Case 1 (Existing Message):  
User Input: "Our welcome is: '👋 Hey squad! Post in #intros'"  
Output:  
{
  "response": "👋 Hey squad! Post in #intros",
  "welcome_message_identification_valid": true
}

Valid Case 2 (Creation Instructions):  
User Input: "Create formal message mentioning #onboarding channel"  
Output:  
{
  "response": "Welcome to the team. Please review materials in #onboarding and complete your profile by EOD.",
  "welcome_message_identification_valid": true
}

Invalid Case 1 (No Instructions):  
User Input: "How do channels work?"  
Output:  
{
  "response": "Let's create your welcome message! Include:\n• Greeting style (🎉/formal)\n• Key channels to mention\n• Call-to-action\nExample: 'Welcome [Group]! Start in #main-hub and share your intro 😊'",
  "welcome_message_identification_valid": false
}

Invalid Case 2 (Partial Input):  
User Input: "Make it cooler"  
Output:  
{
  "response": "Help me upgrade your message:\n\n1. Current vibe to enhance? (Friendly/professional)\n2. Add emojis? 🚀/✅/✨\n3. Special features? (Inside jokes/challenges)\nTry: 'Ready to level up? → Original: 'Welcome devs'' → Revised: '👾 Code warriors! Claim your IDE in #setup and conquer bug bounties! 🏆'",
  "welcome_message_identification_valid": false
}

**Processing Logic**  
1. Detect complete messages between quotes/with obvious formatting  
2. Parse creation verbs: make/create/draft + specifications  
3. For hybrid inputs: Extract existing parts + enhance per instructions  
4. Reject non-actionable feedback ("I don't know")  

**Guidance Template for Invalid Cases**  
"Let's craft your welcome message!  
✍️ Required Elements:  
- Group name/reference  
- First action step (#channel)  
- Tone indicator (🎨/💼/🎯)  

💡 Pro Tips:  
• Use 2-3 emojis max for professional spaces  
• Add inside jokes for tight-knit groups  
• Include help links for large communities  

📝 Example Structure:  
'[Greeting] [Group]! [First Action] + [Encouragement] [Emoji]'  

🔥 Sample:  
'Welcome marketing ninjas! 🥷 Claim your tasks in #campaigns and check the meme archive 📂'"  

Now process:  
###  
{user_message}  
###  
`;

export function createWelcomeMessageIdentificationPrompt(
    user_message: string
): string {
    return WELCOME_MESSAGE_IDENTIFICATION_PROMPT.replace(
        "{user_message}",
        user_message
    );
}

const CHANNELS_IDENTIFICATION_PROMPT = `  
Identify communication channels and their purposes from this message following these rules:

Valid Response Format:  
Array of channel objects with name and purpose

Validation Rules:  
1. Valid if BOTH channel names AND purposes are detected  
2. Accepts any separator format: commas, bullets, natural language  
3. Invalid if:  
   - Empty message/only whitespace  
   - No channel names detected  
   - No purpose descriptions  
   - Unclear name-purpose relationships  

Guidance Message Requirements:  
- Explain missing components (names/purposes/both)  
- Show 3 varied formatting examples  
- List common channel purposes  
- Maintain supportive tone  

Examples when channel_identification_valid is true:  
User says: "Frontend (UI discussions) | Backend (API development)"  
Output:  
{
  "channel_identification_valid": true,
  "response": [
    {
      "channel_name": "Frontend",
      "purpose": "UI discussions"
    },
    {
      "channel_name": "Backend", 
      "purpose": "API development"
    }
  ]
}

User says: "announcements-for important updates; qna-for member questions"  
Output:  
{
  "channel_identification_valid": true,
  "response": [
    {
      "channel_name": "announcements",
      "purpose": "important updates"
    },
    {
      "channel_name": "qna",
      "purpose": "member questions"
    }
  ]
}

User says: "Channel1: Project coordination, Channel2: Bug reporting"  
Output:  
{
  "channel_identification_valid": true,
  "response": [
    {
      "channel_name": "Channel1",
      "purpose": "Project coordination"
    },
    {
      "channel_name": "Channel2",
      "purpose": "Bug reporting"
    }
  ]
}

Examples when channel_identification_valid is false:  
User says: "General and Updates"  
Output:  
{
  "channel_identification_valid": false,
  "response": "Let's optimize your channel setup! Please:\n\n• Pair each channel with its specific purpose\n• Clarify how they'll be used\n\nCommon purposes include:\n- Topic-specific discussions\n- Role-based communications\n- Project/Team coordination\n\nExamples:\n1. 'design (UI/UX collaboration), code (technical discussions)'\n2. 'announcements : important updates | support : user help'\n3. 'marketing-team, sales-team, customer-success'"
}

User says: "     "  
Output:  
{
  "channel_identification_valid": false,
  "response": "Welcome! Let's create effective channels:\n\n• What distinct spaces do you need?\n• How should members use each channel?\n• What names would help navigation?\n\nSample formats:\n- 'Channel Name - Purpose Description'\n- 'Name: Purpose, Name: Purpose'\n- 'Name (Purpose) | Name (Purpose)'\n\nExample channels:\n• 'resources (share helpful links)'\n• 'standup-meetings : daily updates'\n• 'feature-requests - collect user suggestions'"
}

User says: "Development and Support"  
Output:  
{
  "channel_identification_valid": false,
  "response": "Help me understand channel purposes:\n\n🔹 What differentiates 'Development' from 'Support'?\n🔹 Should these be split into specific sub-channels?\n🔹 Add purpose clarifications like:\n   - 'Development: Code collaboration & PR reviews'\n   - 'Support: User troubleshooting help'\n\nMore examples:\n- 'design-feedback (collect UI suggestions)'\n- 'backend-ops (database management discussions)'\n- 'client-updates (communicate project milestones)'"
}

Now analyze this message:  
###  
{user_message}  
###  
`;

export function createChannelsIdentificationPrompt(
    user_message: string
): string {
    return CHANNELS_IDENTIFICATION_PROMPT.replace(
        "{user_message}",
        user_message
    );
}

const SERVER_RULE_IDENTIFICATION_PROMPT = `  
Analyze this message to detect or create server rules:

**Validation Criteria**  
Mark valid (true) if:  
✅ Contains complete rule(s) (quoted, numbered, or obvious list)  
✅ Has clear creation instructions ("Add...", "Create rules that...")  
✅ Hybrid input ("Current rule: 'Be respectful' - add no NSFW content")  

Mark invalid (false) if:  
❌ No rules/instructions detected  
❌ Only partial elements ("Make stricter moderation")  
❌ Unrelated content  

**Response Rules**  
- For valid inputs: Return EXISTING rules verbatim OR CREATE NEW from instructions (as array)  
- For invalid cases: Provide guided rule-creation framework  

**Examples**  

Valid Case 1 (Existing Rules):  
User Input: "Rules: 1. No hate speech 2. English only in #general"  
Output:  
{
  "response": ["1. No hate speech", "2. English only in #general"],
  "rule_identification_valid": true
}

Valid Case 2 (Creation Instructions):  
User Input: "Create 3 rules: ban self-promo, require content warnings, enforce profile completion"  
Output:  
{
  "response": [
    "Self-promotion in channels/DMs is prohibited without moderator approval",
    "NSFW/content must use ⚠️ CW tags and spoiler formatting",
    "Complete server profile with bio/roles within 24h"
  ],
  "rule_identification_valid": true
}

Invalid Case 1 (No Instructions):  
User Input: "How do I report users?"  
Output:  
{
  "response": "Let's build your server rules! Include:\n• Core community values\n• Prohibited behaviors\n• Channel-specific guidelines\n• Consequences system\n\nExample framework:\n1. Respect all members (no harassment/discrimination)\n2. Keep #help channel on-topic\n3. No unapproved bot commands\n4. Warnings → Mute → Ban system",
  "rule_identification_valid": false
}

Invalid Case 2 (Partial Input):  
User Input: "Add age restriction"  
Output:  
{
  "response": "Help me formalize this rule:\n\n1. Minimum age requirement? (18+/13+ with parental consent)\n2. Verification method: (Role selection/ID check)\n3. Consequences for violation: (Restricted access/ban)\nExample: 'Users must be 16+ • Verify with 🆔 role • False claims = immediate ban'",
  "rule_identification_valid": false
}

**Processing Logic**  
1. Detect rule lists via numbering/quotes/bullets  
2. Identify rule-creation verbs: add/create/implement + specifications  
3. For hybrids: Preserve existing rules + integrate new ones  
4. Never invent rules beyond user's explicit instructions  

**Guidance Template for Invalid Cases**  
"Build effective rules with this template:  

📜 Required Components:  
- Behavior expectations (language/conduct)  
- Content restrictions (NSFW/spam)  
- Administrative policies (reporting/moderation)  
- Enforcement steps (warnings/bans)  

🔍 Optimization Tips:  
• Phrase positively where possible ('Respect others' vs 'No bullying')  
• Specify channel-specific rules (#chat vs #announcements)  
• Use clear consequence escalation  

💬 Example Structure:  
'[Requirement/Prohibition] + [Rationale] + [Action]'  

⚖️ Sample Rules:  
1. Keep debates constructive in #debate - personal attacks will result in mute  
2. Art shares only in #showcase (no AI-generated work)  
3. 3 unapproved @mentions = 24h timeout'  

Now process:  
###  
{user_message}  
###  
`;

export function createServerRuleIdentificationPrompt(
    user_message: string
): string {
    return SERVER_RULE_IDENTIFICATION_PROMPT.replace(
        "{user_message}",
        user_message
    );
}

const ETIQUETTE_IDENTIFICATION_PROMPT = `  
Analyze this message to detect or create community etiquette guidelines:

**Validation Criteria**  
Mark valid (true) if:  
✅ Contains complete etiquette guidance (quoted/list/structured)  
✅ Has clear creation instructions ("Establish...", "Suggest norms for...")  
✅ Hybrid input ("Our rule is 'Be kind' - add conflict resolution tips")  

Mark invalid (false) if:  
❌ No etiquette/instructions detected  
❌ Only vague suggestions ("Improve manners")  
❌ Unrelated content  

**Response Rules**  
- For valid inputs: Return EXISTING guidelines verbatim OR CREATE NEW from instructions (as array)  
- For invalid cases: Provide cultural scaffolding framework  

**Examples**  

Valid Case 1 (Existing Etiquette):  
User Input: "Etiquette: 1. Use thread replies 2. Ping moderators only in emergencies"  
Output:  
{
  "response": [
    "1. Use thread replies for follow-up questions",
    "2. Ping moderators only in urgent situations"
  ],
  "etiquette_identification_valid": true
}

Valid Case 2 (Creation Instructions):  
User Input: "Create 3 cultural norms: feedback style, response time expectations, off-topic humor"  
Output:  
{
  "response": [
    "Provide constructive feedback using the 'Rose-Thorn-Bud' framework",
    "Respond to direct mentions within 24 hours in non-urgent channels",
    "Keep humor contextual - avoid unrelated memes in serious discussions"
  ],
  "etiquette_identification_valid": true
}

Invalid Case 1 (No Instructions):  
User Input: "What's considered rude here?"  
Output:  
{
  "response": "Let's co-create community norms! Consider:\n• Communication preferences (formality/emoji use)\n• Conflict resolution approaches\n• Cultural sensitivity requirements\n• Timezone awareness\n\nExample framework:\n1. Use content warnings for traumatic topics\n2. Respect 9PM-9AM quiet hours in voice channels\n3. Default to they/them pronouns until specified",
  "etiquette_identification_valid": false
}

Invalid Case 2 (Partial Input):  
User Input: "Add something about debates"  
Output:  
{
  "response": "Help formalize debate etiquette:\n\n1. Preferred structure? (Robert's Rules/Unmoderated)\n2. Sensitive topics to avoid? (Politics/Religion)\n3. Citation standards: (Formal sources/No requirements)\nExample: 'Debates in #discussion must cite 2+ sources • No ad hominem attacks • Triggering topics require ⚠️ CW'",
  "etiquette_identification_valid": false
}

**Processing Logic**  
1. Detect structured guidance via lists/quote blocks  
2. Identify culture-building verbs: establish/normalize/encourage + specifications  
3. Preserve community voice - never impose external value judgments  
4. Flag potential exclusionary language for review  

**Guidance Template for Invalid Cases**  
"Shape inclusive cultural norms with this framework:

🌐 Foundation Layers:  
1. Communication Style: (Formal/casual, emoji policies, thread usage)  
2. Conflict Management: (Call-out vs call-in approaches, mediation processes)  
3. Cultural Awareness: (Pronoun usage, holiday acknowledgments, accessibility needs)  
4. Collaborative Rituals: (Brainstorming protocols, decision-making processes)  

🛠️ Crafting Tips:  
• Use "we" statements for collective responsibility  
• Balance prescriptive vs descriptive norms  
• Include rationale for non-obvious guidelines  
• Add examples for complex expectations  

📘 Sample Etiquette:  
- Present half-baked ideas in #brainstorm (no premature criticism)  
- Celebrate cultural milestones without appropriation (ask about traditions first)  
- Use reaction emojis for agreement rather than repetitive messages  

🔗 Example Structure:  
'[Situation/Context] + [Preferred Behavior] + [Community Benefit]'  

Now process:  
###  
{user_message}  
###  
`;

export function createEtiquetteIdentificationPrompt(
    user_message: string
): string {
    return ETIQUETTE_IDENTIFICATION_PROMPT.replace(
        "{user_message}",
        user_message
    );
}

const USAGE_IDENTIFICATION_PROMPT = `  
Analyze this message to detect or create SERVER-WIDE usage guidelines:

**Validation Criteria**  
Mark valid (true) if:  
✅ Contains server-level governance statements (roles, permissions, global rules)  
✅ Specifies cross-channel coordination protocols  
✅ Defines resource distribution across entire community  

Mark invalid (false) if:  
❌ Only addresses individual channels  
❌ Vague server purpose statements ("For our community")  
❌ No operational guidelines for multi-group coordination  

**Response Rules**  
- For valid inputs: Return EXISTING server rules OR CREATE NEW from instructions  
- For invalid cases: Provide server-governance framework  

**Examples**  

Valid Case 1 (Existing Usage):  
User Input: "Server rules: 1. Role-based channel access 2. Daily backup at 3AM UTC 3. Admin elections quarterly"  
Output:  
{
  "response": [
    "Enforce role-based permissions for channel visibility",
    "Automated daily server backups at 3AM UTC",
    "Quarterly admin elections via #governance-channel"
  ],
  "usage_identification_valid": true
}

Valid Case 2 (Creation Instructions):  
User Input: "Establish: global mod team, monthly server-wide cleanup, VIP access tiers"  
Output:  
{
  "response": [
    "Create cross-server moderation team with #moderation-log",
    "Monthly resource audit every 1st Monday",
    "Tiered access: Member → VIP → Admin"
  ],
  "usage_identification_valid": true
}

Invalid Case 1 (No Instructions):  
User Input: "How should we organize?"  
Output:  
{
  "response": "Let's define server-wide governance!\n\n🌐 Core Components:\n• Member role hierarchy\n• Cross-channel coordination rules\n• Global resource allocation\n• Server maintenance schedule\n\n🔄 Example Framework:\n'Roles: ______\nResource Distribution: ______\nModeration: ______\nEvents: ______'\n\n📌 Sample Usages:\n- Weekly server health checks\n- Role-based channel access tiers\n- Global storage quotas per member\n- Cross-community collaboration protocols",
  "usage_identification_valid": false
}

Invalid Case 2 (Partial Input):  
User Input: "Add server backups"  
Output:  
{
  "response": "Specify server maintenance parameters:\n\n1. Backup scope? (Channels/roles/data)\n2. Frequency? (Daily/weekly)\n3. Retention policy? (30/90/365 days)\nExample: 'Full server snapshot weekly • 90-day retention • Exclude #casual-chat'",
  "usage_identification_valid": false
}

**Processing Logic**  
1. Detect server-level declarations via "server rules"/"global" keywords  
2. Parse governance verbs: establish/enforce/allocate + infrastructure terms  
3. Maintain server boundaries - ignore channel-specific instructions  
4. Flag conflicts with existing server policies  

**Guidance Template for Invalid Cases**  
"Develop server governance with this template:

🌍 Server Architecture:  
- Role Hierarchy: (Member/Mod/Admin permissions)  
- Resource Allocation: (Storage/bandwidth quotas)  
- Event Coordination: (Cross-channel activities)  
- Compliance: (Reporting/audit processes)  

💡 Optimization Tips:  
• Use systemic verbs ("Coordinate X", "Allocate Y", "Maintain Z")  
• Include escalation paths for conflicts  
• Balance autonomy with oversight  
• Define server lifecycle stages  

📋 Sample Usages:  
- Automated role promotions after 30 activity points  
- Server-wide storage cap of 100GB with cleanup alerts  
- Monthly cross-role town halls in #main-stage  

🔍 Structure Formula:  
'[Governance Action] [System Component] [Parameters] [Enforcement]'  

Now process:  
###  
{user_message}  
###  
`;

export function createUsageIdentificationPrompt(user_message: string): string {
    return USAGE_IDENTIFICATION_PROMPT.replace("{user_message}", user_message);
}

const CHECKLIST_IDENTIFICATION_PROMPT = `  
Analyze this message to detect or create procedural checklists:

**Validation Criteria**  
Mark valid (true) if:  
✅ Contains complete checklist items (numbered/bulleted/structured)  
✅ Has explicit creation instructions ("Make checklist for...", "Add steps to...")  
✅ Hybrid input ("Current steps: 1-3 - add password requirements")  

Mark invalid (false) if:  
❌ No checklist/instructions detected  
❌ Only partial elements ("Include safety measures")  
❌ Unrelated content  

**Response Rules**  
- For valid inputs: Return EXISTING items verbatim OR CREATE NEW from instructions (as array)  
- For invalid cases: Provide checklist construction framework  

**Examples**  

Valid Case 1 (Existing Checklist):  
User Input: "Checklist: 1. Enable 2FA 2. Set profile picture 3. Join #announcements"  
Output:  
{
  "response": [
    "1. Enable two-factor authentication",
    "2. Set profile picture",
    "3. Join #announcements channel"
  ],
  "checklist_identification_valid": true
}

Valid Case 2 (Creation Instructions):  
User Input: "Create onboarding checklist: verify email, complete training, submit docs"  
Output:  
{
  "response": [
    "Verify institutional email address",
    "Complete security awareness training",
    "Submit signed NDA and tax forms",
    "Set up direct deposit in payroll portal"
  ],
  "checklist_identification_valid": true
}

Invalid Case 1 (No Instructions):  
User Input: "What's needed for access?"  
Output:  
{
  "response": "Let's build your checklist!\n\n📌 Essential Components:\n• Prerequisite steps\n• Completion criteria\n• Priority order\n• Verification methods\n\n🔧 Example Framework:\n'Before [Action], ensure:\n1. ______\n2. ______\n3. ______\nConfirm with ______'\n\n📋 Sample Checklists:\n- Account Setup: Avatar > 2FA > Bio\n- Content Submission: Draft > Peer Review > Formatting > Publish\n- Incident Response: Log > Assess > Escalate > Document",
  "checklist_identification_valid": false
}

Invalid Case 2 (Partial Input):  
User Input: "Add documentation steps"  
Output:  
{
  "response": "Help specify documentation requirements:\n\n1. Types? (Screenshots/Video walkthroughs)\n2. Format standards? (PDF/MP4)\n3. Storage location? (Drive/CRM)\nExample Checklist Addition:\n'Capture screen recording of issue\nExport as MP4 under 100MB\nUpload to #support with ticket number'",
  "checklist_identification_valid": false
}

**Processing Logic**  
1. Detect checklists via numbering (1./2.) or bullet patterns  
2. Identify procedural verbs: complete/verify/submit + specifications  
3. Maintain atomic steps - split compound tasks automatically  
4. Preserve logical sequence without reordering  

**Guidance Template for Invalid Cases**  
"Build effective checklists with this template:

✅ Checklist Essentials:  
- Action-oriented steps (Imperative verbs)  
- Clear completion criteria  
- Dependency order indicators  
- Required resources/tools  

⚙️ Optimization Tips:  
• Group related tasks into phases  
• Add estimated time per step  
• Include failure prevention checks  
• Specify mandatory vs optional items  

📜 Example Structures:  
Phase-Based:  
'Preparation:  
1. ______  
Execution:  
2. ______  
Verification:  
3. ______'  

Priority-Sorted:  
'CRITICAL:  
- ______  
IMPORTANT:  
- ______'  

🔨 Sample Checklists:  
- Profile Setup: Upload ID > Verify email > Set 2FA > Choose roles  
- Content Approval: Draft in Google Docs > Get 2 reviews > Apply formatting > Post with SEO tags  
- Equipment Return: Wipe data > Package securely > Attach RMA # > Schedule pickup  

Now process:  
###  
{user_message}  
###  
`;

export function createChecklistIdentificationPrompt(
    user_message: string
): string {
    return CHECKLIST_IDENTIFICATION_PROMPT.replace(
        "{user_message}",
        user_message
    );
}

const SERVER_RULE_RECOMMENDATION_PROMPT = `  
Generate unified server rules that serve ALL listed personas simultaneously:  

### Multi-Persona Governance  
1. **Conflict Resolution**  
   - Identify common needs across personas (e.g., both "PT Clients" and "Gym Rats" need respect for fitness journeys)  
   - Create hybrid rules where personas clash (e.g., "School Parents" formality vs. "Childhood Friends" casualness → semi-formal baseline)  

2. **Persona-Specific Channels**  
   | Rule Type          | Format                                |  
   |--------------------|---------------------------------------|  
   | Universal          | "No @everyone outside #announcements"|  
   | Role-Gated         | "#boardroom → Executives only 👔"     |  
   | Cross-Persona      | "Respect all member roles in #general"|  

3. **Tiered Strictness**  
   | Community Size | Enforcement Style                    |  
   |----------------|--------------------------------------|  
   | <50 users      | Gentle reminders, role-modeling     |  
   | 50-500         | Clear warnings + 24h mute           |  
   | 500+           | Automated moderation + 3-strike system|  

### Live Examples  
▸ Personas: *["Immediate Family", "School Parents"]*  
Context: *"25 users, mix of casual/conversational and school logistics"*  
→ Rules:  
1. #family-chat = no school politics 🚫  
2. Event RSVPs finalized 72hrs prior ⏳  
3. Kid photos ONLY in #proud-moments 📸  

▸ Personas: *["Gym Rats", "New Year Resolvers"]*  
Context: *"300 users, fitness community with veterans/beginners"*  
→ Rules:  
1. Zero "before/after" comments without consent 🚷  
2. #beginner-zone has strict no-judgment policy 🛡️  
3. Advanced techniques ONLY in #pro-gym 💪  

▸ Personas: *["Corporate Team", "Freelancers"]*  
Context: *"150 users, hybrid work environment"*  
→ Rules:  
1. Client-sensitive talks → #secure-chat 🔒  
2. Timezone prefixes required for async collab 🌐  
3. Feedback must use sandwich method 🥪 (praise-critique-praise)  

### Generation Constraints  
- **Balancing Act**: Rules must serve ALL personas equally (no persona favoritism)  
- **Context Weaving**: Merge server purpose + persona list + size into coherent rules  
- **Emoji Logic**: Use ONLY if >50% personas are casual/semi-formal  
- **Channel Mapping**: Explicitly protect persona-specific spaces  

### Now Generate  
Personas: \`{personas}\`  
Context: \`{context}\`  
→ `;

export function createServerRuleRecommendationPrompt(
    allPersonas: string,
    context: string
): string {
    return SERVER_RULE_RECOMMENDATION_PROMPT.replace(
        "{personas}",
        allPersonas
    ).replace("{context}", context);
}

const ETIQUETTE_RECOMMENDATION_PROMPT = `  
Design culture-specific etiquette guidelines for harmonious multi-group interaction:  

### Etiquette Architecture  
1. **Cross-Persona Harmony**  
   - 🧩 *Blend*: Identify shared values across personas (e.g., "patience" for both New Parents and Elder Caregivers)  
   - 🚧 *Boundaries*: Flag tense overlaps (e.g., Work Colleagues needing formality vs. Childhood Friends using slang)  

2. **Communication Layers**  
   | Aspect          | Casual Groups                | Professional Groups          |  
   |-----------------|------------------------------|-------------------------------|  
   | Response Time   | "React with 🎮 before typing" | "Acknowledge within 4hrs ⏱️"  |  
   | Tone            | "Roast gently in #memes 🔥"  | "Keep feedback FACTS-based 💡"|  
   | Disagreements   | "Use 🧢/👢 for sarcasm tags" | "Escalate via @mod-team 🚩"   |  

3. **Vibe Guardians**  
   - **Recognition Rituals**: "New members get 5 celebratory GIFs in #intros"  
   - **Taboo Triggers**: "Never mention diets in #body-positive"  
   - **Silent Codes**: "🍿 = drama alert, proceed cautiously"  

### Live Examples  
▸ Personas: *["Immediate Family", "School Parents"]*  
Context: *"Hybrid server: 20 users, casual chats + school logistics"*  
→ Etiquette:  
- Tag debates with #serious (e.g., "Vaccine talk? Add #serious 🩺")  
- Grandma-approved emojis only in #family-updates 👵✅ (🚫🤬)  
- School politics auto-moved to #committee-chamber 🤐  

▸ Personas: *["Gym Rats", "PT Clients"]*  
Context: *"500 users, mix of competitive athletes/newbies"*  
→ Etiquette:  
- #flex-zone requires "NSV" (non-scale victory) context 🏋️♂️💬  
- Beginners may "!veteran" flag posts for simplified explanations 🆘  
- Unwritten rule: Never critique formality without 🔗 tutorial  

▸ Personas: *["Developers", "Non-Tech Stakeholders"]*  
Context: *"Corporate innovation team, 75 users"*  
→ Etiquette:  
- Jargon must include "🌐 Translation:" for business-speak  
- Bug reports require 🚨 priority tags (P1-P4 scale)  
- Silent agreement: Meme Fridays exempt from formality 🕶️  

### Generation Rules  
- **Cultural Weaving**: Etiquette must interlace ALL personas' unspoken norms  
- **Scale Sensitivity**: Small servers → relationship-driven cues; Large → systematic flags  
- **Emoji Semiotics**: Use only if >60% personas are casual/semi-formal  
- **Conflict Airbags**: Build de-escalation into guidelines (e.g., "Add 😶🌫️ to pause heated threads")  

### Now Generate  
Personas: \`{personas}\`  
Context: \`{context}\`  
→ `;

export function createEtiquetteRecommendationPrompt(
    allPersonas: string,
    context: string
): string {
    return ETIQUETTE_RECOMMENDATION_PROMPT.replace(
        "{personas}",
        allPersonas
    ).replace("{context}", context);
}

const USAGE_RECOMMENDATION_PROMPT = `  
Design optimized usage protocols balancing ALL personas' needs:  

### Usage Architecture  
1. **Channel Utilization Matrix**  
| Persona Conflict         | Resolution Strategy                  | Example                          |  
|--------------------------|--------------------------------------|----------------------------------|  
| Competing priorities      | Tiered access windows                | "💼 Execs: #boardroom 8-10AM 🌆" |  
| Mixed formality needs     | Time-gated tone rules                | "😜 Casual Fridays 3-5PM"        |  
| Resource contention       | Role-based quota system              | "Gym Rats: 3 weekly #gains posts"|  

2. **Activity Orchestration**  
- **Peak Hours**: Identify overlapping availability zones  
- **Content Cycles**: Match posting rhythms to persona habits (e.g., parents post evenings 🏙️)  
- **Burnout Guards**: "Mandatory #offline-mode every 6th day"  

3. **Resource Allocation**  
 Shared Assets → Persona-Specific Rules:
- Pinned Messages: Rotate weekly between groups 📌
- Voice Channels: Book via @calendar-bot 24hrs prior 🗓️
- File Storage: Role-based quotas (10GB Execs vs 2GB Members 💾)

### Live Examples  
▸ Personas: *["Night Shift Nurses", "Daytime Admins"]*  
Context: *"Healthcare coordination server, 200 users, 24/7 ops"*  
→ Usage Guide:  
- #critical-alerts bypasses mute settings 🚨  
- Day/Night handoff threads required in #shift-log 📖  
- Voice channels auto-wipe after handoff 🔒  

▸ Personas: *["Gamers", "Stream Viewers"]*  
Context: *"500 users, content creator community"*  
→ Usage Guide:  
- #live-chat locks during streams except subs 🔑  
- Cooldown period: 1hr post-stream for feedback 💬  
- Clip submissions → #highlight-reel ONLY 🎥  

▸ Personas: *["Teachers", "PTA Parents"]*  
Context: *"School district server, 300 users, hybrid formal/casual"*  
→ Usage Guide:  
- #grade-talk → weekdays 7PM-9PM 🕖  
- Emergency @ alerts cost 50 "credit points" 💰  
- Meeting recordings auto-purge after 30 days 🗑️  

### Generation Constraints  
- **Equity Checks**: No persona dominates resources/channels  
- **Temporal Logic**: Sync schedules to real-world patterns (timezones, holidays)  
- **Scalability**: Usage rules must adapt ±20% user growth  
- **Compliance Hooks**: Build natural incentives over punishments  

### Now Generate  
Personas: \`{personas}\`  
Context: \`{context}\`  
   → `;

export function createUsageRecommendationPrompt(
    allPersonas: string,
    context: string
): string {
    return USAGE_RECOMMENDATION_PROMPT.replace(
        "{personas}",
        allPersonas
    ).replace("{context}", context);
}

const CHECKLIST_RECOMMENDATION_PROMPT = `  
Create phased checklists harmonizing ALL personas' requirements:  

### Checklist Architecture  
1. **Persona-Priority Stacking**  
| Stage          | Universal Steps                  | Persona-Specific Additions            |  
|----------------|----------------------------------|----------------------------------------|  
| Pre-Join       | "Read #rules"                    | "Gamers: Set nickname to [Class] 🔮"   |  
| Hour 1         | "Post in #intros"               | "Parents: Pin kid allergies in 🚨"    |  
| Week 1         | "Complete profile"              | "Execs: Verify 2FA 🔒"                |  

2. **Culture Coding**  
- **Verification Rituals**: "React with 🎮 to memes → unlocks #secret-lair"  
- **Progress Gates**: "5 helpful replies = custom flair 🎖️"  
- **Taboo Flags**: "❌ Usernames without role prefixes (@dev_John)"  

3. **Scalability Layers**  
User Count → Checklist Complexity:
- <50: 3 core steps + 1 persona-task
- 50-500: 5 steps + emoji validations ✅
- 500+: Tiered achievements + bot-guided


### Live Examples  
▸ Personas: *["Family", "Caregivers"]*  
Context: *"15 users, medical/family hybrid server"*  
→ Checklist:  
1. [CRITICAL] Set nickname = Name-Role (e.g., "Lisa-Mom") 👩⚕️  
2. Pin emergency contacts to #vault 🔐  
3. Caregivers: Watch safety tutorial 🧑⚕️  
4. Family: Share calendar in #plans 🗓️  

▸ Personas: *["Investors", "Startups"]*  
Context: *"300 users, pitch feedback ecosystem"*  
→ Checklist:  
1. Startups: Add [Industry] to profile tag 📌  
2. Investors: Verify credentials via @KYC-bot 🕵️♂️  
3. All: Complete NDA in #compliance 📄  
4. Unlock #pitch-arena after 3 mentor replies 💬  

▸ Personas: *["Gamers", "Modders"]*  
Context: *"1000 users, game development community"*  
→ Checklist:  
1. Set role color via /role-picker 🎨  
2. Post first meme in #culture-check 😎  
3. Modders: Link GitHub in profile 💻  
4. Gamers: Pass spoiler-quiz 🚫🔥  
5. Unlock #alpha-builds at 50 XP ⚔️  

### Generation Rules  
- **Conflict Mitigation**: Balance checklist urgency across personas (no group dominates steps)  
- **Validation Hooks**: Include bot commands/emoji proofs for completion ✅  
- **Cultural Onboarding**: 1st task must reflect server's core ritual  
- **Time Boxing**: Add deadlines only for compliance/safety steps ⏳  

### Now Generate  
Personas: \`{personas}\`  
Context: \`{context}\`  
→ `;

export function createChecklistRecommendationPrompt(
    allPersonas: string,
    context: string
): string {
    return CHECKLIST_RECOMMENDATION_PROMPT.replace(
        "{personas}",
        allPersonas
    ).replace("{context}", context);
}

// export function createSearchQueryPrompt(
//     location_name: string,
//     city: string,
//     country: string,
//     userMessage: string
// ): string {
//     return TOOL_CALLING_PROMPT.replace(/{location_name}/g, location_name) // Global replacement for {location_name}
//         .replace(/{city}/g, city) // Global replacement for {city}
//         .replace(/{country}/g, country) // Global replacement for {country}
//         .replace(/{user_message}/g, userMessage); // Global replacement for {user_message}
// }

/*
            // ============================ server context ==================================
            const serverContextPrompt = createServerContextPrompt(text);
            const serverContextByLLM = await createTextCompletionGroq(
                http,
                serverContextPrompt
            );
            await sendDirectMessage(read, modify, user, serverContextByLLM);

            const parsedData = JSON.parse(serverContextByLLM);

            const adminMessageValid = parsedData.admin_message_valid;
            const context = parsedData.response;
            */

/*
            // ============================ persona Recommendation ==================================

            const personaRecommendationPrompt =
                createPersonaRecommendationPrompt(text);
            const personaRecommendedByLLM = await createTextCompletionGroq(
                http,
                personaRecommendationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                personaRecommendedByLLM
            );
            */

/*
            const PersonaIdentificationPrompt =
                createPersonaIdentificationPrompt(text);
            const PersonaIdentificationByLLM = await createTextCompletionGroq(
                http,
                PersonaIdentificationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                PersonaIdentificationByLLM
            );

            const persona = "IT Team";
            const context = "This server is for company internal communication, customer support, and community discussions. It will have around 1500 users, with semi-formal communication. People will mostly share project updates, documents, and feedback.";

            const WelcomeMessageRecommendationPrompt =
                createWelcomeMessageRecommendationPrompt(persona, context);
            const WelcomeMessageRecommendationByLLM =
                await createTextCompletionGroq(
                    http,
                    WelcomeMessageRecommendationPrompt
                );
            await sendDirectMessage(
                read,
                modify,
                user,
                WelcomeMessageRecommendationByLLM
            );
            */

/*
            const WelcomeMessageIdentificationPrompt =
                createWelcomeMessageIdentificationPrompt(text);
            const WelcomeMessageIdentificationByLLM =
                await createTextCompletionGroq(
                    http,
                    WelcomeMessageIdentificationPrompt
                );
            await sendDirectMessage(
                read,
                modify,
                user,
                WelcomeMessageIdentificationByLLM
            );
            */

/*
            const ChannelsIdentificationPrompt =
                createChannelsIdentificationPrompt(text);
            const ChannelsIdentificationByLLM = await createTextCompletionGroq(
                http,
                ChannelsIdentificationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                ChannelsIdentificationByLLM
            );
            */

/*
            // ========================================= RECOMMENDATION =========================================

            const context = "This server is for company internal communication, customer support, and community discussions. It will have around 1500 users, with semi-formal communication. People will mostly share project updates, documents, and feedback.";
            const allPersona = "1. IT Team, Team relying on the server for various workflow activities 2. Community, Open-source enthusiasts, GSoC candidates, and FOSS users 3. Partners, Resellers of Rocket.Chat performing sales, support, and liaising with the IT Team 4. Prospects, Individuals exploring Rocket.Chat tool independently or negotiating with the sales team 5. Customers, Paying customers using the server to facilitate communication with Rocket.Chats team";


            const ServerRuleRecommendationPrompt =
                createServerRuleRecommendationPrompt(allPersona, context);
            const ServerRuleRecommendationByLLM =
                await createTextCompletionGroq(
                    http,
                    ServerRuleRecommendationPrompt
                );
            await sendDirectMessage(
                read,
                modify,
                user,
                ServerRuleRecommendationByLLM
            );

            const EtiquetteRecommendationPrompt =
                createEtiquetteRecommendationPrompt(allPersona, context);
            const EtiquetteRecommendationByLLM = await createTextCompletionGroq(
                http,
                EtiquetteRecommendationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                EtiquetteRecommendationByLLM
            );

            const UsageRecommendationPrompt = createUsageRecommendationPrompt(
                allPersona,
                text
            );
            const UsageRecommendationByLLM = await createTextCompletionGroq(
                http,
                UsageRecommendationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                UsageRecommendationByLLM
            );

            const ChecklistRecommendationPrompt =
                createChecklistRecommendationPrompt(allPersona, context);
            const ChecklistRecommendationByLLM = await createTextCompletionGroq(
                http,
                ChecklistRecommendationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                ChecklistRecommendationByLLM
            );
            */

/*
            // ========================================= IDENTIFICATION =========================================

            const ServerRuleIdentificationPrompt =
                createServerRuleIdentificationPrompt(text);
            const ServerRuleIdentificationByLLM =
                await createTextCompletionGroq(
                    http,
                    ServerRuleIdentificationPrompt
                );
            await sendDirectMessage(
                read,
                modify,
                user,
                ServerRuleIdentificationByLLM
            );

            
            const EtiquetteIdentificationPrompt =
                createEtiquetteIdentificationPrompt(text);
            const EtiquetteIdentificationByLLM = await createTextCompletionGroq(
                http,
                EtiquetteIdentificationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                EtiquetteIdentificationByLLM
            );

            const UsageIdentificationPrompt =
                createUsageIdentificationPrompt(text);
            const UsageIdentificationByLLM = await createTextCompletionGroq(
                http,
                UsageIdentificationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                UsageIdentificationByLLM
            );

            const ChecklistIdentificationPrompt =
                createChecklistIdentificationPrompt(text);
            const ChecklistIdentificationByLLM = await createTextCompletionGroq(
                http,
                ChecklistIdentificationPrompt
            );
            await sendDirectMessage(
                read,
                modify,
                user,
                ChecklistIdentificationByLLM
            );
            */
