# Test Structure Documentation
## FE-Teammy Pages Test Suite

This document outlines the complete test structure for all page components in the FE-Teammy project.

---

## 📁 Common Pages

### 1. Discover.test.jsx
**MODULE:** Topic Discovery (Common)  
**FEATURE:** Browse and discover topics with AI-powered suggestions

**Test Requirements:**
- TR-DISC-001: Display available topics with search and filtering
- TR-DISC-002: Provide AI-powered topic suggestions
- TR-DISC-003: Allow users to view topic details
- TR-DISC-004: Handle topic selection and group creation
- TR-DISC-005: Handle API errors and loading states

**Test Cases:** Defined in file with UTC IDs

---

### 2. Forum.test.jsx
**MODULE:** Forum (Common)  
**FEATURE:** Group recruitment and personal collaboration posts

**Test Requirements:**
- TR-FORUM-001: Display group recruitment posts
- TR-FORUM-002: Display individual collaboration posts
- TR-FORUM-003: Provide tab navigation between post types
- TR-FORUM-004: Allow creating recruitment and personal posts
- TR-FORUM-005: Handle post interactions (invite, apply)

**Test Cases:**

#### TC-FORUM-001: Render groups tab with recruitment posts
- **Description:** Verify forum loads and displays group recruitment posts
- **Pre-conditions:** PostService.getRecruitmentPosts returns group posts
- **Procedure:**
  1. Render Forum component
  2. Verify groups tab is active by default
- **Expected Results:**
  - Group recruitment posts are displayed
  - PostService.getRecruitmentPosts called

#### TC-FORUM-002: Switch to individuals tab
- **Description:** Verify switching to personal posts tab
- **Pre-conditions:** PostService.getPersonalPosts returns personal posts
- **Procedure:**
  1. Render Forum component
  2. Click individuals tab
- **Expected Results:**
  - Personal posts are displayed
  - Tab switches correctly

#### TC-FORUM-003: Open create post modals
- **Description:** Verify modal opening for creating posts
- **Pre-conditions:** Modals are mocked
- **Procedure:**
  1. Click create recruitment post button
  2. Click create personal post button
- **Expected Results:**
  - CreatePostModal opens with correct props
  - CreatePersonalPostModal opens

---

### 3. Home.test.jsx
**MODULE:** Home Page (Common)  
**FEATURE:** Landing page with hero section and profile completion

**Test Requirements:**
- TR-HOME-001: Display hero section for new users
- TR-HOME-002: Display features section
- TR-HOME-003: Prompt incomplete profiles to complete information
- TR-HOME-004: Handle profile completion workflow
- TR-HOME-005: Redirect authenticated users appropriately

**Test Cases:**

#### TC-HOME-001: Initial page render
- **Description:** Verify home page loads with hero and features
- **Pre-conditions:** User visits home page
- **Procedure:** Render Home component
- **Expected Results:**
  - Hero section visible
  - Features section visible
  - No modal shown for unauthenticated users

#### TC-HOME-002: Show profile completion modal for incomplete students
- **Description:** Verify modal appears for students with incomplete profiles
- **Pre-conditions:** Student user with skillsCompleted = false
- **Procedure:** Render Home with incomplete student profile
- **Expected Results:**
  - Complete profile modal is displayed
  - User can interact with modal

#### TC-HOME-003: No modal for completed profiles
- **Description:** Verify modal doesn't show for completed profiles
- **Pre-conditions:** Student with skillsCompleted = true
- **Procedure:** Render Home with completed profile
- **Expected Results:**
  - No modal displayed
  - Normal page rendering

#### TC-HOME-004: No modal for non-student roles
- **Description:** Verify modal only shows for students
- **Pre-conditions:** User with admin/mentor/moderator role
- **Procedure:** Render Home with non-student role
- **Expected Results:**
  - No modal shown regardless of completion status

---

### 4. Login.test.jsx
**MODULE:** Authentication (Common)  
**FEATURE:** User login with Google OAuth

**Test Requirements:**
- TR-AUTH-001: Provide Google authentication
- TR-AUTH-002: Handle successful login and token storage
- TR-AUTH-003: Redirect users based on role after login
- TR-AUTH-004: Handle authentication errors
- TR-AUTH-005: Display loading state during authentication

