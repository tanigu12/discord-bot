import { TechInterviewAnswer } from '../types';

export const algorithmQuestions: TechInterviewAnswer[] = [
  {
    question: "Explain different sorting algorithms and their time complexities.",
    definition: [
      "Sorting algorithms arrange elements in a specific order (ascending/descending)",
      "Different algorithms have various time/space complexity trade-offs"
    ],
    keyCharacteristics: [
      "Comparison-based vs non-comparison-based algorithms",
      "Stable vs unstable sorting (maintains relative order of equal elements)",
      "In-place vs out-of-place (additional memory requirements)",
      "Adaptive vs non-adaptive (performance on partially sorted data)"
    ],
    practicalExample: [
      "Bubble Sort: O(n²) - Simple but inefficient, compares adjacent elements",
      "Quick Sort: O(n log n) average - Divide and conquer, picks pivot element",
      "Merge Sort: O(n log n) - Stable, divide and conquer, requires extra space",
      "Heap Sort: O(n log n) - In-place, uses heap data structure",
      "Counting Sort: O(n+k) - Non-comparison based, works with integer ranges"
    ],
    advantages: [
      "Bubble Sort: Simple to understand and implement",
      "Quick Sort: Fast average case, in-place sorting",
      "Merge Sort: Stable, guaranteed O(n log n), good for linked lists",
      "Heap Sort: In-place, guaranteed O(n log n) worst case",
      "Counting Sort: Linear time for small integer ranges"
    ],
    disadvantages: [
      "Bubble Sort: Very slow O(n²) for large datasets",
      "Quick Sort: O(n²) worst case, not stable",
      "Merge Sort: Requires O(n) extra space, not in-place",
      "Heap Sort: Not stable, poor cache performance",
      "Counting Sort: Only works for integers in limited range"
    ],
    bestPractices: [
      "Use built-in sorting functions for production code",
      "Choose algorithm based on data characteristics and constraints",
      "Consider stability requirements for complex data structures",
      "Quick Sort for general purpose, Merge Sort for stability",
      "Counting/Radix Sort for integers with known ranges"
    ],
    conclusion: [
      "No single best sorting algorithm - depends on requirements",
      "O(n log n) is optimal for comparison-based sorting",
      "Modern languages provide optimized hybrid algorithms"
    ]
  },
  {
    question: "What are the main graph traversal algorithms and when to use them?",
    definition: [
      "Graph traversal algorithms systematically visit vertices and edges in a graph",
      "Primary methods are Breadth-First Search (BFS) and Depth-First Search (DFS)"
    ],
    keyCharacteristics: [
      "BFS explores neighbors level by level using queue",
      "DFS explores as deep as possible using stack or recursion",
      "Both have O(V + E) time complexity for adjacency lists",
      "Space complexity differs: BFS O(V), DFS O(h) where h is height"
    ],
    practicalExample: [
      "BFS: Finding shortest path in unweighted graphs",
      "DFS: Detecting cycles, topological sorting, maze solving",
      "BFS: Level-order tree traversal, finding connected components",
      "DFS: Strongly connected components, backtracking algorithms"
    ],
    advantages: [
      "BFS: Finds shortest path, systematic level exploration",
      "DFS: Memory efficient, natural for recursive problems",
      "BFS: Good for finding nearest neighbors or minimum steps",
      "DFS: Excellent for exhaustive search and path finding"
    ],
    disadvantages: [
      "BFS: Higher memory usage due to queue, may not find all paths",
      "DFS: May not find shortest path, risk of infinite loops",
      "BFS: Not suitable for very wide graphs",
      "DFS: Stack overflow risk with deep recursion"
    ],
    bestPractices: [
      "Use BFS when shortest path or minimum steps are needed",
      "Use DFS for tree traversals and recursive problems",
      "Implement cycle detection to avoid infinite loops",
      "Consider iterative DFS to avoid stack overflow",
      "Mark visited nodes to prevent revisiting",
      "Choose based on graph structure (wide vs deep)"
    ],
    conclusion: [
      "BFS and DFS are fundamental graph algorithms",
      "Choice depends on problem requirements and graph characteristics",
      "Both form the basis for many advanced graph algorithms"
    ]
  },
  {
    question: "Explain dynamic programming and provide examples.",
    definition: [
      "Dynamic programming solves complex problems by breaking them into subproblems",
      "Stores results of subproblems to avoid redundant calculations"
    ],
    keyCharacteristics: [
      "Optimal substructure: optimal solution contains optimal solutions of subproblems",
      "Overlapping subproblems: same subproblems solved multiple times",
      "Memoization (top-down) vs tabulation (bottom-up) approaches",
      "Trade space for time complexity improvements"
    ],
    practicalExample: [
      "Fibonacci: F(n) = F(n-1) + F(n-2), memoize computed values",
      "Longest Common Subsequence: Compare strings character by character",
      "Knapsack Problem: Choose items with maximum value within weight limit",
      "Coin Change: Find minimum coins needed for given amount",
      "Edit Distance: Minimum operations to transform one string to another"
    ],
    advantages: [
      "Significantly reduces time complexity from exponential to polynomial",
      "Elegant solution for optimization problems",
      "Guarantees optimal solutions when applicable",
      "Can handle complex recursive relationships efficiently"
    ],
    disadvantages: [
      "Requires additional memory to store intermediate results",
      "Not all problems have optimal substructure property",
      "Can be difficult to identify DP opportunities",
      "May have complex state representation"
    ],
    bestPractices: [
      "Identify if problem has optimal substructure and overlapping subproblems",
      "Start with recursive solution, then add memoization",
      "Consider both top-down (memoization) and bottom-up (tabulation) approaches",
      "Define state clearly and transition relationships",
      "Optimize space complexity when possible (rolling arrays)",
      "Practice common DP patterns (linear, 2D, tree-based)"
    ],
    conclusion: [
      "Essential technique for optimization problems",
      "Transforms exponential problems into polynomial time solutions",
      "Requires practice to recognize DP patterns and state design"
    ]
  },
  {
    question: "What are hash tables and how do they handle collisions?",
    definition: [
      "Hash tables store key-value pairs using hash function to compute array index",
      "Provide average O(1) time complexity for insertion, deletion, and lookup"
    ],
    keyCharacteristics: [
      "Hash function maps keys to array indices",
      "Load factor affects performance (typically kept under 0.75)",
      "Collision resolution strategies: chaining vs open addressing",
      "Dynamic resizing when load factor exceeds threshold"
    ],
    practicalExample: [
      "Chaining: Each array slot contains linked list of colliding elements",
      "Linear Probing: Find next empty slot linearly when collision occurs",
      "Quadratic Probing: Use quadratic function to find next slot",
      "Double Hashing: Use second hash function for probing sequence"
    ],
    advantages: [
      "Chaining: Simple implementation, handles high load factors well",
      "Linear Probing: Good cache locality, no extra memory for pointers",
      "Quadratic Probing: Reduces primary clustering compared to linear",
      "Double Hashing: Distributes keys more uniformly"
    ],
    disadvantages: [
      "Chaining: Extra memory overhead, poor cache performance",
      "Linear Probing: Primary clustering, deletion complexity",
      "Quadratic Probing: Secondary clustering, may not find empty slots",
      "Double Hashing: More complex, requires good second hash function"
    ],
    bestPractices: [
      "Choose good hash function with uniform distribution",
      "Monitor and maintain appropriate load factor",
      "Use chaining for simplicity, open addressing for memory efficiency",
      "Implement dynamic resizing to maintain performance",
      "Handle edge cases like duplicate keys and deletions properly",
      "Consider Robin Hood hashing for open addressing optimization"
    ],
    conclusion: [
      "Hash tables are fundamental for fast key-value operations",
      "Collision resolution strategy affects performance characteristics",
      "Proper implementation and tuning crucial for optimal performance"
    ]
  },
  {
    question: "Explain tree traversal algorithms (in-order, pre-order, post-order).",
    definition: [
      "Tree traversal algorithms visit every node in a tree structure systematically",
      "Three main depth-first traversals differ in when they process the root node"
    ],
    keyCharacteristics: [
      "In-order: Left subtree → Root → Right subtree",
      "Pre-order: Root → Left subtree → Right subtree",
      "Post-order: Left subtree → Right subtree → Root",
      "All have O(n) time complexity and O(h) space complexity"
    ],
    practicalExample: [
      "In-order traversal of BST gives sorted sequence",
      "Pre-order used for copying/serializing tree structure",
      "Post-order used for deleting tree or calculating directory sizes",
      "Level-order (BFS) traversal for printing tree by levels"
    ],
    advantages: [
      "In-order: Natural ordering for binary search trees",
      "Pre-order: Preserves tree structure, good for serialization",
      "Post-order: Safe for deletion, children processed before parent",
      "Recursive implementations are elegant and intuitive"
    ],
    disadvantages: [
      "Recursive approaches can cause stack overflow for deep trees",
      "Different traversals needed for different use cases",
      "May process nodes in non-intuitive order for some applications"
    ],
    bestPractices: [
      "Use in-order for BST operations requiring sorted data",
      "Use pre-order for tree copying, serialization, and prefix expressions",
      "Use post-order for tree deletion, calculating sizes, postfix expressions",
      "Implement iterative versions for very deep trees",
      "Consider level-order traversal for breadth-first processing",
      "Combine with other techniques for more complex tree operations"
    ],
    conclusion: [
      "Each traversal method serves specific use cases",
      "Understanding traversals is fundamental for tree algorithms",
      "Choice depends on when you need to process parent vs children nodes"
    ]
  },
  {
    question: "What is the difference between linear and binary search?",
    definition: [
      "Linear search checks each element sequentially until target is found",
      "Binary search divides sorted array in half repeatedly to find target"
    ],
    keyCharacteristics: [
      "Linear search: O(n) time complexity, works on unsorted data",
      "Binary search: O(log n) time complexity, requires sorted data",
      "Linear search: O(1) space complexity, simple implementation",
      "Binary search: O(1) space for iterative, O(log n) for recursive"
    ],
    practicalExample: [
      "Linear search: Looking through a stack of papers one by one",
      "Binary search: Looking up a word in a dictionary by opening to middle",
      "Linear: Suitable for small unsorted arrays or linked lists",
      "Binary: Ideal for large sorted arrays with frequent searches"
    ],
    advantages: [
      "Linear search: Works on any data structure, no preprocessing needed",
      "Linear search: Simple to implement and understand",
      "Binary search: Very efficient for large datasets",
      "Binary search: Predictable performance characteristics"
    ],
    disadvantages: [
      "Linear search: Slow for large datasets O(n)",
      "Linear search: No early termination optimization for sorted data",
      "Binary search: Requires data to be sorted first",
      "Binary search: More complex implementation, especially edge cases"
    ],
    bestPractices: [
      "Use linear search for small datasets or when data is unsorted",
      "Use binary search for large sorted datasets with frequent queries",
      "Consider the cost of sorting if data changes frequently",
      "Implement binary search iteratively to avoid recursion overhead",
      "Handle edge cases carefully (empty array, single element, not found)",
      "Consider interpolation search for uniformly distributed sorted data"
    ],
    conclusion: [
      "Linear search is simple but inefficient for large datasets",
      "Binary search is very efficient but requires sorted data",
      "Choice depends on data size, sort status, and query frequency"
    ]
  },
  {
    question: "Explain the concept of Big O notation and algorithm analysis.",
    definition: [
      "Big O notation describes upper bound of algorithm's time/space complexity",
      "Provides asymptotic analysis of how performance scales with input size"
    ],
    keyCharacteristics: [
      "Focuses on worst-case scenario and dominant terms",
      "Ignores constants and lower-order terms",
      "Common complexities: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)",
      "Helps compare algorithms independent of hardware/implementation"
    ],
    practicalExample: [
      "O(1): Array access by index, hash table lookup",
      "O(log n): Binary search, balanced tree operations",
      "O(n): Linear search, single pass through array",
      "O(n log n): Efficient sorting algorithms (merge sort, heap sort)",
      "O(n²): Nested loops, bubble sort, simple graph algorithms",
      "O(2ⁿ): Recursive fibonacci, subset generation"
    ],
    advantages: [
      "Provides standardized way to compare algorithms",
      "Helps predict scalability and performance bottlenecks",
      "Language and hardware independent analysis",
      "Guides algorithm selection for different problem sizes"
    ],
    disadvantages: [
      "Ignores constant factors which can be significant",
      "Worst-case analysis may not reflect typical performance",
      "Doesn't account for cache effects or memory hierarchy",
      "May not be meaningful for small input sizes"
    ],
    bestPractices: [
      "Analyze both time and space complexity",
      "Consider average-case and best-case scenarios when relevant",
      "Account for input characteristics and distribution",
      "Profile real performance when Big O analysis isn't sufficient",
      "Use appropriate algorithm for expected input size and constraints",
      "Remember that O(n) with small constant can outperform O(log n) with large constant"
    ],
    conclusion: [
      "Big O notation is essential for algorithm analysis and comparison",
      "Provides theoretical foundation for understanding scalability",
      "Should be combined with practical considerations for real-world decisions"
    ]
  },
  {
    question: "What are greedy algorithms and when are they optimal?",
    definition: [
      "Greedy algorithms make locally optimal choices at each step",
      "Hope that local optimum leads to global optimum for the entire problem"
    ],
    keyCharacteristics: [
      "Makes best choice available at each step without reconsidering",
      "Never backtracks or changes previous decisions",
      "Often simple and efficient to implement",
      "Works optimally only for problems with greedy choice property"
    ],
    practicalExample: [
      "Coin change with standard denominations (always take largest coin)",
      "Activity selection problem (choose earliest ending activity)",
      "Huffman coding for data compression",
      "Dijkstra's shortest path algorithm",
      "Fractional knapsack problem (take highest value/weight ratio)"
    ],
    advantages: [
      "Simple and intuitive approach",
      "Often very efficient in terms of time complexity",
      "Produces good approximate solutions for optimization problems",
      "Easy to implement and understand"
    ],
    disadvantages: [
      "Doesn't always produce optimal solutions",
      "Hard to prove correctness for new problems",
      "May get stuck in local optima",
      "Not suitable for problems requiring backtracking"
    ],
    bestPractices: [
      "Verify that problem has greedy choice property",
      "Prove optimal substructure exists",
      "Test with counterexamples to verify correctness",
      "Consider if approximation is acceptable when optimal isn't guaranteed",
      "Compare with dynamic programming or other approaches",
      "Use for problems like minimum spanning tree, scheduling"
    ],
    conclusion: [
      "Greedy algorithms are powerful when they work optimally",
      "Correctness must be proven for each specific problem",
      "Often provide good approximations even when not optimal"
    ]
  },
  {
    question: "Explain divide and conquer algorithms with examples.",
    definition: [
      "Divide and conquer breaks problem into smaller subproblems",
      "Solves subproblems recursively and combines results"
    ],
    keyCharacteristics: [
      "Divide: Break problem into smaller subproblems",
      "Conquer: Solve subproblems recursively",
      "Combine: Merge solutions to get final result",
      "Often leads to O(n log n) time complexity"
    ],
    practicalExample: [
      "Merge Sort: Divide array in half, sort recursively, merge sorted halves",
      "Quick Sort: Choose pivot, partition array, sort partitions recursively",
      "Binary Search: Divide search space in half based on comparison",
      "Maximum Subarray: Divide array, find max in left, right, and crossing",
      "Closest Pair of Points: Divide points, find closest in each half"
    ],
    advantages: [
      "Often achieves optimal or near-optimal time complexity",
      "Natural parallelization opportunities",
      "Elegant recursive solutions",
      "Reduces complex problems to simpler ones"
    ],
    disadvantages: [
      "Recursion overhead can be significant",
      "May use extra memory for recursive calls",
      "Not always the most efficient approach",
      "Can be difficult to analyze complexity"
    ],
    bestPractices: [
      "Ensure subproblems are independent",
      "Choose good divide strategy to balance subproblem sizes",
      "Consider iterative implementation for tail recursion",
      "Use memoization if subproblems overlap",
      "Analyze recurrence relation using Master Theorem",
      "Optimize base cases for small subproblems"
    ],
    conclusion: [
      "Fundamental algorithmic paradigm for many efficient algorithms",
      "Provides systematic approach to breaking down complex problems",
      "Often leads to optimal solutions with good theoretical properties"
    ]
  },
  {
    question: "What are different string matching algorithms?",
    definition: [
      "String matching algorithms find occurrences of pattern string within text",
      "Range from simple brute force to sophisticated preprocessing approaches"
    ],
    keyCharacteristics: [
      "Naive approach: O(nm) where n is text length, m is pattern length",
      "KMP algorithm: O(n+m) using failure function preprocessing",
      "Boyer-Moore: Good average case using bad character and good suffix rules",
      "Rabin-Karp: Uses rolling hash for O(n+m) average case"
    ],
    practicalExample: [
      "Naive: Check pattern at every position in text",
      "KMP: Skip characters based on partial match information",
      "Boyer-Moore: Skip based on mismatched character position in pattern",
      "Rabin-Karp: Compare hash values before character-by-character comparison"
    ],
    advantages: [
      "Naive: Simple to implement and understand",
      "KMP: Guaranteed linear time, no backtracking in text",
      "Boyer-Moore: Excellent average case performance, especially for long patterns",
      "Rabin-Karp: Good for multiple pattern matching, simple to implement"
    ],
    disadvantages: [
      "Naive: Poor worst-case performance O(nm)",
      "KMP: Complex preprocessing, poor cache performance",
      "Boyer-Moore: Complex implementation, poor worst-case performance",
      "Rabin-Karp: Hash collisions can degrade performance"
    ],
    bestPractices: [
      "Use built-in string search functions for production code",
      "Choose algorithm based on text and pattern characteristics",
      "Consider multiple pattern matching algorithms for searching many patterns",
      "Preprocessing cost vs search frequency trade-off",
      "KMP for guaranteed linear time, Boyer-Moore for long patterns",
      "Suffix arrays or trees for complex string processing"
    ],
    conclusion: [
      "Different algorithms excel in different scenarios",
      "Preprocessing can significantly improve search performance",
      "Modern applications often use hybrid approaches"
    ]
  }
];