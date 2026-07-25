const Groq = require('groq-sdk');
const githubContentService = require('./githubContent.service');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// We use LLaMA 3.3 for fast, context-heavy RAG tasks.
const MODEL = 'llama-3.3-70b-versatile';

module.exports = {
  async chatWithRepo(owner, repo, question, history = [], userToken = null) {
    try {
      let systemPrompt = '';
      
      if (owner && repo) {
        // 1. Fetch Repo Context (Readme + File Tree)
        const [readme, fileTree] = await Promise.all([
          githubContentService.getReadme(owner, repo, userToken),
          githubContentService.getFileTree(owner, repo, 'main', userToken)
        ]);

        const treeStr = fileTree.map(f => f.path).slice(0, 1000).join('\n'); // Limit to 1000 files

        // 2. Build the System Prompt
        systemPrompt = `You are a helpful AI assistant answering questions about the GitHub repository '${owner}/${repo}'. 
Here is the repository's README:
---
${readme || 'No README provided'}
---

Here is a partial list of the files in the repository:
---
${treeStr || 'No file tree available'}
---

Use this context to accurately answer the user's questions. If you don't know the answer based on the provided context, you can say so.`;
      } else {
        systemPrompt = `You are the RepoPilot AI Copilot, a helpful platform assistant. 
Your goal is to assist the user with general software development questions, GitHub best practices, or explain how to use the RepoPilot platform.
RepoPilot is a unified platform for developers to explore repositories, manage issues, and monitor GitHub activity all in one place.
Answer the user's questions in a friendly, concise, and helpful manner.`;
      }

      // 3. Convert history to Groq (OpenAI) format
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: owner && repo ? 'Understood. I will answer questions about this repository based on the provided context.' : 'Understood. I am ready to assist with general software development and RepoPilot questions.' }
      ];

      for (const msg of history) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }

      // Add the latest question
      messages.push({ role: 'user', content: question });

      // 4. Start Chat
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: MODEL,
        temperature: 0.5,
      });

      return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error('Chat error:', error);
      return "Hello! I am RepoPilot's AI assistant. The AI service is currently unavailable. Please try again later.";
    }
  },

  async scanSecurity(owner, repo, userToken = null) {
    try {
      // 1. Fetch common dependency files
      const [packageJson, requirementsTxt, securityMd] = await Promise.all([
        githubContentService.getFile(owner, repo, 'package.json', userToken),
        githubContentService.getFile(owner, repo, 'requirements.txt', userToken),
        githubContentService.getFile(owner, repo, 'SECURITY.md', userToken)
      ]);

      // 2. Build Prompt
      const systemPrompt = `You are a strict security analyzer. Perform a security analysis on the following repository files for '${owner}/${repo}'.
Analyze dependencies for known severe vulnerabilities, general security posture, and missing best practices.

CRITICAL INSTRUCTIONS:
- Do NOT flag a missing package.json as an issue unless this is explicitly a JavaScript/Node.js repository.
- Do NOT flag a missing requirements.txt as an issue unless this is explicitly a Python repository.
- Only flag missing dependency files if you are absolutely certain the repository requires them. Otherwise, ignore them completely.
- A missing SECURITY.md should always be flagged as a low/medium issue.

package.json:
---
${packageJson || 'Not found'}
---

requirements.txt:
---
${requirementsTxt || 'Not found'}
---

SECURITY.md:
---
${securityMd || 'Not found'}
---

Output the result as a strict JSON object with this exact structure:
{
  "riskScore": "Low" | "Medium" | "High",
  "findings": [
    { 
      "severity": "High" | "Medium" | "Low", 
      "description": "String describing the issue", 
      "recommendation": "String high-level recommendation",
      "howToFix": "String containing exact actionable steps or shell/code commands to resolve the issue"
    }
  ],
  "summary": "String general summary of security posture"
}`;

      // 3. Generate
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const text = chatCompletion.choices[0]?.message?.content || "{}";
      return JSON.parse(text);
    } catch (error) {
      console.error('Security Scan Error:', error);
      return {
        riskScore: "Medium",
        findings: [
          { severity: "Medium", description: "AI Scan Unavailable", recommendation: "The AI service is temporarily offline." }
        ],
        summary: "Security Scan could not be completed at this time."
      };
    }
  },

  async getRepoHealth(owner, repo, userToken = null) {
    try {
      // Fetch Repo metadata
      const { data: repoData } = await githubContentService.getReadme(owner, repo, userToken).then(() => {
        return require('./github.service').getRepo(owner, repo, userToken).then(d => ({ data: d }));
      });
      
      const systemPrompt = `Analyze the health of the GitHub repository '${owner}/${repo}'.
Stats:
- Stars: ${repoData.stargazers_count}
- Forks: ${repoData.forks_count}
- Open Issues: ${repoData.open_issues_count}
- Has Wiki: ${repoData.has_wiki}
- Has Issues Enabled: ${repoData.has_issues}
- License: ${repoData.license ? repoData.license.name : 'None'}
- Updated At: ${repoData.updated_at}
- Created At: ${repoData.created_at}

Output the result as a strict JSON object with this exact structure:
{
  "score": integer between 1 and 10 (10 being perfect health/activity),
  "verdict": "A 1-5 word verdict (e.g. 'Highly Active', 'Needs Maintainers', 'Abandoned')",
  "description": "A 1-2 sentence explanation of the score"
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: MODEL,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const text = chatCompletion.choices[0]?.message?.content || "{}";
      return JSON.parse(text);
    } catch (error) {
      console.error('Repo Health Error:', error);
      return {
        score: 5,
        verdict: "Unknown",
        description: "AI Health service is currently unavailable."
      };
    }
  },

  async reviewPullRequest(owner, repo, pullNumber, userToken = null) {
    try {
      const githubService = require('./github.service');
      // Fetch the raw diff of the PR
      const diffContent = await githubService.getRepoPullRequestDiff(owner, repo, pullNumber, userToken);
      const prDetails = await githubService.getPullRequestDetails(owner, repo, pullNumber, userToken);
      
      const systemPrompt = `You are a strict, highly accurate Senior Software Engineer conducting a precise and concise code review for a Pull Request on '${owner}/${repo}'.
You will receive the raw diff and the current PR Status metadata.

CRITICAL RULES FOR VERDICT:
- If the PR Status indicates "dirty" (merge conflicts) or "failing/unstable" (CI checks failing), you MUST output "Reject" and cite these status failures as the primary reason.
- ONLY output "Reject" if there are CRITICAL security vulnerabilities, complete application breakers, merge conflicts, or failing CI checks.

Format strictly as:
### Summary
1-2 sentences max explaining the core change.

### Key Findings
- Bullet 1 (major bugs, logic flaws, security issues, or performance hits)
- (If no major issues, write "- No critical issues found.")

### Code Quality
- Bullet 1 (important architectural or styling notes only)
- (If code is clean, write "- Code follows standard practices.")

### Verdict
**[Approve | Request Changes | Reject]**: 1 short sentence justification.

---
Here are examples of how to review different PRs:

Example 1 (Bad Code):
PR Diff:
+ const db = mysql.connect("root", "password123");
+ db.query("SELECT * FROM users WHERE id = " + req.query.id);

Review:
### Summary
This PR adds database connectivity and a user query route.

### Key Findings
- CRITICAL: SQL Injection vulnerability on the query by directly concatenating \`req.query.id\`. Use parameterized queries.
- CRITICAL: Hardcoded database credentials in source code. Use environment variables.

### Code Quality
- Database connection should ideally be separated into a dedicated configuration module.

### Verdict
**Reject**: Critical security vulnerabilities (SQL injection and hardcoded credentials) must be addressed immediately.

Example 2 (Good Code with minor issues):
PR Diff:
+ function calculateTotal(prices) {
+   let total = 0;
+   for (let i=0; i<prices.length; i++) { total += prices[i]; }
+   return total;
+ }

Review:
### Summary
This PR introduces a function to calculate the sum of an array of prices.

### Key Findings
- No critical issues found.

### Code Quality
- Consider using the built-in \`reduce\` method (e.g., \`prices.reduce((a, b) => a + b, 0)\`) for more idiomatic JavaScript.

### Verdict
**Approve**: The logic is functionally correct and safe, despite minor modern JS styling improvements possible.
---

PR Status Metadata:
- Mergeable: ${prDetails.mergeable === null ? 'Unknown' : prDetails.mergeable}
- Mergeable State: ${prDetails.mergeable_state || 'Unknown'} (Note: 'dirty' = conflicts, 'unstable' = failing checks)

PR Diff:
\`\`\`diff
${(typeof diffContent === 'string' ? diffContent : (diffContent ? JSON.stringify(diffContent) : 'No diff available')).substring(0, 15000)}
\`\`\`
`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }],
        model: MODEL,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || "No review generated.";
    } catch (error) {
      console.error('Groq AI PR Review Error:', error.message);
      return "**AI Code Review failed.** The PR diff might be too large or the AI service is unavailable.";
    }
  },

  async reviewCommit(owner, repo, sha, userToken = null) {
    try {
      const githubService = require('./github.service');
      const diffContent = await githubService.getRepoCommitDiff(owner, repo, sha, userToken);
      
      const systemPrompt = `You are a strict, highly accurate Senior Software Engineer conducting a precise and concise code review for a single commit on '${owner}/${repo}'.
You will receive the raw diff of the commit.

CRITICAL RULES FOR VERDICT:
- Output "Reject" if there are CRITICAL security vulnerabilities, hardcoded secrets, or logic that breaks the application.
- Output "Approve" otherwise.

Format strictly as:
### Summary
[1-2 sentences summarizing the change]

### Key Findings
- [Bullet 1]
- [Bullet 2]

### Code Quality
- [Bullet 1]
- [Bullet 2]

### Verdict
**[Approve/Reject]**: [1 sentence reasoning]

---

Example of a good output:
### Summary
This commit updates the login endpoint to use bcrypt for password hashing instead of plain text comparison.

### Key Findings
- Resolves a critical security flaw where passwords were inadvertently logged.
- The use of bcrypt with 10 salt rounds follows standard security practices.

### Code Quality
- The code is clean and handles bcrypt's asynchronous nature properly.

### Verdict
**Approve**: The logic is functionally correct and significantly improves application security.
---

Commit Diff:
\`\`\`diff
${(typeof diffContent === 'string' ? diffContent : (diffContent ? JSON.stringify(diffContent) : 'No diff available')).substring(0, 15000)}
\`\`\`
`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }],
        model: MODEL,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || "No review generated.";
    } catch (error) {
      console.error('Groq AI Commit Review Error:', error.message);
      throw error;
    }
  }
};