**Test Cases:**

#### TC-AUTH-001: Display login page
- **Description:** Verify login page renders with Google button
- **Pre-conditions:** User not authenticated
- **Procedure:** Render Login component
- **Expected Results:**
  - Teammy branding visible
  - Google login button visible

#### TC-AUTH-002: Successful student login
- **Description:** Verify student login redirects to home
- **Pre-conditions:** Google auth succeeds with student role
- **Procedure:**
  1. Click Google login button
  2. Wait for authentication
- **Expected Results:**
  - Success notification shown
  - Redirects to "/"
  - loginGoogle called

#### TC-AUTH-003: Role-based navigation
- **Description:** Verify different roles redirect appropriately
- **Pre-conditions:** Google auth succeeds with specific role
- **Procedure:**
  1. Login as admin/mentor/moderator
  2. Verify navigation
- **Expected Results:**
  - Admin → /admin/dashboard
  - Mentor → /mentor/dashboard
  - Moderator → /moderator/dashboard

#### TC-AUTH-004: Handle authentication errors
- **Description:** Verify error handling during login
- **Pre-conditions:** Google auth fails
- **Procedure:** Click Google login, auth fails
- **Expected Results:**
  - Error notification shown
  - No navigation occurs
  - User stays on login page

---

### 5. Profile.test.jsx
**MODULE:** User Profile (Common)  
**FEATURE:** View and edit user profile information

**Test Requirements:**
- TR-PROF-001: Display user profile information
- TR-PROF-002: Allow profile editing for own profile
- TR-PROF-003: Display profile statistics and activities
- TR-PROF-004: Handle loading states during data fetch
- TR-PROF-005: Handle missing or incomplete profile data

**Test Cases:**

#### TC-PROF-001: Display loading state
- **Description:** Verify loading placeholder during fetch
- **Pre-conditions:** Profile data fetch is delayed
- **Procedure:** Render component, observe loading
- **Expected Results:**
  - LoadingState placeholder visible
  - No profile data shown

#### TC-PROF-002: Render profile successfully
- **Description:** Verify profile displays after fetch
- **Pre-conditions:** UserService returns valid profile
- **Procedure:** Render component, wait for data
- **Expected Results:**
  - Profile name displayed
  - Profile information visible

#### TC-PROF-003: Show edit button for own profile
- **Description:** Verify edit button appears for current user
- **Pre-conditions:** Viewing own profile
- **Procedure:** Render profile page
- **Expected Results:**
  - Edit button rendered
  - Button is clickable

#### TC-PROF-004: Open edit modal
- **Description:** Verify clicking edit opens modal
- **Pre-conditions:** Edit button available
- **Procedure:** Click edit button
- **Expected Results:**
  - Modal state set to open
  - Edit modal displayed

---

### 6. MyGroup.test.jsx
**MODULE:** Group Detail (Common)  
**FEATURE:** Comprehensive group management and workspace

**Test Requirements:**
- TR-MYGR-001: Display group details and information
- TR-MYGR-002: Provide tabbed navigation (Overview, Members, Files, Workspace)
- TR-MYGR-003: Display and manage group members with roles
- TR-MYGR-004: Handle file uploads and downloads
- TR-MYGR-005: Integrate Kanban workspace
- TR-MYGR-006: Enforce permissions based on user role
- TR-MYGR-007: Handle group operations (leave, kick, transfer)
- TR-MYGR-008: Handle loading and error states

**Test Cases (72 total):**
- UTC01-UTC10: Basic group loading, tabs, and data display
- UTC11-UTC20: API integration, member management
- UTC21-UTC30: Topic, skills, and mentor display
- UTC31-UTC40: Advanced member operations, file management
- UTC41-UTC50: Form validation and edit workflows
- UTC51-UTC60: Group operations (transfer leader, validation)
- UTC61-UTC72: Kanban integration, workspace sub-tabs, task management

**Key Features Tested:**
- Full CRUD operations on group
- Member role management (kick, assign role, transfer leader)
- File upload/download
- Workspace integration with Kanban, Backlog, Milestones, Reports, List views
- Form validation and error handling
- Progress tracking and statistics

---

