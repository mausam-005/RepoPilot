const Groq = require('groq-sdk');
const githubContentService = require('./githubContent.service');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// We use LLaMA 3.3 for fast, context-heavy RAG tasks.
const MODEL = 'llama-3.3-70b-versatile';

module.exports = {
  async chatWithRepo(owner, repo, question, history = [], userToken = null) {
    try {
      // 1. Fetch Repo Context (Readme + File Tree)
      const [readme, fileTree] = await Promise.all([
        githubContentService.getReadme(owner, repo, userToken),
        githubContentService.getFileTree(owner, repo, 'main', userToken)
      ]);

      const treeStr = fileTree.map(f => f.path).slice(0, 1000).join('\n'); // Limit to 1000 files

      // 2. Build the System Prompt
      const systemPrompt = `You are a helpful AI assistant answering questions about the GitHub repository '${owner}/${repo}'. 
Here is the repository's README:
---
${readme || 'No README provided'}
---

Here is a partial list of the files in the repository:
---
${treeStr || 'No file tree available'}
---

Use this context to accurately answer the user's questions. If you don't know the answer based on the provided context, you can say so.`;

      // 3. Convert history to Groq (OpenAI) format
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: 'Understood. I will answer questions about this repository based on the provided context.' }
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
  }
};
