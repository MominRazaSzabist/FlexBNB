# Messaging System Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] `.env.local` has `NEXT_PUBLIC_API_HOST=http://localhost:8000`
- [ ] Database migrations applied: `python manage.py migrate messaging`
- [ ] At least 2 user accounts created (one guest, one host)
- [ ] At least 1 property listed

---

## 🔧 Setup Steps

### 1. Apply Database Migration
```bash
cd backend/flexbnb_backend
python manage.py migrate messaging
```

Expected output:
```
Applying messaging.0002_message_sender_role... OK
```

### 2. Verify Backend is Running
```bash
# In backend terminal
cd backend/flexbnb_backend
python manage.py runserver
```

Check: http://localhost:8000/api/properties/ should return JSON

### 3. Verify Frontend is Running
```bash
# In frontend terminal
npm run dev
```

Check: http://localhost:3000 should load the app

---

## 👤 Guest Flow Testing

### Test 1: Initiate Conversation from Property Page
**Steps:**
1. Sign in as a guest user
2. Navigate to any property detail page
3. Click "Message Host" button
4. Type a message: "Hi, is this property available next week?"
5. Click Send

**Expected Results:**
- ✅ Message sent successfully
- ✅ Toast notification: "Message sent!"
- ✅ Message appears on the LEFT side
- ✅ Message has "You" label
- ✅ Property name visible in header
- ✅ Host name visible below property

**Backend Logs to Check:**
```
[MESSAGING] ========== CREATE CONVERSATION ==========
[MESSAGING] Guest (sender): guest@example.com
[MESSAGING] Message created successfully!
[MESSAGING] Message sender: guest@example.com [GUEST]
```

### Test 2: View Conversations in Messages Page
**Steps:**
1. Navigate to /Messages
2. Check conversation list

**Expected Results:**
- ✅ Conversation appears in list
- ✅ Property name is BOLD and prominent
- ✅ Property thumbnail image displayed
- ✅ Host name shown as "Host: [name]"
- ✅ Last message preview shown
- ✅ "You:" prefix if last message was from guest

### Test 3: Send Follow-up Message
**Steps:**
1. Click on the conversation
2. Type another message: "Also, do you allow pets?"
3. Click Send

**Expected Results:**
- ✅ Message sent successfully
- ✅ Message appears on LEFT
- ✅ Previous messages still visible
- ✅ Scroll to bottom automatically
- ✅ Property context still visible in header

### Test 4: Receive Host Reply
**Steps:**
1. Have host send a reply (see Host Flow)
2. Wait for polling (5 seconds) or refresh

**Expected Results:**
- ✅ Host message appears on RIGHT side
- ✅ Host message has different color (blue background)
- ✅ Host name shown (not "You")
- ✅ Timestamp displayed
- ✅ Unread count updates in conversation list

### Test 5: Filter Unread Messages
**Steps:**
1. In /Messages, click "Unread" filter
2. Check conversation list

**Expected Results:**
- ✅ Only conversations with unread messages shown
- ✅ Unread count badge visible
- ✅ Badge shows correct number

---

## 🏠 Host Flow Testing

### Test 6: View Guest Messages in Host Dashboard
**Steps:**
1. Sign in as a host user
2. Navigate to Host Dashboard → Guest Messages
3. Check conversation list

**Expected Results:**
- ✅ Page title: "Guest Messages"
- ✅ Subtitle: "Manage inquiries from your guests"
- ✅ Stats cards show correct counts
- ✅ Conversations grouped by property
- ✅ Property header with property name
- ✅ Guest count per property shown
- ✅ Guest avatar displayed

### Test 7: View Conversation Detail
**Steps:**
1. Click on a guest conversation
2. Check chat window

**Expected Results:**
- ✅ Property name in GREEN header
- ✅ Guest name and avatar displayed
- ✅ Guest messages on LEFT (white background)
- ✅ Previous host messages on RIGHT (green background)
- ✅ "Quick Replies" button visible

### Test 8: Send Reply to Guest
**Steps:**
1. Type a reply: "Yes, the property is available! Pets are welcome with a small fee."
2. Click Send

**Expected Results:**
- ✅ Message sent successfully
- ✅ Message appears on RIGHT side
- ✅ Message has green background
- ✅ Message has "You" label
- ✅ Guest receives message (check Guest Flow)

**Backend Logs to Check:**
```
[MESSAGING] send_message called by user: host@example.com
[MESSAGING] Sender: host@example.com [HOST], Receiver: guest@example.com
[MESSAGING] Message created: [id] from host
```

### Test 9: Use Quick Reply
**Steps:**
1. Click "Quick Replies" button
2. Click a quick reply template
3. Verify message appears in input
4. Click Send