### 7. MyGroups.test.jsx
**MODULE:** My Groups List (Common)  
**FEATURE:** List and manage user's groups

**Test Requirements:**
- TR-MYGRPS-001: Display all user's groups
- TR-MYGRPS-002: Provide filtering and search
- TR-MYGRPS-003: Show group statistics
- TR-MYGRPS-004: Handle group creation
- TR-MYGRPS-005: Manage group applications

**Test Cases (53 total):**
- UTC01-UTC10: Basic rendering, tabs, modals, stats
- UTC11-UTC20: Applications, invitations, role badges
- UTC21-UTC30: Mobile views, skills rendering, edge cases
- UTC31-UTC40: Progress bars, role translations, empty states
- UTC41-UTC53: Skill colors (frontend, backend, mobile, devops), member avatars, overflow indicators

**Key Features Tested:**
- Groups tab with cards, stats, and role indicators
- Applications tab with approve/reject actions
- Invitations management
- Skill badge rendering with color coding
- Member avatar displays with overflow (+N) indicators
- Progress bar visualization
- Empty states and loading skeletons

---

### 8. Workspace.test.jsx
**MODULE:** Workspace (Common)  
**FEATURE:** Kanban board and task management

**Test Requirements:**
- TR-WORK-001: Display Kanban board with columns and tasks
- TR-WORK-002: Support drag-and-drop task movement
- TR-WORK-003: Provide ListView alternative view
- TR-WORK-004: Allow task creation, editing, and deletion
- TR-WORK-005: Manage columns (create, edit, delete)
- TR-WORK-006: Handle task assignments and metadata
- TR-WORK-007: Integrate with board service
- TR-WORK-008: Handle loading and error states

**Test Cases (34 total):**
- UTC01-UTC10: Basic rendering, view switching, groupId handling, task modals
- UTC11-UTC20: Column creation, task creation, view toggle, filters, tabs
- UTC21-UTC30: Empty states, search, task count, groupId fallback, CRUD operations
- UTC31-UTC34: Comments (add, update, delete), assignees, task modal lifecycle

**Key Features Tested:**
- Kanban view with drag-and-drop
- ListView with filtering and search
- Task CRUD operations
- Column management
- Task comments system
- Task assignee management
- Overview, team members, files tabs
- Loading and error states
**Test Cases (20 total):**
- UTC01-UTC10: Initial mount, conversation rendering, group chats, selection, mobile UI, DM creation, mentor routes
- UTC11-UTC20: Deduplication, type normalization, edge cases (empty/null/whitespace), error handling

**Key Features Tested:**
- Conversation list with DMs and group chats
- Merging and deduplication of conversations
- Mobile responsive back button
- URL parameter-based DM creation
- Mentor-specific filtering (excludes group chats on mentor routes)
- Empty states and loading
- Error handling for API failures
- Type normalization (case-insensitive)


---

### 9. MessagesPage.test.jsx
**MODULE:** Messaging (Common)  
**FEATURE:** Real-time chat and messaging

**Test Requirements:**
- TR-MSG-001: Display conversation list
- TR-MSG-002: Handle real-time message updates
- TR-MSG-003: Send and receive messages
- TR-MSG-004: Support file attachments
- TR-MSG-005: Handle SignalR connection

---

## 📁 Mentor Pages

### 1. Discover.test.jsx (Mentor)
**MODULE:** Mentor Group Discovery  
**FEATURE:** Display and manage groups being mentored and invitations

**Test Requirements:**
- TR-DISC-001: Display groups with progress tracking
- TR-DISC-002: Manage group invitations
- TR-DISC-003: Search and filter capabilities
- TR-DISC-004: Handle API errors

**Test Cases:** 9 test cases (TC-DISC-001 to TC-DISC-009)

---

### 2. GroupDetail.test.jsx (Mentor)
**MODULE:** Mentor Group Detail View  
**FEATURE:** View and monitor group progress in read-only mode

**Test Requirements:**
- TR-GDTL-001: Display group details
- TR-GDTL-002: Tabbed navigation
- TR-GDTL-003: Workspace views
- TR-GDTL-004: Read-only mode enforcement
- TR-GDTL-005: Loading and error states

**Test Cases:** 9 test cases (TC-GDTL-001 to TC-GDTL-009)

---

