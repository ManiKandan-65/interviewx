/* ==========================================================================
   INTERVIEWX — QUESTION BANK & ROLE INTELLIGENCE DATA
   ========================================================================== */

const ROLE_INTELLIGENCE = {
    "Java Developer": {
        topics: ["Java Basics", "OOP", "Collections", "Exception Handling", "Multithreading", "SQL", "DBMS", "DSA", "Coding", "Project Questions"],
        checklist: [
            "Java Fundamentals & JVM Architecture",
            "OOP Concepts (Inheritance, Polymorphism, Abstraction, Encapsulation)",
            "Collections Framework (List, Set, Map, HashMap Internal Working)",
            "Exception Handling & Custom Exceptions",
            "Multithreading & Concurrency Utilities",
            "SQL Joins, Subqueries & Indexes",
            "DBMS Normalization (1NF, 2NF, 3NF, BCNF)",
            "Data Structures (Arrays, Linked Lists, Trees, Hash Tables)",
            "Java Coding Problems & Algorithm Practice",
            "System Design & Spring Boot / Microservices Basics"
        ]
    },
    "Frontend Developer": {
        topics: ["HTML", "CSS", "JavaScript", "DOM", "Responsive Design", "Browser Concepts", "API Basics", "Performance", "Projects"],
        checklist: [
            "HTML5 Semantic Tags & Accessibility (a11y)",
            "CSS3 Flexbox, Grid, Animations & Specificity",
            "JavaScript ES6+, Promises, Async/Await & Closures",
            "DOM Manipulation & Event Propagation (Bubbling/Capturing)",
            "Responsive Web Design & Mobile First Patterns",
            "Browser Storage, Event Loop & Rendering Engine",
            "Fetch API, REST & CORS handling",
            "Web Performance Optimization (Lazy Loading, Debouncing)",
            "Frontend Architecture & Component State"
        ]
    },
    "QA / Test Engineer": {
        topics: ["Manual Testing", "SDLC", "STLC", "Test Cases", "Bug Life Cycle", "Automation Basics", "SQL", "API Testing"],
        checklist: [
            "Software Development Life Cycle (SDLC) vs STLC",
            "Black Box vs White Box Testing Techniques",
            "Test Case Design & Boundary Value Analysis",
            "Defect / Bug Life Cycle & Severity vs Priority",
            "Automation Framework Fundamentals (Selenium/Cypress concept)",
            "Database SQL Queries for Data Verification",
            "API Testing using Postman / REST endpoints",
            "Regression, Sanity & Smoke Testing Suites"
        ]
    },
    "Backend Developer": {
        topics: ["REST APIs", "Database Indexing", "Caching", "Server Architecture", "Authentication", "Security", "SQL/NoSQL", "System Design"],
        checklist: [
            "RESTful API Design & HTTP Status Codes",
            "Database Indexing & Query Optimization",
            "Caching Strategies (Redis/Memcached)",
            "Authentication & Authorization (JWT, OAuth2)",
            "Asynchronous Processing & Message Queues",
            "Database Normalization vs Denormalization",
            "Web Security (OWASP Top 10, XSS, CSRF, SQLi)"
        ]
    },
    "Full Stack Developer": {
        topics: ["Frontend UI", "Backend APIs", "State Management", "Async I/O", "Database Schemas", "Deployment", "Security", "System Architecture"],
        checklist: [
            "Full Stack End-to-End Data Flow",
            "Client-Side State Management vs Server State",
            "RESTful & GraphQL API Integration",
            "Relational SQL & NoSQL Database Design",
            "Serverless & Microservices vs Monoliths",
            "CI/CD Pipelines & Containerization Basics"
        ]
    },
    "Data Analyst": {
        topics: ["SQL Joins", "Group By & Aggregations", "Window Functions", "Data Cleaning", "Statistics", "Python/Pandas", "Visualization"],
        checklist: [
            "Advanced SQL (INNER/LEFT/RIGHT Joins, GROUP BY, HAVING)",
            "SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK)",
            "Data Wrangling & Cleaning Techniques",
            "Descriptive & Inferential Statistics",
            "Python Pandas & NumPy Operations",
            "Data Visualization & KPI Dashboard Metrics"
        ]
    },
    "Network Engineer": {
        topics: ["OSI Model", "TCP/IP Protocol", "Subnetting", "Routing Protocols", "DNS", "Firewalls", "VPNs"],
        checklist: [
            "7 Layers of OSI Model & Protocol Mapping",
            "TCP vs UDP Comparison & Handshake Process",
            "IPv4 Subnetting & CIDR Calculation",
            "Routing Protocols (OSPF, BGP, RIP)",
            "DNS Lookup Resolution Flow",
            "Firewall Rules, NAT, and VPN Tunnels"
        ]
    },
    "Support Engineer": {
        topics: ["Troubleshooting Methodology", "Log Analysis", "Linux Commands", "Ticket Lifecycle", "SLA Management"],
        checklist: [
            "Root Cause Analysis & Incident Escalation",
            "Linux Shell Navigation & Log Parsing (grep, awk, tail)",
            "Customer Communication & SLA Handling",
            "HTTP Error Codes & Network Diagnostics (ping, traceroute)",
            "Database Querying for Issue Triage"
        ]
    },
    "Software Engineer": {
        topics: ["Algorithmic Logic", "OOP Design", "System Architecture", "Clean Code", "Data Structures", "Testing"],
        checklist: [
            "Core Data Structures & Algorithm Design",
            "Object Oriented SOLID Design Principles",
            "Code Refactoring & Clean Code Patterns",
            "System Design & Scalability Fundamentals",
            "Unit Testing & Integration Testing Basics"
        ]
    }
};

