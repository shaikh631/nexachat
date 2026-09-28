/**
 * NexaChat NLP Response Generator
 * Produces rich ChatGPT-style Markdown responses
 */

export function generateResponse({ text, intent, entities = [], user = null }) {
  const userName = user?.name ? user.name : 'there';
  const lowerText = text.toLowerCase().trim();

  // Handle specific requirement: "Hello, can you help me?"
  if (lowerText.includes('hello, can you help me') || lowerText.includes('can you help me')) {
    return `Hello! 👋 Of course. I'm here to help. What would you like to know today? You can ask me about:

- **Coding & Web Development** (React, Express, Mongoose, Node.js, Tailwind CSS)
- **Database Systems & Architecture** (MongoDB, NoSQL, Schemas, Models)
- **Application Capabilities** & architecture of NexaChat
- **General knowledge, explanations, and concepts**
- **Drafting content, summaries, or structured tables**`;
  }

  // 1. GREETING
  if (intent === 'greeting') {
    const greetings = [
      `Hello ${userName}! 👋 I'm **NexaChat**, your AI assistant. How can I help you today?`,
      `Hi ${userName}! Great to see you. What topic or coding question shall we dive into?`,
      `Hey ${userName}! 👋 I'm ready to assist. Feel free to ask a question, request code, or explore ideas.`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2. INTRODUCTION
  if (intent === 'introduction') {
    return `### Hello! I am **NexaChat** 🤖

I am an intelligent, production-quality AI chatbot application built with a modern full-stack architecture.

#### Key Features:
* **Interactive Markdown Rendering**: Complete support for formatted text, blockquotes, lists, tables, and code snippets.
* **Syntax Highlighting & Copy**: Instant one-click copy for code blocks.
* **Modular NLP Core**: Built-in tokenization, entity extraction, intent classification, and streaming response generation.
* **Full Persistence**: Secure authentication, MongoDB chat storage, search, and conversation management.

How can I assist you with your projects today?`;
  }

  // 3. HELP & CAPABILITIES
  if (intent === 'help') {
    return `### How Can I Help You Today? 🚀

Here are some of the things you can do with **NexaChat**:

| Feature Category | Examples & Capabilities |
| :--- | :--- |
| **Code Generation** | Write Mongoose schemas, React hooks, Node.js REST APIs |
| **Technical Explanations** | Explain LeetCode, MongoDB, REST APIs, JWT, CSS Flexbox |
| **Data Formatting** | Convert text into Markdown tables, bullet lists, or summaries |
| **App Guidance** | Learn how NexaChat manages sessions, NLP, and MongoDB storage |

> **Pro Tip**: You can edit any message you've sent or click **Regenerate** to refine a response at any time!`;
  }

  // 4. THANKS
  if (intent === 'thanks') {
    return `You're very welcome, ${userName}! 😊 I'm always here if you need further help or have more questions. Happy coding!`;
  }

  // 5. GOODBYE
  if (intent === 'goodbye') {
    return `Goodbye ${userName}! 👋 Have a wonderful day. Come back anytime you'd like to chat or write code!`;
  }

  // 6. LEETCODE & DSA CONCEPT INQUIRIES (Handles typos like "leetocde", "letcode")
  if (lowerText.includes('leetcode') || lowerText.includes('leetocde') || lowerText.includes('dsa') || lowerText.includes('algorithm')) {
    return `### What is LeetCode? 💻

**LeetCode** is a popular online platform used by software engineers and developers to practice coding problems, master **Data Structures & Algorithms (DSA)**, and prepare for technical interviews at companies like Google, Meta, Amazon, Microsoft, and Apple.

#### Key Features of LeetCode:
1. **Problem Library**: Over 3,000+ coding challenges categorized by difficulty: *Easy*, *Medium*, and *Hard*.
2. **Supported Languages**: Python, C++, Java, JavaScript, TypeScript, Go, Rust, and SQL.
3. **Interview Preparation**: Topic-wise study plans (e.g. *Top 150 Interview Questions*, *Dynamic Programming*, *Binary Trees*, *Two Pointers*).

#### Example LeetCode Problem (Two Sum in JavaScript):

\`\`\`javascript
/**
 * LeetCode #1: Two Sum
 * Find indices of two numbers that add up to target
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
\`\`\`

> 💡 **Tip**: Combining LeetCode practice with real-world full-stack projects (like building NexaChat with React & Node.js) is one of the best ways to prepare for software engineering roles!`;
  }

  // 7. PYTHON / PROGRAMMING LANGUAGES INQUIRIES
  if (lowerText.includes('python')) {
    return `### What is Python? 🐍

**Python** is a high-level, interpreted, general-purpose programming language known for its clean syntax, readability, and versatile ecosystem.

#### Key Uses of Python:
1. **Web Development**: Frameworks like Django, Flask, and FastAPI.
2. **Data Science & AI**: Machine Learning with TensorFlow, PyTorch, Scikit-Learn, and Pandas.
3. **Automation & Scripting**: Task automation, web scraping, and system administration.

\`\`\`python
# Simple Python Data Analysis Example
numbers = [10, 20, 30, 40, 50]
average = sum(numbers) / len(numbers)
print(f"Calculated Average: {average}")
\`\`\``;
  }

  // 8. JAVASCRIPT & TYPESCRIPT INQUIRIES
  if (lowerText.includes('javascript') || lowerText.includes('js') || lowerText.includes('typescript')) {
    return `### What is JavaScript? ⚡

**JavaScript** is the core programming language of the Web, enabling interactive user interfaces in frontend browsers and scalable backend servers via Node.js.

#### Core Concepts:
- **Async Programming**: Promises, Async/Await, Event Loop
- **DOM Manipulation**: Modern React, Vue, Angular component state
- **Ecosystem**: NPM packages, TypeScript type safety, Express API backends

\`\`\`javascript
// Asynchronous fetch example
async function fetchUser(userId) {
  const res = await fetch(\`/api/users/\${userId}\`);
  const data = await res.json();
  return data;
}
\`\`\``;
  }

  // 9. MONGODB & DATABASE SPECIFIC INQUIRIES
  if (lowerText.includes('mongo') || lowerText.includes('mongodb') || lowerText.includes('monogodb') || lowerText.includes('nosql')) {
    return `### What is MongoDB? 🍃

**MongoDB** is a popular, open-source, document-oriented **NoSQL database** designed for high volume data storage and high scalability.

Unlike traditional relational SQL databases (like MySQL or PostgreSQL) that store data in tables and rows, MongoDB stores data in flexible, JSON-like format called **BSON** (Binary JSON).

#### Core Concepts of MongoDB:

| MongoDB Term | Equivalent SQL Term | Description |
| :--- | :--- | :--- |
| **Database** | Database | Container for collections |
| **Collection** | Table | Group of MongoDB documents |
| **Document** | Row / Record | Individual BSON document |
| **Field** | Column | Key-value pair within a document |

#### Why Use MongoDB with Node.js & React?
1. **Schema Flexibility**: Documents can have different fields without modifying table structures.
2. **Object Mapping**: JavaScript objects map naturally to BSON documents.
3. **Mongoose ODM**: Provides structured schemas, validation, and middleware for Node.js apps.

\`\`\`javascript
// Mongoose Document Schema Example
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
\`\`\`

> 💡 **In NexaChat**: MongoDB Atlas is used as the primary database layer, paired with Mongoose for data modelling!`;
  }

  // 10. TABLES & SUMMARIES INQUIRIES
  if (lowerText.includes('table') || lowerText.includes('summary') || lowerText.includes('summaries') || lowerText.includes('format')) {
    return `### Formatted Markdown Tables & Summaries 📊

Here is an example of a structured Markdown summary table illustrating web technologies:

| Technology Layer | Framework / Tool | Primary Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Interactive UI & state management |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Backend** | Node.js + Express | REST API routes & SSE streaming |
| **Database** | MongoDB + Mongoose | Data models & document persistence |
| **Security** | JWT + bcryptjs | Token authentication & password hashing |

#### Key Takeaways:
1. **Tables** allow side-by-side comparison of features or methods.
2. **Lists** keep key concepts concise and easy to read.
3. **Formatting** improves readability across dark and light themes.`;
  }

  // 11. CODE HELP & GENERATION
  if (intent === 'code_help' || lowerText.includes('schema') || lowerText.includes('mongoose') || lowerText.includes('code snippet')) {
    if (lowerText.includes('mongoose') || lowerText.includes('schema') || lowerText.includes('model')) {
      return `Here is a complete example of creating a **Mongoose schema** in Node.js:

\`\`\`javascript
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
\`\`\``;
    }

    if (lowerText.includes('react') || lowerText.includes('hook') || lowerText.includes('state')) {
      return `Here is a custom React hook example using **React & Vite**:

\`\`\`jsx
import { useState, useEffect } from 'react';

export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}
\`\`\``;
    }

    return `Here is a practical code example illustrating clean modular structure:

\`\`\`javascript
export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return \`\${Math.floor(diffInSeconds / 60)}m ago\`;
  if (diffInSeconds < 86400) return \`\${Math.floor(diffInSeconds / 3600)}h ago\`;
  return date.toLocaleDateString();
}
\`\`\``;
  }

  // 12. GENERAL QUESTIONS
  if (intent === 'general_questions') {
    if (lowerText.includes('rest api') || lowerText.includes('rest')) {
      return `### What is a REST API? 🌐

**REST** (Representational State Transfer) is an architectural style for designing networked applications.

#### Core REST Principles:
1. **Statelessness**: Every request contains all information needed to process it.
2. **Resource-Based**: URLs represent resources (e.g., \`/api/conversations\`).
3. **Standard HTTP Methods**:

| Method | Usage | Action |
| :--- | :--- | :--- |
| **GET** | Read resource | Retrieve chat messages |
| **POST** | Create resource | Create a new conversation |
| **PATCH** | Update resource | Rename a conversation |
| **DELETE** | Remove resource | Delete a chat log |`;
    }

    if (lowerText.includes('jwt') || lowerText.includes('token')) {
      return `### Understanding JWT (JSON Web Tokens) 🔑

A **JSON Web Token** is a compact, URL-safe means of representing claims to be transferred between two parties.

#### Structure of a JWT:
A token consists of three parts separated by dots (\`.\`):
1. **Header**: Contains algorithm & token type.
2. **Payload**: User identity claims (e.g., \`userId\`, \`email\`).
3. **Signature**: Hash produced by the server's secret key.`;
    }
  }

  // 13. Offline answers for common questions when Gemini is unavailable.
  if (/\b(tcet|thakur college of engineering and technology)\b/i.test(lowerText)
    && /\b(location|located|address|where)\b/i.test(lowerText)) {
    return `### TCET Location 📍

**Thakur College of Engineering and Technology (TCET)** is located in **Thakur Village, Kandivali East, Mumbai, Maharashtra, India**.

For the latest directions, timings, and contact details, check the college's official website or map listing.`;
  }

  if (/\bwhat is ai\b|\bartificial intelligence\b/i.test(lowerText)) {
    return `### What Is AI? 🤖

**Artificial intelligence (AI)** is the field of building computer systems that can perform tasks that usually require human intelligence, such as understanding language, recognizing patterns, reasoning, and making predictions.

Common examples include chat assistants, recommendation systems, image recognition, and fraud detection.`;
  }

  const topicName = text.replace(/^(what is|explain|tell me about|how does|define|show me)\s+/i, '').trim();
  const titleTopic = topicName.charAt(0).toUpperCase() + topicName.slice(1);

  return `I don't have enough offline knowledge to answer **${titleTopic || text}** accurately right now. Gemini is temporarily unavailable, so please try again shortly or add a little more context to your question.`;
}
