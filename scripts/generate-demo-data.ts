const DEMO_CONVERSATIONS = [
  // General Knowledge Questions
  {
    user: "What's the weather like today?",
    ai: "I'm an AI assistant and don't have access to real-time weather data. You would need to check a weather service or look outside for current conditions.",
    time: 120,
  },
  {
    user: "Explain quantum computing",
    ai: "Quantum computing is a type of computing that uses quantum phenomena like superposition and entanglement to perform calculations. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or qubits that can exist in multiple states simultaneously.",
    time: 250,
  },
  {
    user: "What are the benefits of meditation?",
    ai: "Meditation offers numerous benefits including stress reduction, improved focus, better emotional regulation, reduced anxiety, better sleep quality, and increased self-awareness. Regular practice can also help with blood pressure control and pain management.",
    time: 180,
  },

  // Programming Questions
  {
    user: "Can you help me with JavaScript?",
    ai: "Of course! I'd be happy to help you with JavaScript. What specific aspect would you like to learn about? I can help with basics like variables and functions, or more advanced topics like promises and async/await.",
    time: 80,
  },
  {
    user: "Write a hello world program",
    ai: "Here's a simple Hello World program in JavaScript:\n\nconsole.log('Hello, World!');\n\nThis will print 'Hello, World!' to the console. You can also do it in HTML with: <script>alert('Hello, World!');</script>",
    time: 100,
  },
  {
    user: "Explain React hooks",
    ai: "React hooks are functions that allow you to use state and other React features in functional components. The most common hooks are useState for managing state, useEffect for side effects, useContext for context API, and useRef for references. They were introduced in React 16.8 to replace class components.",
    time: 200,
  },

  // Creative Tasks
  {
    user: "Write a short poem about spring",
    ai: "Here's a short poem about spring:\n\nBuds unfurling in the light,\nBirds returning from their flight.\nGreen awakens day by day,\nAs winter's chill now fades away.\nSpring whispers promises anew,\nOf life restored and skies of blue.",
    time: 300,
  },
  {
    user: "Give me a recipe for chocolate chip cookies",
    ai: "Here's a basic chocolate chip cookie recipe:\n\nIngredients:\n- 2 1/4 cups flour\n- 1 cup butter\n- 3/4 cup sugar\n- 3/4 cup brown sugar\n- 2 eggs\n- 1 tsp vanilla\n- 1 tsp baking soda\n- 2 cups chocolate chips\n\nMix, form into balls, bake at 375°F for 10 minutes.",
    time: 280,
  },

  // Technical Support
  {
    user: "My internet is not working",
    ai: "Let's troubleshoot your internet connection. First, try these steps:\n1. Restart your router and modem\n2. Check if other devices can connect\n3. Verify WiFi is enabled on your device\n4. Try connecting via ethernet\n5. Contact your ISP if problems persist",
    time: 150,
  },
  {
    user: "How do I reset my password?",
    ai: "To reset your password, typically you would:\n1. Click the 'Forgot Password' link\n2. Enter your email address\n3. Check your email for reset instructions\n4. Create a new strong password\n5. Log in with your new password",
    time: 90,
  },

  // Complex Queries
  {
    user: "Explain how blockchain works",
    ai: "A blockchain is a decentralized, distributed ledger that records transactions across a network of computers. Each block contains transaction data, a timestamp, and a cryptographic hash of the previous block, forming a chain. This structure makes it nearly impossible to alter past records without detection, ensuring data integrity and trust in the system.",
    time: 350,
  },
  {
    user: "What is machine learning?",
    ai: "Machine learning is a branch of artificial intelligence where computers learn from data without being explicitly programmed. It uses statistical techniques to enable systems to improve with experience. Common applications include image recognition, natural language processing, and recommendation systems.",
    time: 280,
  },

  // Quick Questions
  {
    user: "What time is it in Tokyo?",
    ai: "I don't have access to real-time information. To find the current time in Tokyo, you can use a world clock or search engine, or calculate it as UTC+9.",
    time: 60,
  },
  {
    user: "Define photosynthesis",
    ai: "Photosynthesis is the process by which plants convert light energy into chemical energy. They use sunlight, water, and carbon dioxide to produce glucose and oxygen, which is essential for life on Earth.",
    time: 110,
  },

  // Error-Prone Scenarios
  {
    user: "Process this large image",
    ai: "I apologize, but I'm currently experiencing high load. Please try again in a few moments or reduce the image size.",
    time: 500,
    errorProne: true,
  },
  {
    user: "Analyze this complex dataset",
    ai: "I apologize, but I encountered an error while processing your request. The dataset might be too large or complex to process at the moment.",
    time: 450,
    errorProne: true,
  }
];

// Generate timestamps across different hours for better visualization
const generateTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  // Add random minutes and seconds for more natural distribution
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  return date.toISOString();
};

async function insertDemoData() {
  // Generate 48 hours of data with some variation
  for (let hour = 48; hour >= 0; hour--) {
    // Select random conversations for each hour (2-4 conversations per hour)
    const conversationsThisHour = Math.floor(Math.random() * 3) + 2;
    const selectedConversations = [...DEMO_CONVERSATIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, conversationsThisHour);

    for (const conversation of selectedConversations) {
      // Add some random variation to response times (-20% to +20%)
      const variation = 1 + (Math.random() * 0.4 - 0.2);
      const response_time = Math.round(conversation.time * variation);

      // Increase error probability for error-prone scenarios
      const errorProbability = conversation.errorProne ? 0.3 : 0.05;
      const error_type = Math.random() < errorProbability ? 
        ['timeout', 'rate_limit', 'internal_error', 'processing_error', 'validation_error'][Math.floor(Math.random() * 5)] : 
        null;

      const data = {
        user_message: conversation.user,
        ai_response: conversation.ai,
        response_time,
        timestamp: generateTimestamp(hour),
        error_type
      };

      try {
        const response = await fetch('http://localhost:3000/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`Inserted data point for ${data.timestamp}`);
        
        // Add a small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error inserting data:', error);
      }
    }
  }
}

insertDemoData().then(() => {
  console.log('Demo data generation complete!');
}).catch(console.error);