const QUESTION_BANK = [
    // --- JAVA DEVELOPER / TECHNICAL ---
    {
        id: "java_01",
        role: "Java Developer",
        round: "Core Technical",
        category: "OOP",
        topic: "Java OOP",
        difficulty: "Intermediate",
        question: "Explain the differences between Method Overloading and Method Overriding in Java. Give a clear code example or real-world scenario.",
        expectedAnswer: "Method Overloading happens within the same class with same method name but different parameter list (compile-time polymorphism). Method Overriding happens when a subclass provides a specific implementation of a method defined in its superclass with the exact same signature (runtime polymorphism).",
        keyPoints: [
            "Overloading: Compile-time polymorphism, same class, different signature.",
            "Overriding: Runtime polymorphism, parent-child inheritance, identical signature.",
            "@Override annotation prevents signature mismatch errors."
        ],
        hint: "Think about compile-time vs runtime polymorphism and inheritance requirements.",
        explanation: "Overloading changes parameter count or types in the same class. Overriding rewrites superclass methods in a derived class using @Override.",
        sampleAnswer: "Method Overloading is compile-time polymorphism where multiple methods in the same class share the name but have different parameter types or counts (e.g. add(int, int) vs add(double, double)). Method Overriding is runtime polymorphism where a subclass provides its own implementation of a method inherited from a superclass (e.g. Animal.makeSound() overridden by Dog.makeSound()). Overriding requires the exact same method name, return type, and arguments.",
        learningTopic: "Java OOP Overloading vs Overriding",
        videoSearchQuery: "Java Method Overloading vs Method Overriding Interview Questions"
    },
    {
        id: "java_02",
        role: "Java Developer",
        round: "Core Technical",
        category: "Collections",
        topic: "Java Collections",
        difficulty: "Intermediate",
        question: "How does HashMap work internally in Java? Explain hashing, collisions, and how Java handles them.",
        expectedAnswer: "HashMap uses an array of Node (buckets). It calculates the index using hash(key) % capacity. When two keys hash to the same bucket, a collision occurs. Java handles collisions using a LinkedList for that bucket; from Java 8+, if bucket size exceeds 8 (TREEIFY_THRESHOLD), it converts the LinkedList to a Red-Black Tree for O(log N) lookup.",
        keyPoints: [
            "Calculates bucket index via hash code of the key.",
            "Collisions handled via separate chaining (LinkedList).",
            "Java 8+ converts buckets to Red-Black Tree when collision count > 8.",
            "Requires proper implementation of hashCode() and equals()."
        ],
        hint: "Focus on hash codes, bucket arrays, LinkedLists, and the Java 8 Red-Black Tree threshold.",
        explanation: "HashMap uses hashCode() to locate the array index and equals() to find exact matches inside a bucket. In Java 8, long collision chains turn into balanced trees.",
        sampleAnswer: "Internally, HashMap relies on an array of Node objects. When put(key, value) is called, Java computes hashCode(key) to determine the bucket index. If multiple keys hash to the same index (a collision), Java stores them as a LinkedList in that bucket. In Java 8+, if a bucket's LinkedList grows beyond 8 elements, Java converts it into a Red-Black Tree, improving lookup complexity from O(N) worst-case to O(log N).",
        learningTopic: "Java Collections HashMap Internal Working",
        videoSearchQuery: "Java HashMap Internal Working Explained Interview"
    },
    {
        id: "java_03",
        role: "Java Developer",
        round: "Core Technical",
        category: "Multithreading",
        topic: "Multithreading",
        difficulty: "Advanced",
        question: "What is the volatile keyword in Java? How does it differ from synchronized?",
        expectedAnswer: "The volatile keyword guarantees visibility of changes to variables across threads by forcing reads/writes directly from main memory rather than thread CPU caches. Synchronized provides both visibility AND atomicity/mutual exclusion by acquiring a monitor lock.",
        keyPoints: [
            "volatile ensures main memory visibility, preventing stale CPU cache reads.",
            "volatile does NOT guarantee atomicity for compound operations (e.g. count++).",
            "synchronized guarantees both atomicity and visibility via mutual exclusion locks."
        ],
        hint: "Differentiate CPU thread cache visibility vs atomic mutual exclusion.",
        explanation: "Volatile prevents thread caching issues but does not lock resources. Synchronized blocks concurrent thread access entirely.",
        sampleAnswer: "The volatile keyword in Java ensures visibility: when one thread updates a volatile variable, the new value is immediately written to main memory and visible to all other threads, bypassing CPU cache stores. However, volatile does not guarantee atomicity for compound operations like count++. On the other hand, synchronized provides both mutual exclusion (atomicity) and visibility by locking the code block so only one thread can execute it at a time.",
        learningTopic: "Java Volatile vs Synchronized",
        videoSearchQuery: "Java Volatile vs Synchronized Multithreading Interview"
    },
    {
        id: "java_04",
        role: "Java Developer",
        round: "Core Technical",
        category: "Exception Handling",
        topic: "Exception Handling",
        difficulty: "Beginner",
        question: "What is the difference between Checked and Unchecked Exceptions in Java?",
        expectedAnswer: "Checked exceptions are checked at compile-time and must be either caught using try-catch or declared using throws (e.g. IOException, SQLException). Unchecked exceptions inherit from RuntimeException and occur at runtime (e.g. NullPointerException, ArithmeticException).",
        keyPoints: [
            "Checked: Checked at compile time, inherits Exception, handled explicitly.",
            "Unchecked: RuntimeException subclass, occurs at execution time, usually logic bugs."
        ],
        hint: "Compile-time enforcement vs runtime logic exceptions.",
        explanation: "Checked exceptions enforce error handling during compilation. Unchecked exceptions indicate program logic errors at runtime.",
        sampleAnswer: "Checked exceptions are verified at compile-time by the Java compiler. The developer is forced to either catch them using a try-catch block or declare them in the method signature using 'throws' (examples: IOException, SQLException). Unchecked exceptions extend RuntimeException and occur at runtime, usually representing programming flaws like NullPointerException or IndexOutOfBoundsException, which do not require mandatory handling.",
        learningTopic: "Exception Handling Java",
        videoSearchQuery: "Java Checked vs Unchecked Exceptions Tutorial"
    },

    // --- FRONTEND DEVELOPER / TECHNICAL ---
    {
        id: "fe_01",
        role: "Frontend Developer",
        round: "Core Technical",
        category: "JavaScript",
        topic: "JavaScript Closures",
        difficulty: "Intermediate",
        question: "What is a Closure in JavaScript? Provide an example of how closures are useful.",
        expectedAnswer: "A closure is a function bundled together with references to its surrounding state (lexical environment). It allows an inner function to access variables from an outer function scope even after the outer function has finished executing.",
        keyPoints: [
            "Function retaining access to outer lexical scope.",
            "Useful for data privacy (private variables/encapsulation), memoization, and event handlers."
        ],
        hint: "Focus on lexical scope and functions retaining access to outer variables post-execution.",
        explanation: "Closures give functions memory of where they were created. They enable private state variables without class syntax.",
        sampleAnswer: "A closure is created when an inner function retains access to variables in its outer lexical scope, even after the outer function has returned. A classic use case is data privacy: creating private state variables. For example, a counter function factory returning increment() and getValue() functions can encapsulate a private counter variable that external code cannot directly modify.",
        learningTopic: "JavaScript Closures",
        videoSearchQuery: "JavaScript Closures Explained Deep Dive Interview"
    },
    {
        id: "fe_02",
        role: "Frontend Developer",
        round: "Core Technical",
        category: "Browser Concepts",
        topic: "Event Loop",
        difficulty: "Advanced",
        question: "Explain the JavaScript Event Loop, Call Stack, Microtask Queue, and Macrotask Queue.",
        expectedAnswer: "The Call Stack executes synchronous code line by line. Asynchronous callbacks are sent to Web APIs. When complete, Promise callbacks go to the Microtask Queue, while setTimeout/setInterval callbacks go to the Macrotask Queue. The Event Loop prioritizes clearing the Call Stack, then empties ALL Microtasks before processing ONE Macrotask.",
        keyPoints: [
            "Call Stack: Synchronous execution frame.",
            "Microtasks (Promises, process.nextTick): High priority, executed completely before macrotasks.",
            "Macrotasks (setTimeout, setInterval): Executed one per event loop cycle after microtask queue is clear."
        ],
        hint: "Contrast Microtask Queue (Promises) vs Macrotask Queue (setTimeout).",
        explanation: "The Event Loop continuously checks if Call Stack is empty, flushes Microtasks, then takes one Macrotask.",
        sampleAnswer: "JavaScript is single-threaded. Synchronous code runs on the Call Stack. Asynchronous tasks register callbacks in Web APIs. Once finished, Promise .then() callbacks enter the Microtask Queue, while setTimeout callbacks enter the Macrotask Queue. The Event Loop monitors the Call Stack: when empty, it processes ALL queued Microtasks first before picking the next Macrotask. This is why Promise callbacks run before setTimeout(..., 0).",
        learningTopic: "Browser Concepts Event Loop",
        videoSearchQuery: "JavaScript Event Loop Call Stack Microtask Queue Explained"
    },

    // --- QA / TEST ENGINEER ---
    {
        id: "qa_01",
        role: "QA / Test Engineer",
        round: "Core Technical",
        category: "Manual Testing",
        topic: "STLC",
        difficulty: "Beginner",
        question: "Explain the different phases of the Software Testing Life Cycle (STLC).",
        expectedAnswer: "STLC phases: 1. Requirement Analysis 2. Test Planning 3. Test Case Development 4. Test Environment Setup 5. Test Execution 6. Test Cycle Closure & Reporting.",
        keyPoints: [
            "Requirement Analysis: Identify testable requirements.",
            "Test Planning: Estimate resources, strategy, and tools.",
            "Test Case Development: Draft detailed test scenarios & boundary conditions.",
            "Test Execution & Closure: Run tests, log defects, and publish reports."
        ],
        hint: "List the 6 standard STLC phases in order.",
        explanation: "STLC defines systematic stages for test execution from requirement gathering to sign-off.",
        sampleAnswer: "STLC (Software Testing Life Cycle) comprises 6 key phases: Requirement Analysis (reviewing specs), Test Planning (defining strategy and effort), Test Case Development (writing test steps and data), Environment Setup (configuring hardware/software), Test Execution (running test cases and logging bugs), and Test Cycle Closure (analyzing bug metrics and publishing the final test summary report).",
        learningTopic: "STLC Phases Manual Testing",
        videoSearchQuery: "Software Testing Life Cycle STLC Phases Explained"
    },
    {
        id: "qa_02",
        role: "QA / Test Engineer",
        round: "Core Technical",
        category: "Bug Life Cycle",
        topic: "Defect Life Cycle",
        difficulty: "Intermediate",
        question: "Describe the Bug/Defect Life Cycle from creation to closure. Differentiate Bug Severity vs Priority.",
        expectedAnswer: "Bug Life Cycle: New -> Assigned -> Open -> Fixed -> Pending Retest -> Retest -> Verified & Closed (or Reopened). Severity measures the technical impact on the application (High/Medium/Low). Priority measures the urgency to fix it for business needs.",
        keyPoints: [
            "Lifecycle states: New, Assigned, Fixed, Retest, Closed.",
            "Severity: Technical impact (e.g. system crash = High Severity).",
            "Priority: Business urgency (e.g. company logo typo = High Priority, Low Severity)."
        ],
        hint: "Give an example of High Severity/Low Priority vs Low Severity/High Priority.",
        explanation: "Severity is technical impact; Priority is business urgency.",
        sampleAnswer: "The Defect Life Cycle starts when a bug is reported (New), assigned to a developer (Assigned), investigated and repaired (Fixed), re-tested by QA (Retest), and finally marked Closed if resolved (or Reopened if it fails). Severity measures technical impact (e.g. system crash is High Severity). Priority indicates business urgency (e.g. misspelled logo on home page is High Priority, Low Severity).",
        learningTopic: "Bug Life Cycle Defect Severity vs Priority",
        videoSearchQuery: "Bug Defect Life Cycle Severity vs Priority QA Interview"
    },

    // --- DATA ANALYST ---
    {
        id: "da_01",
        role: "Data Analyst",
        round: "Core Technical",
        category: "SQL",
        topic: "SQL Joins",
        difficulty: "Intermediate",
        question: "Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with SQL examples.",
        expectedAnswer: "INNER JOIN returns matching rows in both tables. LEFT JOIN returns all rows from left table and matched rows from right. RIGHT JOIN returns all right rows and matched left. FULL OUTER JOIN returns all rows when there is a match in either table.",
        keyPoints: [
            "INNER JOIN: Intersect only.",
            "LEFT JOIN: All left table records + matching right records (NULLs for non-matches).",
            "FULL OUTER JOIN: Union of all matching and non-matching records."
        ],
        hint: "Visualize Venn diagrams for database set intersections.",
        explanation: "Joins combine tables based on matching column keys. NULL values fill unmatched side columns.",
        sampleAnswer: "INNER JOIN returns only rows where the join condition matches in both tables. LEFT JOIN returns all records from the left table and matching records from the right table (filling NULL for non-matches). RIGHT JOIN does the inverse. FULL OUTER JOIN combines all records from both tables, populating NULLs whenever a match is absent on either side.",
        learningTopic: "SQL Joins DBMS",
        videoSearchQuery: "SQL Joins INNER LEFT RIGHT FULL Visual Explanation"
    },

    // --- BACKEND DEVELOPER ---
    {
        id: "be_01",
        role: "Backend Developer",
        round: "Core Technical",
        category: "Database Indexing",
        topic: "Database Indexing",
        difficulty: "Advanced",
        question: "How do B-Tree indexes speed up database queries? What are the trade-offs of adding too many indexes?",
        expectedAnswer: "B-Tree indexes store ordered key-pointer pairs, reducing lookup time from O(N) sequential table scans to O(log N) tree traversals. However, every INSERT, UPDATE, or DELETE requires updating the B-Tree index, which slows down write operations and increases disk storage.",
        keyPoints: [
            "Speeds up SELECT queries from O(N) to O(log N).",
            "Slows down INSERT/UPDATE/DELETE writes due to index rebalancing.",
            "Consumes additional disk and RAM storage."
        ],
        hint: "Balance read query speed against write performance overhead.",
        explanation: "Indexes are lookup tables that speed up reads but penalize data modification writes.",
        sampleAnswer: "B-Tree indexes maintain a balanced search tree on indexed columns, allowing the database engine to locate target records in O(log N) time instead of performing expensive full table scans. The trade-off is write overhead: whenever data is inserted, updated, or deleted, the index tree must be updated and rebalanced, which degrades write throughput and increases disk storage usage.",
        learningTopic: "Database Indexing Performance",
        videoSearchQuery: "Database Indexing B-Trees Explained Backend Interview"
    }
];

