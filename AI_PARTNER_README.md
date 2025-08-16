# AI English Teacher Partner System

Your Discord bot now includes **Alex**, a personalized AI English teacher who remembers you and adapts to your learning style!

## ✨ Features

### 🤝 Personalized Learning
- **Remembers You**: Alex learns your strengths, weaknesses, interests, and goals
- **Adaptive Teaching**: Lessons adjust to your English level and learning style  
- **Memory System**: Builds on previous conversations and tracks your progress
- **Personal Notes**: Can remember important details about your life and interests

### 📚 Learning Tools
- **Grammar Correction**: Gentle, encouraging feedback with explanations
- **Vocabulary Building**: Word explanations with examples and usage
- **Conversation Practice**: Natural chat with educational insights
- **Cultural Context**: Explains idioms, cultural references, and writing styles

## 🎯 How to Use

### Slash Commands

#### `/partner` - Chat with Alex
```
/partner message:"Hello Alex! I want to practice describing my day"
/partner message:"Can you help me with past tense?" topic:"Grammar Help"
```

**Topic Options:**
- Grammar Help
- Conversation Practice  
- Vocabulary
- Writing Help
- Pronunciation
- Cultural Questions
- General Chat

#### `/profile` - Manage Your Learning Profile

**View Profile:**
```
/profile view
```

**Set Up Profile:**
```
/profile setup level:"Intermediate" goals:"improve conversation, learn business English" interests:"technology, movies, cooking" learning_style:"Visual"
```

**Add Personal Notes:**
```
/profile note:"I'm preparing for a job interview next month"
/profile note:"I struggle with articles (a, an, the)"
```

### 🤝 Emoji Reactions

React to ANY message with these emojis:

- **🤝** - Chat with Alex about the message content
- **✅** - Grammar check and corrections
- **📚** - Explain a word (single word only)
- **💡** - Analyze and explain text
- **🔍** - Search and analyze content/URLs

### Examples

**Grammar Practice:**
```
User: "I am go to store yesterday"
React with ✅
Alex: "Great effort! I can see you're working on past tense. The correct sentence would be: 'I went to the store yesterday.' Here's why..."
```

**Conversation Practice:**
```
/partner message:"I had a difficult day at work. My boss was not happy with my presentation."
Alex: "I'm sorry to hear you had a challenging day! Let's talk about it - this is great practice for expressing feelings in English. Can you tell me more about what happened?"
```

**Word Learning:**
```
User posts: "serendipity"
React with 📚
Alex: "What a beautiful word! 'Serendipity' means finding something wonderful when you weren't looking for it..."
```

## 🧠 AI Partner System Architecture

### System Prompt Structure
- **Teacher Persona**: Warm, patient, encouraging English teacher named Alex
- **Student Profile Integration**: Uses your stored preferences and history
- **Teaching Philosophy**: Builds confidence while gently correcting mistakes
- **Cultural Awareness**: Explains context and real-world usage

### Memory System
- **User Profiles**: Stored locally in `data/user_profiles.json`
- **Conversation History**: Last 20 conversations per user
- **Personal Notes**: Important details you want Alex to remember
- **Learning Progress**: Tracks improvements and areas needing work

### Key Components

**AIPartnerService** (`src/services/aiPartner.ts`):
- Core AI partner functionality
- User profile management
- Conversation memory system
- Personalized prompt generation

**Commands**:
- `src/commands/partner.ts` - Chat interface
- `src/commands/profile.ts` - Profile management

**Integration**:
- Enhanced `reactionHandler.ts` with 🤝 emoji
- Extended `openai.ts` service with partner methods

## 🚀 Getting Started

1. **Deploy Commands:**
   ```bash
   npm run deploy-commands
   ```

2. **Start the Bot:**
   ```bash
   npm run dev
   ```

3. **First Interaction:**
   ```
   /partner message:"Hello Alex! I'm new here."
   ```
   Alex will create your profile automatically and introduce themselves!

4. **Set Up Your Profile:**
   ```
   /profile setup level:"your_level" goals:"your goals" interests:"your interests"
   ```

## 💾 Data Storage

User profiles are stored in `data/user_profiles.json` with:
- Basic info (name, level, goals, interests)
- Learning preferences and style
- Conversation history (last 20 interactions)
- Personal notes and progress tracking
- Usage statistics

## 🎓 Teaching Approach

Alex follows a supportive teaching philosophy:

1. **Encouragement First**: Always acknowledges what you did well
2. **Gentle Correction**: Explains mistakes without being discouraging  
3. **Contextual Learning**: Uses your interests in examples
4. **Progress Building**: References previous conversations
5. **Cultural Insights**: Explains real-world usage and cultural context
6. **Confidence Building**: Celebrates improvements and progress

## 🔒 Privacy

- All data is stored locally on your server
- No user data is sent to external services beyond OpenAI for AI responses
- User profiles are only accessible to the bot owner
- Conversation history is limited to manage privacy and storage

Start chatting with Alex today and experience personalized English learning! 🌟