**Expected Results:**
- ✅ Quick reply text inserted into input field
- ✅ Can edit before sending
- ✅ Message sends successfully
- ✅ Message marked as quick reply in backend

### Test 10: Switch Between Properties
**Steps:**
1. If host has multiple properties with messages:
2. Scroll through conversation list
3. Click conversations from different properties

**Expected Results:**
- ✅ Conversations clearly grouped by property
- ✅ Property headers visible
- ✅ Switching properties updates chat window header
- ✅ Correct property context always shown

### Test 11: View Mode Toggle
**Steps:**
1. Click "Recent" view mode button
2. Check conversation list
3. Click "By Property" view mode button

**Expected Results:**
- ✅ "Recent" shows ungrouped list with property names
- ✅ "By Property" shows grouped list with headers
- ✅ Both views show all conversations
- ✅ Selection persists when switching

---

## 🔒 Security Testing

### Test 12: Guest Cannot Access Other Conversations
**Steps:**
1. Sign in as Guest A
2. Create conversation with Host for Property 1
3. Note the conversation ID from URL or network tab
4. Sign in as Guest B
5. Try to access Guest A's conversation ID directly

**Expected Results:**
- ✅ Returns 403 Forbidden
- ✅ Error message: "You do not have permission to access this conversation"

**Backend Logs to Check:**
```
[MESSAGING ACCESS CONTROL] ❌ FORBIDDEN: User guestB@example.com is neither guest nor host
```

### Test 13: Host Can Only Access Own Property Conversations
**Steps:**
1. Sign in as Host A (owns Property 1)
2. Guest messages Host A about Property 1
3. Sign in as Host B (owns Property 2)
4. Try to access Host A's conversation

**Expected Results:**
- ✅ Host B cannot see Host A's conversations
- ✅ Conversation list only shows Host B's properties
- ✅ Direct access returns 403 Forbidden

### Test 14: Unauthorized Message Sending
**Steps:**
1. Get a conversation ID between Guest A and Host A
2. Sign in as Guest B
3. Try to send a message in that conversation (via API)

**Expected Results:**
- ✅ Returns 403 Forbidden
- ✅ Error: "You do not have permission to send messages in this conversation"

---

## 🎨 UI/UX Testing

### Test 15: Message Alignment Consistency
**Steps:**
1. View same conversation as guest and host
2. Compare message alignment

**Expected Results:**
- ✅ Guest messages ALWAYS on LEFT (both views)
- ✅ Host messages ALWAYS on RIGHT (both views)
- ✅ Consistent across all conversations
- ✅ Clear visual distinction (color)

### Test 16: Property Context Visibility
**Steps:**
1. Open any conversation
2. Scroll through messages
3. Check header

**Expected Results:**
- ✅ Property name always visible in header
- ✅ Never lose context of which property
- ✅ Property name matches actual property
- ✅ Header stays fixed while scrolling

### Test 17: Responsive Design
**Steps:**
1. Test on mobile viewport (< 768px)
2. Test on tablet viewport (768px - 1024px)
3. Test on desktop viewport (> 1024px)

**Expected Results:**
- ✅ Mobile: Conversation list full width, chat opens as overlay
- ✅ Tablet: Side-by-side layout
- ✅ Desktop: Optimal spacing and readability
- ✅ All buttons accessible
- ✅ No horizontal scroll

### Test 18: Empty States
**Steps:**
1. Sign in as new user with no conversations
2. Navigate to Messages (guest) or Guest Messages (host)

**Expected Results:**
- ✅ Friendly empty state message
- ✅ Icon displayed
- ✅ Helpful text: "Start chatting..." or "Messages will appear..."
- ✅ No errors or broken UI

### Test 19: Loading States
**Steps:**
1. Throttle network to "Slow 3G"
2. Navigate to Messages
3. Click on a conversation

**Expected Results:**
- ✅ Loading spinner while fetching conversations
- ✅ Loading spinner while fetching messages
- ✅ Smooth transitions
- ✅ No flash of empty content

---

## 🔄 Real-Time Updates Testing

### Test 20: Message Polling
**Steps:**
1. Open conversation as guest
2. Have host send a message
3. Wait up to 5 seconds

**Expected Results:**
- ✅ New message appears automatically
- ✅ No page refresh needed
- ✅ Scroll to bottom on new message
- ✅ Unread count updates

### Test 21: Conversation List Polling
**Steps:**
1. Open Messages page
2. Have another user send a message
3. Wait up to 10 seconds

**Expected Results:**
- ✅ Conversation moves to top of list
- ✅ Last message preview updates
- ✅ Unread count increments
- ✅ No page refresh needed

### Test 22: Custom Event Triggering
**Steps:**
1. Open Host Messages page
2. In another tab, have guest send new message
3. Check if conversation list refreshes immediately