// --- CODING LAB PROBLEMS ---
const CODING_PROBLEMS = [
    {
        id: "code_01",
        title: "Two Sum & Target Lookup",
        difficulty: "Intermediate",
        topic: "Arrays & Hash Table",
        language: "Java",
        expectedApproach: "Use a HashMap to store values and lookup complements in O(N) time.",
        problemDesc: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target. Assume exactly one solution exists.",
        exampleText: "Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: nums[0] + nums[1] == 9.",
        initialCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Implement O(N) solution using HashMap
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        sampleSolution: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        complexity: "Time: O(N), Space: O(N)",
        conceptTested: "HashMap Lookup Efficiency",
        commonGotchas: "Nested brute force loop leading to O(N^2) time complexity."
    },
    {
        id: "code_02",
        title: "Reverse String & In-Place Pointer Swap",
        difficulty: "Beginner",
        topic: "Two Pointers & Strings",
        language: "Python",
        expectedApproach: "Use two pointers starting at opposite ends, swapping characters in-place.",
        problemDesc: "Write a function that reverses a string array in-place with O(1) extra memory.",
        exampleText: "Input: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]\nOutput: [\"o\",\"l\",\"l\",\"e\",\"h\"]",
        initialCode: `class Solution:
    def reverseString(self, s: list[str]) -> None:
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1`,
        sampleSolution: `class Solution:
    def reverseString(self, s: list[str]) -> None:
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1`,
        complexity: "Time: O(N), Space: O(1)",
        conceptTested: "Two-Pointer In-Place Mutation",
        commonGotchas: "Creating a new array copy instead of mutating in-place."
    }
];