### 3. MentorDashboard.test.jsx
**MODULE:** Mentor Dashboard  
**FEATURE:** Overview and management of all mentoring groups

**Test Requirements:**
- TR-MDSH-001: Display statistics
- TR-MDSH-002: List groups with status
- TR-MDSH-003: Aggregate data from services
- TR-MDSH-004: Calculate feedback count
- TR-MDSH-005: Navigation
- TR-MDSH-006: Error handling

**Test Cases:** 10 test cases (TC-MDSH-001 to TC-MDSH-010)

---

### 4. MyGroups.test.jsx (Mentor)
**MODULE:** Mentor My Groups  
**FEATURE:** List and manage groups with filtering and search

**Test Requirements:**
- TR-MYGR-001: Display groups with progress
- TR-MYGR-002: Calculate statistics
- TR-MYGR-003: Filter by status
- TR-MYGR-004: Search functionality
- TR-MYGR-005: Fetch progress data
- TR-MYGR-006: Navigation
- TR-MYGR-007: Handle errors

**Test Cases:** 12 test cases (TC-MYGR-001 to TC-MYGR-012)

---

## 🎯 Test Case Format

Each test case follows this structure:

```javascript
test("TC-{MODULE}-{NUM} [{N|B}] {Description}", async () => {
  // Test Requirement: TR-{MODULE}-{NUM}
  // Pre-condition: {What must be true before test}
  
  // Procedure: {Step-by-step actions}
  
  // Expected: {What should happen}
});
```

**Legend:**
- `[N]` = Normal/Positive test case
- `[B]` = Boundary/Edge case test
- `TR-` = Test Requirement
- `TC-` = Test Case

---

## 📊 Coverage Summary

| Module/File | Test Cases | Lines | Requirements |
|-------------|------------|-------|--------------|
| **Common Pages** | | | |
| Discover.test.jsx | 20+ | 953 | TR-DISC-001 to TR-DISC-005 |
| Forum.test.jsx | 25+ | 845 | TR-FORUM-001 to TR-FORUM-005 |
| Home.test.jsx | 10+ | 275 | TR-HOME-001 to TR-HOME-005 |
| Login.test.jsx | 10 | 300 | TR-AUTH-001 to TR-AUTH-005 |
| Profile.test.jsx | 8 | 225 | TR-PROF-001 to TR-PROF-005 |
| MyGroup.test.jsx | **72** | 2,630 | TR-MYGR-001 to TR-MYGR-008 |
| MyGroups.test.jsx | **53** | 1,201 | TR-MYGRPS-001 to TR-MYGRPS-005 |
| Workspace.test.jsx | **34** | 1,248 | TR-WORK-001 to TR-WORK-008 |
| MessagesPage.test.jsx | **20** | 563 | TR-MSG-001 to TR-MSG-005 |
| **Subtotal Common** | **252** | **8,240** | **43** |
| | | | |
| **Mentor Pages** | | | |
| Discover.test.jsx | 9 | 389 | TR-DISC-001 to TR-DISC-004 |
| GroupDetail.test.jsx | 9 | 354 | TR-GDTL-001 to TR-GDTL-005 |
| MentorDashboard.test.jsx | 10 | 383 | TR-MDSH-001 to TR-MDSH-006 |
| MyGroups.test.jsx | 12 | 402 | TR-MYGR-001 to TR-MYGR-007 |
| **Subtotal Mentor** | **40** | **1,528** | **22** |
| | | | |
| **GRAND TOTAL** | **292** | **9,768** | **65** |

---

## 🔄 Maintenance Notes

1. **Adding New Tests:**
   - Follow the module-based structure
   - Assign unique TR-{MODULE}-{NUM} requirement IDs
   - Assign unique TC-{MODULE}-{NUM} test case IDs
   - Include all required sections (Pre-conditions, Procedure, Expected Results)

2. **Updating Tests:**
   - Update both the test file and this documentation
   - Maintain backward compatibility with existing test IDs
   - Document any breaking changes

3. **Test Naming Convention:**
   - Use descriptive test names
   - Include [N] for normal cases, [B] for boundary cases
   - Reference requirement IDs in comments

---

**Last Updated:** December 15, 2025  
**Maintained By:** Test Suite Team