**Expected Results:**
- ✅ `conversationCreated` event triggers refresh
- ✅ New conversation appears immediately
- ✅ No need to wait for polling interval

---

## 🐛 Error Handling Testing

### Test 23: Backend Offline
**Steps:**
1. Stop backend server
2. Try to send a message

**Expected Results:**
- ✅ Error toast: "Failed to send message"
- ✅ Console shows network error
- ✅ Helpful error message in console
- ✅ App doesn't crash

### Test 24: Invalid Conversation ID
**Steps:**
1. Try to access conversation with invalid UUID
2. Check response

**Expected Results:**
- ✅ Returns 404 Not Found
- ✅ Error message: "Conversation not found"
- ✅ Graceful error handling

### Test 25: Missing Required Fields
**Steps:**
1. Try to send message without text
2. Try to create conversation without property_id

**Expected Results:**
- ✅ Send button disabled when input empty
- ✅ Backend returns 400 Bad Request
- ✅ Error message: "conversation_id and message are required"

---

## 📊 Data Integrity Testing

### Test 26: Conversation Uniqueness
**Steps:**
1. Guest messages host about Property A
2. Guest messages same host about Property A again
3. Check conversation list

**Expected Results:**
- ✅ Only ONE conversation exists
- ✅ Both messages in same conversation
- ✅ No duplicate conversations created

### Test 27: Message Ordering
**Steps:**
1. Send 5 messages in quick succession
2. Check message order

**Expected Results:**
- ✅ Messages appear in chronological order
- ✅ Oldest at top, newest at bottom
- ✅ Timestamps accurate
- ✅ No messages missing

### Test 28: Unread Count Accuracy
**Steps:**
1. Have host send 3 messages
2. Check guest's unread count
3. Open conversation
4. Check unread count again

**Expected Results:**
- ✅ Unread count shows 3 before opening
- ✅ Unread count shows 0 after opening
- ✅ Messages marked as read in database
- ✅ `read_at` timestamp set

---

## ✅ Final Verification

### Checklist
- [ ] All 28 tests passed
- [ ] No console errors
- [ ] No linter errors
- [ ] Backend logs show correct role assignments
- [ ] Access control working (403 for unauthorized)
- [ ] Messages aligned correctly (guest LEFT, host RIGHT)
- [ ] Property context always visible
- [ ] Real-time updates working
- [ ] UI responsive on all devices
- [ ] Empty states and loading states working
- [ ] Error handling graceful

---

## 🚀 Production Readiness

### Before Deploying:
1. ✅ All tests pass
2. ✅ Database migration applied
3. ✅ Environment variables set
4. ✅ CORS configured correctly
5. ✅ Authentication working
6. ✅ Role-based access control verified
7. ✅ Logging configured for production
8. ✅ Error tracking enabled (e.g., Sentry)
9. ✅ Performance tested under load
10. ✅ Security audit completed

---

## 📝 Test Results Template

```
Date: _______________
Tester: _______________

Guest Flow:
- [ ] Test 1: Initiate Conversation
- [ ] Test 2: View Conversations
- [ ] Test 3: Send Follow-up
- [ ] Test 4: Receive Reply
- [ ] Test 5: Filter Unread

Host Flow:
- [ ] Test 6: View Guest Messages
- [ ] Test 7: View Conversation
- [ ] Test 8: Send Reply
- [ ] Test 9: Use Quick Reply
- [ ] Test 10: Switch Properties
- [ ] Test 11: View Mode Toggle

Security:
- [ ] Test 12: Guest Access Control
- [ ] Test 13: Host Access Control
- [ ] Test 14: Unauthorized Sending

UI/UX:
- [ ] Test 15: Message Alignment
- [ ] Test 16: Property Context
- [ ] Test 17: Responsive Design
- [ ] Test 18: Empty States
- [ ] Test 19: Loading States

Real-Time:
- [ ] Test 20: Message Polling
- [ ] Test 21: Conversation Polling
- [ ] Test 22: Custom Events

Error Handling:
- [ ] Test 23: Backend Offline
- [ ] Test 24: Invalid ID
- [ ] Test 25: Missing Fields

Data Integrity:
- [ ] Test 26: Conversation Uniqueness
- [ ] Test 27: Message Ordering
- [ ] Test 28: Unread Count

Notes:
_______________________________________
_______________________________________
_______________________________________
```

---

## 🎉 Success Criteria

The messaging system is ready for production when:
- ✅ All 28 tests pass
- ✅ No critical bugs found
- ✅ Performance is acceptable (< 200ms response time)
- ✅ Security verified (no unauthorized access)
- ✅ UX is intuitive (users can complete tasks without help)
- ✅ Code is clean and maintainable
- ✅ Documentation is complete

**Congratulations! You now have a marketplace-grade messaging system! 🎊**