// --- PROJECT INTERVIEW QUESTIONS ---
const PROJECT_QUESTIONS = [
    {
        id: "proj_01",
        question: "Explain your key project. What problem does it solve and what was your specific architectural contribution?",
        guidance: "Clearly state: 1. Project Goal & Impact 2. Tech Stack Chosen 3. Your Ownership (Frontend/Backend/DB) 4. Key Challenge Overcome."
    },
    {
        id: "proj_02",
        question: "Why did you choose your specific technology stack for your project instead of alternatives?",
        guidance: "Compare your chosen stack against alternatives. Discuss trade-offs like developer velocity, ecosystem support, performance, and scalability."
    },
    {
        id: "proj_03",
        question: "What major technical challenge or bottleneck did you encounter during your project, and how did you resolve it?",
        guidance: "Use STAR method: Describe the bug/performance bottleneck, root cause investigation, fix implemented, and verified result."
    }
];

// --- HR & BEHAVIORAL QUESTIONS ---
const HR_QUESTIONS = [
    {
        id: "hr_01",
        question: "Tell me about yourself and why you are interested in this specific role.",
        starStructure: {
            situation: "Brief background: Education, experience, and current domain focus.",
            task: "Key skill set alignment with target role.",
            action: "Projects or achievements demonstrating relevant problem solving.",
            result: "Enthusiasm for joining and contributing value to the team."
        }
    },
    {
        id: "hr_02",
        question: "Describe a situation where you faced a significant setback or failure. How did you handle it?",
        starStructure: {
            situation: "Context of the project or scenario that failed.",
            task: "What went wrong or missed expectations.",
            action: "Immediate corrective steps and ownership taken.",
            result: "Key lesson learned and how you prevented it in future work."
        }
    },
    {
        id: "hr_03",
        question: "Where do you see yourself in 3 to 5 years in your engineering career?",
        starStructure: {
            situation: "Current foundational stage.",
            task: "Desire for continuous technical growth and domain mastery.",
            action: "Steps to take: mastering architecture, leadership, or specialized stack.",
            result: "Long-term goal of taking technical ownership and mentoring others."
        }
    }
];
