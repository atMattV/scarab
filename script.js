document.addEventListener('DOMContentLoaded', () => {
    const PROMPTS = {
    seshat: {
        prompt: (rawDocumentsContent) => `You are an expert document analyst. Your task is to read the following document text and break it down into a series of detailed, self-contained, and semantically relevant chunks. Each chunk should have a concise, descriptive title. Return the output as a JSON array of objects, where each object has a 'title' and a 'content' key.

DOCUMENT TEXT:
"""
${rawDocumentsContent}
"""`
    },
    maat: {
    think: (additionalContext) => `You are a Senior Product Manager and Research Analyst. Your task is to analyze the provided documentation to establish a clear, factual basis for development by following a strict rubric. You have access to web search.

**PRIMARY PROJECT GOAL:** ${AppState.projectGoal || 'Not provided.'}

**WEB SEARCH GUARDRAIL:** Your primary goal is to find factual, technical information. You MUST prioritize official documentation, API references, technical specifications, and developer guides. Avoid high-level articles, opinion pieces, or marketing content unless no technical sources are available. You may ONLY use web search to supplement, clarify, or enrich a requirement, term, or concept that is explicitly mentioned in the source documents. You are FORBIDDEN from introducing new, unsolicited requirements.

**Your current task is ONLY to THINK.** Write down your thought process. When you identify a vague requirement or a technical term, you MUST use web searches to find concrete details and best practices. You MUST format the result within your thoughts using the following strict XML format for EACH search performed:
<web_research>
<query>Your precise Google search query</query>
<source>The full URL of the source you used</source>
<summary>A concise summary of the key information you found at that source that is relevant to the requirement.</summary>
</web_research>

**Analysis Rubric:**
1.  **Goal Alignment:** Start by re-stating the Primary Project Goal.
2.  **Requirement Extraction & Enrichment:** Go through each document chunk and explicitly list every functional and non-functional requirement. For any requirement that is not 100% self-explanatory (e.g., involves a technology, a standard like 'SEPA', or a subjective term like 'best-in-class'), you MUST perform one or more web searches to find specific, concrete standards or implementation details and cite your sources using the <web_research> format.
3.  **Requirement Classification & Business Impact:** For each functional requirement, you MUST assign an "Impact Category" from the following list: [ 'Customer Experience', 'Revenue Generation', 'Cost Reduction', 'Operational Efficiency', 'Compliance & Security' ]. Base this on the primary project goal. This classification must be part of your final output.
4.  **NFR Audit:** You must explicitly search the documents for requirements related to the following categories: **Security**, **Performance** (e.g., response times, load handling), **Scalability** (e.g., user growth), and **Accessibility** (e.g., WCAG standards). If no specific requirements are found for these categories, you MUST list them under the "Identified Gaps & Questions" section as "Unspecified NFRs."
5.  **Gap & Question Identification:** Identify any ambiguities or missing information.
6.  **Synthesis:** Briefly summarize your findings.

**Your analysis must be exhaustive for every single item. Under no circumstances should you summarize, abbreviate, or use phrases like 'etc.' or 'and so on'. Generate the full, complete text for your entire thought process.**

**Additional Context from User:**
${additionalContext || 'None provided.'}`,
    write: (thought, dependencies, indexedChunks) => `You are a Senior Product Manager. You have already analyzed the context and created a plan.
**Your current task is ONLY to WRITE the final output.** Based on your thought process below and the original context, produce the final, clean output with two distinct sections: "### Extracted Requirements" and "### Identified Gaps & Questions".

**Strict Requirement Formatting:**
* **[Impact Category]** - [The full requirement text]

Do not add any other text or explanation.

**Your Thought Process:**
${thought}

**Original Context:**
---
**Indexed Document Chunks:**
${indexedChunks}
---`
    },
    ptah: {
        think: (feedback, thoughtStreams) => `You are a Principal Product Owner and UX Specialist. Your goal is to create a backlog of Epics and User Stories by following a strict rubric. You have access to web search.

**WEB SEARCH GUARDRAIL:** Your primary goal is to find data to justify a feature's value. You MUST prioritize technical documentation, case studies, or market research that provides concrete data. Avoid broad, irrelevant searches about a persona's lifestyle. You may ONLY use web search to enrich a user story's persona or justification if it is directly related to a requirement from the previous step. You are FORBIDDEN from creating new user stories for features not supported by the provided requirements.

**Your current task is ONLY to THINK.** Write down your thought process. When you need to enrich a persona or strengthen a justification, you MUST use web searches. You MUST format the result within your thoughts using the following strict XML format for EACH search performed:
<web_research>
<query>Your precise Google search query</query>
<source>The full URL of the source you used</source>
<summary>A concise summary of the key information you found at that source that is relevant to the user story.</summary>
</web_research>

**Backlog Creation Rubric:**
1.  **Feedback Incorporation:** Your thought process **must** begin with a section titled "Addressing Feedback". In this section, you will quote the user's feedback verbatim and then explain, point-by-point, how your subsequent plan has been modified to satisfy it. If the feedback is contradictory or cannot be acted upon, you must explain why.
2.  **Epic Identification:** Group requirements into logical Epics.
3.  **User Story Decomposition:** For each Epic, break it down into the smallest possible, valuable user stories.
    - **Persona Enrichment:** For each persona, you MUST perform web searches to find details about their role to make the "As a..." more specific and empathetic. Cite your sources using the <web_research> format.
    - **Justification Strengthening:** For each "So that..." clause, you MUST perform web searches to find data or articles that support the value proposition. Cite your sources using the <web_research> format.

**Your analysis must be exhaustive for every single item. Under no circumstances should you summarize, abbreviate, or use phrases like 'etc.' or 'and so on'. Generate the full, complete text for your entire thought process.**

**Relevant Thought Stream from Ma'at (Extractor):**
${thoughtStreams}

**Feedback on Previous Step (Ma'at):**
${feedback || 'None provided.'}`,
        write: (thought, requirements, indexedChunks) => `You are a Principal Product Owner. You have already analyzed the requirements and created a plan.
**Your current task is ONLY to WRITE the final backlog.** Based on your thought process below and the original context, produce the final hierarchy of Epics and User Stories using the strict Markdown format. Do not add any other text or explanation.

**Strict Output Formatting:**
# Epic: [Epic Title]
*Description: [Epic Description]*

## User Story
**As a** [user persona], **I want to** [action], **So that** [benefit].
*Justification: [Justification citing requirements, chunks, any identified team dependencies, and **explicitly stating how this story contributes to the overall project goal and its Impact Category**.]*
---
**IMPORTANT RULE: The [user persona] MUST be a generic role (e.g., 'Finance Manager', 'Backend Engineer', 'Customer'), NOT a personal name (e.g., 'Helena', 'David').**

**Your Thought Process:**
${thought}

**Original Context:**
---
**Extracted Requirements:**
${requirements}
---
**Indexed Document Chunks:**
${indexedChunks}
---`
    },
    osiris: {
        think: (feedback, thoughtStreams) => `You are a Senior Agile Product Owner and former architect. Your goal is to expand User Stories into technically detailed, 'Definition of Ready' artifacts. You have access to web search.

**WEB SEARCH GUARDRAIL:** Your primary goal is to find factual, technical information for implementation. You MUST prioritize official documentation, API references, technical specifications, and developer guides. Avoid high-level articles, opinion pieces, or marketing content unless no technical sources are available. You may ONLY use web search to find technical specifications or implementation best practices for tasks explicitly mentioned in a user story. You are FORBIDDEN from adding new implementation tasks for technologies not mentioned or implied by the user story.

**Your current task is ONLY to THINK.** Write down your thought process. When planning implementation tasks, you MUST use web searches to find technical details for any specific technologies or standards mentioned. You MUST format the result within your thoughts using the following strict XML format for EACH search performed:
<web_research>
<query>Your precise Google search query</query>
<source>The full URL of the source you used</source>
<summary>A concise summary of the key technical details or best practices you found at that source.</summary>
</web_research>

**Story Expansion Rubric:**
1.  **Feedback Incorporation:** Your thought process **must** begin with a section titled "Addressing Feedback". In this section, you will quote the user's feedback verbatim and then explain, point-by-point, how your subsequent plan has been modified to satisfy it. If the feedback is contradictory or cannot be acted upon, you must explain why.
2.  **Implementation Task Planning:** For each User Story, list the specific, granular technical tasks.
3.  **Technical Granularity:** When defining implementation tasks, if a task involves a known third-party service (e.g., Stripe, AWS S3) or a common protocol (e.g., OAuth 2.0), you MUST perform a web search to identify and suggest specific API endpoints, libraries, or SDK functions that are likely to be used. For example, instead of "Upload file to storage," suggest "Upload file using AWS S3 SDK's 'PutObject' command."
4.  **Acceptance Criteria (AC) Design:** Design detailed Gherkin-style acceptance criteria for the happy path, edge cases, and negative paths.

**Your analysis must be exhaustive for every single item. Under no circumstances should you summarize, abbreviate, or use phrases like 'etc.' or 'and so on'. Generate the full, complete text for your entire thought process.**

**Relevant Thought Streams from Ma'at & Ptah:**
${thoughtStreams}

**Feedback on Previous Step (Ptah):**
${feedback || 'None provided.'}`,
        write: (thought, userStories, indexedChunks) => `You are a Senior Agile Product Owner. You have already analyzed the user stories and created a plan.
**Your current task is ONLY to WRITE the final expanded stories.** Based on your thought process and the original context, produce the final expanded stories with tasks and acceptance criteria using the strict Markdown format. Do not add any other text or explanation.

**Strict Output Formatting:**
## User Story: [Story Title]
**Story:** As a [user persona], I want to [action], so that [benefit].
### Implementation Tasks
- [ ] **Layer:** [Specific task description]
### Acceptance Criteria
1.  **Scenario:** [Scenario description]
    **Given** [context] **When** [action] **Then** [outcome]
---

**Your Thought Process:**
${thought}

**Original Context:**
---
**Barebone User Stories:**
${userStories}
---
**Indexed Document Chunks:**
${indexedChunks}
---`
    },
    bastet: {
        think: (userStory, storyTitle, feedback, thoughtStreams) => `You are a Senior Agile Coach specializing in backlog estimation. Your goal is to provide a T-shirt size estimate (XS, S, M, L, XL) for a single user story based on a strict rubric. The title of the story is "${storyTitle}".

**Your current task is ONLY to THINK.** Review the single expanded user story provided below. If any feedback on the previous step is available, consider it. Analyze the story against the rubric and write down your reasoning for each category. Do NOT write the final CSV output yet, just your detailed analysis.

**Estimation Rubric:**
1.  **Task Complexity & Count:**
    - How many implementation tasks are listed?
    - Are the tasks straightforward (e.g., simple UI changes) or complex (e.g., new API integrations, complex business logic)?
2.  **Acceptance Criteria (AC) Analysis:**
    - How many ACs are there?
    - Are the ACs simple validation points or do they describe complex, multi-step scenarios?
3.  **Dependencies & Ambiguity:**
    - Does the story mention any external team dependencies?
    - Are there any signs of ambiguity, "to be defined" sections, or potential unknowns that could increase risk and effort?
4.  **Synthesis & Final Estimate:**
    - Based on the analysis above, synthesize your findings and decide on a final T-shirt size. Justify your choice by summarizing the key factors.

**Relevant Thought Stream from Osiris (Expander):**
${thoughtStreams}

**Feedback on Previous Step (Osiris):**
${feedback || 'None provided.'}

**Expanded User Story to Analyze:**
---
${userStory}
---`,
        write: (thought, storyTitle) => `You are a Senior Agile Coach. You have already analyzed a user story and planned your estimation based on a detailed thought process. The title of the story is "${storyTitle}".
**Your current task is ONLY to WRITE the final estimation.** Based on your thought process below, use the provided User Story Title, and extract your final T-Shirt Size and Justification. Produce the output as a single line of a CSV, without a header.

**Strict Output Formatting:**
"${storyTitle}","The Size from your analysis","The Justification from your analysis"

**Your Thought Process:**
---
${thought}
---`
    },
    anubis: {
    think: (feedback, thoughtStreams) => `You are a Lead QA Automation Engineer. Your goal is to design a Gherkin test plan by following a strict rubric.
**Your current task is ONLY to THINK.** Analyze the expanded stories and their acceptance criteria. Incorporate the user's feedback on the previous step. Do NOT write the final Gherkin file yet, just your plan.

**Test Plan Rubric:**
1.  **Feedback Incorporation:** Your thought process **must** begin with a section titled "Addressing Feedback". In this section, you will quote the user's feedback verbatim and then explain, point-by-point, how your subsequent plan has been modified to satisfy it. If the feedback is contradictory or cannot be acted upon, you must explain why.
2.  **Feature File Structure:** Define the overall \`.feature\` file name and its high-level description. Will you need a Background section for common Given steps?
3.  **Scenario Design:** For each User Story's Acceptance Criteria, plan the specific Gherkin Scenarios you will write. You must cover every AC. For each scenario, decide on an appropriate tag (e.g., @Smoke, @Regression, @HappyPath).
4.  **Test Data Specification:** For each Scenario you plan, you MUST also define the prerequisite test data needed to execute it (e.g., specific user accounts, product IDs, invalid inputs).

**Your analysis must be exhaustive for every single item. Under no circumstances should you summarize, abbreviate, or use phrases like 'etc.' or 'and so on'. Generate the full, complete text for your entire thought process.**

**Relevant Thought Stream from Osiris (Expander):**
${thoughtStreams}

**Feedback on Previous Step (Bastet):**
${feedback || 'None provided.'}`,
    write: (thought, expandedStories) => `You are a Lead QA Automation Engineer. You have already planned your test strategy.
**Your current task is ONLY to WRITE the final Gherkin test plan.** Based on your thought process, produce the complete and valid Gherkin \`.feature\` file. Do not add any other text or explanation.

**Strict Output Formatting:**
@Story-Tag
Feature: [Feature Name]
  Background:
    Given ...
  @TestType
  Scenario: [Scenario Name]
    * Test Data:
        * [Prerequisite data point 1]
        * [Prerequisite data point 2]
    Given ...
    When ...
    Then ...

**Your Thought Process:**
${thought}

**Original Context:**
---
**Expanded User Stories:**
${expandedStories}
---`
},
    horus: {
        think: (feedback) => `You are a senior Technical Program Manager. Your goal is to consolidate all project artifacts into a final build package of four CSV files.
**Your current task is ONLY to THINK.** Review all the inputs: the user stories, gaps, estimations, and test cases, along with any final user feedback. Plan how you will parse each of these inputs and correctly format them into the four distinct CSV structures required for the final output. Do NOT write the final CSVs yet, just your plan. **Your analysis must be exhaustive for every single item. Under no circumstances should you summarize, abbreviate, or use phrases like 'etc.' or 'and so on'. Generate the full, complete text for your entire thought process.**

**Feedback on Previous Step (Anubis):**
${feedback || 'None provided.'}`,
        write: (thought, userStories, gaps, estimations, testCases) => `You are a senior Technical Program Manager. You have already planned the final build.
**Your current task is ONLY to WRITE the final build package.** Based on your thought process and the original inputs, produce the final text containing the four specified CSV sections, each separated by \`---[END OF SECTION]---\`. Do not add any other text or explanation.

**Strict Output Formatting:**
## USER_STORIES_CSV
"Epic","Story ID","User Story","Implementation Tasks","Acceptance Criteria"
...
---[END OF SECTION]---
## GAPS_AND_QUESTIONS_CSV
"ID","Type","Description","Status","Owner"
...
---[END OF SECTION]---
## ESTIMATIONS_CSV
"User Story Title","T-Shirt Size","Justification"
...
---[END OF SECTION]---
## TEST_CASES_CSV
"Feature","Scenario ID","Test Type(s)","Steps"
...

**Your Thought Process:**
${thought}

**Original Inputs:**
---
User Stories: ${userStories}
---
Gaps: ${gaps}
---
Estimations: ${estimations}
---
Test Cases: ${testCases}
---`
    }
};

    // --- DOM Elements ---
    const apiKeyModal = document.getElementById('apiKeyModal');
    const openModalButton = document.getElementById('openModalButton');
    const closeModalButton = document.getElementById('closeModalButton');
    const saveApiKeyButton = document.getElementById('saveApiKeyButton');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const projectNameInput = document.getElementById('projectName');
    const additionalContextInput = document.getElementById('additionalContext');
    const startIndexButton = document.getElementById('startIndexButton');
    const downloadContainer = document.getElementById('downloadContainer');
    const thothChatHistory = document.getElementById('thothChatHistory');
    const thothInput = document.getElementById('thothInput');
    const thothSendButton = document.getElementById('thothSendButton');
    const thothAttachmentButton = document.getElementById('thothAttachmentButton');
    const thothAttachmentsContainer = document.getElementById('thothAttachmentsContainer');
    const thothFileInput = document.getElementById('thothFileInput');
    const forgeContent = document.getElementById('forgeContent');
    const runFullAnalysisButton = document.getElementById('runFullAnalysisButton');
    const runStepAnalysisButton = document.getElementById('runStepAnalysisButton');
    const runManualAgentsButton = document.getElementById('runManualAgentsButton');
    const stopAnalysisButton = document.getElementById('stopAnalysisButton');
    const fullscreenModal = document.getElementById('fullscreenModal');
    const modalContent = document.getElementById('modalContent');
    const modalCloseButton = document.getElementById('modalCloseButton');
    const modalDownloadButton = document.getElementById('modalDownloadButton');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerLabel = document.querySelector('.timer-card p');
    const themeToggle = document.getElementById('themeToggle');
    const faqModal = document.getElementById('faqModal');
    const openFaqButton = document.getElementById('openFaqButton');
    const closeFaqModalButton = document.getElementById('closeFaqModalButton');
    const projectGoalModal = document.getElementById('projectGoalModal');
    const saveProjectGoalButton = document.getElementById('saveProjectGoalButton');
    const ultraThinkToggle = document.getElementById('ultraThinkToggle');
    const modalTitle = document.getElementById('modalTitle');
    const modalChatContainer = document.getElementById('modalChatContainer');
    const modalThothInput = document.getElementById('modalThothInput');
    const modalThothSendButton = document.getElementById('modalThothSendButton');
   
    const agentElements = {
        seshat: { progress: document.getElementById('progress-seshat'), out: document.getElementById('indexerOutput'), thoughtStream: null },
        maat: { out: document.getElementById('extractorOutput'), gaps: document.getElementById('gapsOutput'), progress: document.getElementById('progress-maat'), thoughtStream: document.getElementById('thought-stream-maat'), checkbox: document.getElementById('checkbox-maat') },
        ptah: { out: document.getElementById('analyzerOutput'), progress: document.getElementById('progress-ptah'), thoughtStream: document.getElementById('thought-stream-ptah'), checkbox: document.getElementById('checkbox-ptah') },
        osiris: { out: document.getElementById('expanderOutput'), progress: document.getElementById('progress-osiris'), thoughtStream: document.getElementById('thought-stream-osiris'), checkbox: document.getElementById('checkbox-osiris') },
        bastet: { out: document.getElementById('estimatorOutput'), progress: document.getElementById('progress-bastet'), thoughtStream: document.getElementById('thought-stream-bastet'), checkbox: document.getElementById('checkbox-bastet') },
        anubis: { out: document.getElementById('automatorOutput'), progress: document.getElementById('progress-anubis'), thoughtStream: document.getElementById('thought-stream-anubis'), checkbox: document.getElementById('checkbox-anubis') },
        horus: { out: document.getElementById('downloadContainer'), progress: document.getElementById('progress-horus'), thoughtStream: document.getElementById('thought-stream-horus') }
    };

    function updateThothState(isEnabled) {
        thothInput.disabled = !isEnabled;
        thothSendButton.disabled = !isEnabled;
        thothAttachmentButton.disabled = !isEnabled;
    }

    let currentAudio = null;

    function pcmToWav(pcmData, sampleRate) {
        const numChannels = 1;
        const bytesPerSample = 2;
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = pcmData.length * bytesPerSample;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);
        view.setUint32(0, 0x52494646, false);
        view.setUint32(4, 36 + dataSize, true);
        view.setUint32(8, 0x57415645, false);
        view.setUint32(12, 0x666d7420, false);
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bytesPerSample * 8, true);
        view.setUint32(36, 0x64617461, false);
        view.setUint32(40, dataSize, true);
        for (let i = 0; i < pcmData.length; i++) {
            view.setInt16(44 + i * 2, pcmData[i], true);
        }
        return new Blob([view], { type: 'audio/wav' });
    }

    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async function speakText(textToSpeak, buttonElement) {
        const apiKey = getApiKey();
        if (!apiKey) {
            showErrorPopup('API Key is required for Text-to-Speech.');
            return;
        }
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        const originalIcon = buttonElement.innerHTML;
        buttonElement.innerHTML = `<div class="loader !w-3 !h-3 !border-2 !border-t-transparent"></div>`;
        buttonElement.disabled = true;
        try {
            const cleanText = textToSpeak.replace(/(\*|_|`|#)/g, '');
            const payload = {
                contents: [{ parts: [{ text: cleanText }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: "Achird" }
                        }
                    }
                },
                model: "gemini-2.5-flash-preview-tts"
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`TTS API Error: ${errorBody.error.message}`);
            }
            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;
            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRateMatch = mimeType.match(/rate=(\d+)/);
                const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
                const pcmBuffer = base64ToArrayBuffer(audioData);
                const pcm16 = new Int16Array(pcmBuffer);
                const wavBlob = pcmToWav(pcm16, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                currentAudio = new Audio(audioUrl);
                currentAudio.play();
                currentAudio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    currentAudio = null;
                };
            } else {
                throw new Error("Invalid audio data received from API.");
            }
        } catch (error) {
            console.error("Error in speakText:", error);
            showErrorPopup(error.message);
        } finally {
            buttonElement.innerHTML = originalIcon;
            buttonElement.disabled = false;
        }
    }

    thothAttachmentButton.addEventListener('click', () => {
        thothFileInput.click();
    });

    thothFileInput.addEventListener('change', (e) => {
        handleThothFileUploads(e.target.files);
        e.target.value = '';
    });

    async function handleThothFileUploads(files) {
        const fileProcessingPromises = Array.from(files).map(async (file) => {
            const mimeType = file.type;
            if (mimeType.startsWith('image/')) {
                const data = await readFileAsDataURL(file);
                return { name: file.name, mimeType, data: data.split(',')[1] };
            } else if (mimeType === 'application/pdf') {
                const text = await extractTextFromPdf(file);
                return { name: file.name, type: 'text', content: text };
            } else {
                const text = await file.text();
                return { name: file.name, type: 'text', content: text };
            }
        });
        try {
            const processedFiles = await Promise.all(fileProcessingPromises);
            AppState.thothAttachments.push(...processedFiles);
            updateThothAttachmentsUI();
        } catch (error) {
            showErrorPopup('Error processing attachment.');
            console.error(error);
        }
    }

    function updateThothAttachmentsUI() {
        thothAttachmentsContainer.innerHTML = '';
        AppState.thothAttachments.forEach((file, index) => {
            const tag = document.createElement('div');
            tag.className = 'bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-2';
            tag.innerHTML = `
                <span>${file.name}</span>
                <button data-index="${index}" class="remove-attachment-btn text-blue-200 hover:text-white font-bold">&times;</button>
            `;
            thothAttachmentsContainer.appendChild(tag);
        });
    }

    thothAttachmentsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-attachment-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            AppState.thothAttachments.splice(index, 1);
            updateThothAttachmentsUI();
        }
    });

    function clearThothAttachments() {
        AppState.thothAttachments = [];
        updateThothAttachmentsUI();
    }

    const AppState = {
        isUltraThinkEnabled: true, apiKey: '', files: [], documentsContent: "", projectName: '',
        additionalContext: '', projectGoal: '',        
        thothAttachments: [], pendingAnalysisMode: null, documentEmbeddings: [],
        indexedChunksText: null, isIndexingComplete: false, activeMode: 'none',
        stopRequested: false, isRunInProgress: false, currentStep: 'idle',
        timer: { interval: null, secondsElapsed: 0, isRunning: false },
        modal: { content: '', filename: '' },
        agentOutputs: { seshat: '', maat_requirements: '', maat_gaps: '', ptah: '', osiris: '', bastet: '', anubis: '', horus: '' },
        agentFeedback: { maat: '', ptah: '', osiris: '', bastet: '', anubis: '' },
        thoughtStreams: { maat: '', ptah: '', osiris: '', bastet: '', anubis: '', horus: '' },
        refinementHistory: { maat: [], ptah: [], osiris: [], bastet: [], anubis: [] },
        agentUiStates: {
            seshat: { status: 'idle', error: null },
            maat: { status: 'idle', error: null, feedbackSubmitted: false, checked: false },
            ptah: { status: 'idle', error: null, feedbackSubmitted: false, checked: false },
            osiris: { status: 'idle', error: null, feedbackSubmitted: false, checked: false },
            bastet: { status: 'idle', error: null, feedbackSubmitted: false, checked: false },
            anubis: { status: 'idle', error: null, feedbackSubmitted: false, checked: false },
            horus: { status: 'idle', error: null, feedbackSubmitted: false }
        }
    };
    const MAX_FILES = 20;
    const AGENT_PIPELINE = ['maat', 'ptah', 'osiris', 'bastet', 'anubis', 'horus'];
    const SELECTABLE_AGENTS = ['maat', 'ptah', 'osiris', 'bastet', 'anubis'];

    function saveState() {
        const stateToSave = { ...AppState };
        delete stateToSave.files;
        const replacer = (key, value) => {
            if (value instanceof Set) return { _type: 'set', value: [...value] };
            return value;
        };
        const stateString = JSON.stringify(stateToSave, replacer);
        localStorage.setItem('scarabAppState', stateString);
    }

    function loadState() {
        const stateString = localStorage.getItem('scarabAppState');
        if (stateString) {
            try {
                const reviver = (key, value) => {
                    if (value && value._type === 'set') return new Set(value.value);
                    return value;
                };
                const savedState = JSON.parse(stateString, reviver);
                Object.assign(AppState, {
                    ...savedState,
                    timer: { interval: null, secondsElapsed: savedState.timer?.secondsElapsed || 0, isRunning: false },
                    isRunInProgress: false,
                    stopRequested: false,
                });
                console.log("Application state restored.");
            } catch (e) {
                console.error("Failed to parse saved state.", e);
                localStorage.removeItem('scarabAppState');
            }
        }
    }

    const getApiKey = () => AppState.apiKey || localStorage.getItem('geminiApiKey') || '';
   
    openModalButton.addEventListener('click', () => apiKeyModal.classList.remove('hidden'));
    closeModalButton.addEventListener('click', () => apiKeyModal.classList.add('hidden'));
    saveApiKeyButton.addEventListener('click', () => {
        AppState.apiKey = apiKeyInput.value;
        localStorage.setItem('geminiApiKey', AppState.apiKey);
        saveState();
        apiKeyModal.classList.add('hidden');
    });
    apiKeyModal.addEventListener('click', (e) => {
        if (e.target === apiKeyModal) apiKeyModal.classList.add('hidden');
    });
   
    openFaqButton.addEventListener('click', () => faqModal.classList.remove('hidden'));
    closeFaqModalButton.addEventListener('click', () => faqModal.classList.add('hidden'));
    faqModal.addEventListener('click', (e) => {
        if (e.target === faqModal) faqModal.classList.add('hidden');
    });
   
    saveProjectGoalButton.addEventListener('click', () => {
        const projectGoal = document.getElementById('projectGoalInput').value.trim();
        if (!projectGoal) {
            showErrorPopup('Please provide a primary project goal to continue.');
            return;
        }
        AppState.projectGoal = projectGoal;
        projectGoalModal.classList.add('hidden');
        saveState();
        if (AppState.pendingAnalysisMode) {
            startAnalysis(AppState.pendingAnalysisMode);
            AppState.pendingAnalysisMode = null;
        }
    });

    projectNameInput.addEventListener('input', (e) => {
    AppState.projectName = e.target.value.trim();
    updateProcessButtonState();
    saveState();
    });
    additionalContextInput.addEventListener('input', (e) => {
        AppState.additionalContext = e.target.value;
        saveState();
    });

    fileUploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    fileUploadArea.addEventListener('dragenter', () => fileUploadArea.classList.add('dragover'));
    fileUploadArea.addEventListener('dragleave', () => fileUploadArea.classList.remove('dragover'));
    fileUploadArea.addEventListener('drop', (e) => {
        fileUploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    async function handleFiles(newFiles) {
        if (AppState.files.length + newFiles.length > MAX_FILES) {
            showErrorPopup(`You can upload a maximum of ${MAX_FILES} files.`);
            return;
        }
        const fileProcessingPromises = Array.from(newFiles)
            .filter(newFile => !AppState.files.some(existingFile => existingFile.name === newFile.name))
            .map(async (file) => {
                const mimeType = file.type;
                if (mimeType.startsWith('image/')) {
                    const data = await readFileAsDataURL(file);
                    const imageData = data.split(',')[1];
                    return { name: file.name, type: 'image', mimeType: mimeType, data: imageData };
                } else if (mimeType.startsWith('audio/')) {
                    const data = await readFileAsDataURL(file);
                    return { name: file.name, type: 'audio', mimeType: mimeType, data: data.split(',')[1] };
                } else if (mimeType === 'application/pdf') {
                    const text = await extractTextFromPdf(file);
                    return { name: file.name, type: 'text', mimeType: 'text/plain', data: text };
                } else {
                    const text = await file.text();
                    return { name: file.name, type: 'text', mimeType: 'text/plain', data: text };
                }
            });
        try {
            const newlyProcessedFiles = await Promise.all(fileProcessingPromises);
            AppState.files.push(...newlyProcessedFiles);
            updateFileList();
        } catch (error) {
            showErrorPopup('Error processing files.');
            console.error(error);
        }
        AppState.indexedChunksText = null;
        AppState.isIndexingComplete = false;
        updateExecutionButtonStates();
        startIndexButton.textContent = 'Index Documents';
        updateThothState(false);
        thothChatHistory.innerHTML = `<div class="flex justify-start"><div class="chat-bubble chat-bubble-agent"><p>New documents added. Please re-index to update the context.</p></div></div>`;
        clearThothAttachments();
        saveState();
    }
   
    function removeFile(fileNameToRemove) {
        AppState.files = AppState.files.filter(file => file.name !== fileNameToRemove);
        updateFileList();
        AppState.indexedChunksText = null;
        AppState.isIndexingComplete = false;
        updateExecutionButtonStates();
        startIndexButton.textContent = 'Index Documents';
        updateThothState(false);
        thothChatHistory.innerHTML = `<div class="flex justify-start"><div class="chat-bubble chat-bubble-agent"><p>Document removed. Please re-index to update the context.</p></div></div>`;
        clearThothAttachments();
        saveState();
    }

    function updateFileList() {
        fileList.innerHTML = '';
        if (AppState.files.length > 0) {
            AppState.files.forEach((file) => {
                const fileElement = document.createElement('div');
                fileElement.className = 'file-list-item flex justify-between items-center p-2 rounded-md text-sm';
                const fileInfoContainer = document.createElement('div');
                fileInfoContainer.className = 'flex items-center gap-2 overflow-hidden';
                const icon = document.createElement('div');
                if (file.originalType === 'image') {
                    icon.innerHTML = `<svg class="w-6 h-6 file-list-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>`;
                } else {
                    icon.innerHTML = `<svg class="w-6 h-6 file-list-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12m-6.75-4.5h12.75" /></svg>`;
                }
                fileInfoContainer.appendChild(icon);
                const fileNameSpan = document.createElement('span');
                fileNameSpan.className = 'truncate pr-2 file-list-text';
                fileNameSpan.textContent = file.name;
                fileInfoContainer.appendChild(fileNameSpan);
                const removeBtn = document.createElement('button');
                removeBtn.className = 'file-list-remove-btn text-slate-400 hover:text-white font-bold text-lg px-2 flex-shrink-0';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    removeFile(file.name);
                };
                fileElement.appendChild(fileInfoContainer);
                fileElement.appendChild(removeBtn);
                fileList.appendChild(fileElement);
            });
        }
        updateProcessButtonState();
    }
   
    function updateProcessButtonState() {
    const hasFiles = AppState.files.length > 0;
    const hasProjectName = AppState.projectName && AppState.projectName.trim() !== '';
    startIndexButton.disabled = !hasFiles || !hasProjectName;
}

    function updateAgentProgress(agentName, status) {
        const card = document.getElementById(`card-${agentName}`);
        if (!card) return;
        card.classList.remove('glow-default', 'glow-running', 'glow-complete', 'glow-error');
        switch (status) {
            case 'running': card.classList.add('glow-running'); break;
            case 'complete': card.classList.add('glow-complete'); break;
            case 'error': card.classList.add('glow-error'); break;
            default: card.classList.add('glow-default'); break;
        }
    }

    function resetAgentOutputs() {
        AppState.isFullAnalysisComplete = false;
        Object.keys(agentElements).forEach(key => {
            const el = agentElements[key];
            if (el.out && key !== 'horus') el.out.innerHTML = `<p class="text-slate-400">Awaiting analysis...</p>`;
            if (el.gaps) el.gaps.innerHTML = `<p class="text-slate-400">Awaiting analysis...</p>`;
            if (key === 'seshat') document.getElementById('indexerOutput').innerHTML = `<p class="text-slate-400">Document chunks will appear here.</p>`;
            if (key === 'horus') el.out.innerHTML = `<p class="text-slate-500 text-xs">Awaiting pipeline completion...</p>`;
            if (el.thoughtStream) el.thoughtStream.innerHTML = '<p class="text-slate-500 p-4">Awaiting thought stream...</p>';
            const researchBox = document.getElementById(`web-research-${key}`);
            if(researchBox) {
                researchBox.classList.add('hidden');
                const researchContent = document.getElementById(`research-content-${key}`);
                if (researchContent) {
                    researchContent.innerHTML = '';
                }
            }
            const cardDetails = document.getElementById(`agentCard-${key}`);
            if(cardDetails && cardDetails.tagName === 'DETAILS') cardDetails.open = false;
            const card = document.getElementById(`card-${key}`);
            if (card) {
                card.classList.remove('glow-running', 'glow-complete', 'glow-error');
                card.classList.add('glow-default');
            }
            if (AppState.agentUiStates[key]) AppState.agentUiStates[key] = { ...AppState.agentUiStates[key], status: 'idle', error: null, feedbackSubmitted: false };
        });
        updateAllAgentUIs();
    }

    function dotProduct(vecA, vecB) {
        let product = 0;
        for (let i = 0; i < vecA.length; i++) {
            product += vecA[i] * vecB[i];
        }
        return product;
    }

    function magnitude(vec) {
        let sum = 0;
        for (let i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    }

    function cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB) return 0;
        return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
    }

    async function generateImageDescription(apiKey, mimeType, imageData) {
        const model = 'gemini-2.5-flash';
        const prompt = "Provide a detailed, semantic description of the following image. If it contains UI elements, user flows, diagrams, or text, describe them in detail as you would for a product manager or developer to understand its purpose and content. Focus on facts and structure.";
        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: mimeType, data: imageData } }
                ]
            }]
        };
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API request failed: ${errorBody.error.message}`);
            }
            const result = await response.json();
            const description = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!description) {
                throw new Error("Could not extract a description from the API response.");
            }
            return description;
        } catch (error) {
            console.error("Error generating image description:", error);
            showErrorPopup(`Failed to describe image: ${error.message}`);
            return "Error: Could not generate a description for this image.";
        }
    }

    async function extractTextFromPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ');
        }
        return text;
    }

    async function callEmbeddingsApi(apiKey, contents, taskType) {
        const model = 'gemini-embedding-001';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`;
        const requests = contents.map(content => ({
            model: `models/${model}`,
            content: { parts: [{ text: content }] },
            taskType: taskType
        }));
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests })
        });
        if (!response.ok) {
            throw new Error(`Embeddings API request failed: ${await response.text()}`);
        }
        return await response.json();
    }

    async function retrieveRelevantContext(query, topK = 5) {
        if (AppState.documentEmbeddings.length === 0) return "No documents have been embedded yet.";
        const apiKey = getApiKey();
        const queryEmbeddingResponse = await callEmbeddingsApi(apiKey, [query], 'RETRIEVAL_QUERY');
        const queryEmbedding = queryEmbeddingResponse.embeddings[0].values;
        const similarities = AppState.documentEmbeddings.map((doc, index) => ({
            index: index,
            similarity: cosineSimilarity(queryEmbedding, doc.embedding)
        }));
        similarities.sort((a, b) => b.similarity - a.similarity);
        const relevantChunks = similarities.slice(0, topK).map(item => {
            return AppState.documentEmbeddings[item.index].chunk;
        });
        return relevantChunks.join('\n\n---\n\n');
    }

    async function handleRefinement(agentName) {
        const inputElement = document.getElementById(`refinement-input-${agentName}`);
        const historyElement = document.getElementById(`refinement-history-${agentName}`);
        const userMessage = inputElement.value.trim();
        if (!userMessage) return;
        inputElement.value = '';
        inputElement.disabled = true;
        const userBubble = document.createElement('div');
        userBubble.className = 'text-right text-blue-300';
        userBubble.textContent = `You: ${userMessage}`;
        historyElement.appendChild(userBubble);
        AppState.refinementHistory[agentName].push({ role: 'user', content: userMessage });
        try {
            let previousOutput;
if (agentName === 'maat') {
    previousOutput = `### Extracted Requirements\n${AppState.agentOutputs.maat_requirements}\n\n### Identified Gaps & Questions\n${AppState.agentOutputs.maat_gaps}`;
} else {
    previousOutput = AppState.agentOutputs[agentName] || '';
}
            const conversation = AppState.refinementHistory[agentName].map(msg => `${msg.role}: ${msg.content}`).join('\n');
            const refinementPrompt = `You are an expert agent tasked with refining an existing document based on user feedback.
---START ORIGINAL DOCUMENT---
${previousOutput}
---END ORIGINAL DOCUMENT---

---START CONVERSATION HISTORY---
${conversation}
---END CONVERSATION HISTORY---

Your task is to apply the latest user request to the original document. You MUST return the complete, modified document. Do not omit any sections. Do not add conversational text or apologies.`;
            const apiKey = getApiKey();
            const model = 'gemini-2.5-pro';
            const payload = createPayload(refinementPrompt);
            const result = await callStreamingApi(apiKey, payload, agentElements[agentName].out, model, false);
            const newContent = result.text;
            if (agentName === 'maat') {
                const { requirementsText, gapsText } = displayExtractorOutput(newContent);
                AppState.agentOutputs.maat_requirements = requirementsText;
                AppState.agentOutputs.maat_gaps = gapsText;
            } else {
                AppState.agentOutputs[agentName] = newContent;
            }
            saveState();
            AppState.refinementHistory[agentName].push({ role: 'agent', content: '[Updated artifact above]' });
            const agentBubble = document.createElement('div');
            agentBubble.className = 'text-left text-green-300';
            agentBubble.textContent = `Agent: I have updated the artifact above with your changes.`;
            historyElement.appendChild(agentBubble);
            historyElement.scrollTop = historyElement.scrollHeight;
        } catch (error) {
            console.error(`Refinement error for ${agentName}:`, error);
            showErrorPopup(`Failed to apply refinement: ${error.message}`);
        } finally {
            inputElement.disabled = false;
            inputElement.focus();
        }
    }

    function showErrorPopup(message) {
        const popup = document.getElementById('errorPopup');
        popup.textContent = message;
        popup.classList.remove('hidden', 'opacity-0');
        setTimeout(() => popup.classList.add('opacity-0'), 3000);
        setTimeout(() => popup.classList.add('hidden'), 3300);
    }
   
    async function startIndexing() {
        const apiKey = getApiKey();
        if (!apiKey || AppState.files.length === 0) {
            showErrorPopup(!apiKey ? 'API Key is required.' : 'Please upload documents.');
            return;
        }
        setLoadingState(true, startIndexButton, 'Indexing...');
        resetAgentOutputs();
        AppState.agentUiStates.seshat.status = 'running';
        updateAgentProgress('seshat', 'running');
        AppState.documentEmbeddings = [];
        try {
            const filesToProcess = [...AppState.files];
            for (let i = 0; i < filesToProcess.length; i++) {
                const file = filesToProcess[i];
                if (file.type === 'image') {
                    setLoadingState(true, startIndexButton, `Describing ${file.name}...`);
                    const description = await generateImageDescription(apiKey, file.mimeType, file.data);
                    AppState.files[i].data = description;
                    AppState.files[i].type = 'text';
                    AppState.files[i].originalType = 'image';
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            setLoadingState(true, startIndexButton, 'Chunking Documents...');
            const apiParts = AppState.files.map(file => {
                if (file.type === 'text') {
                    return { text: `--- DOCUMENT: ${file.name} ---\n\n${file.data}` };
                }
                return { inlineData: { mimeType: file.mimeType, data: file.data } };
            });
            const chunksText = await runSeshatAgent(apiKey, apiParts);
            if (!chunksText) throw new Error("Seshat (Indexer) failed to produce chunks.");
            const chunksArray = chunksText.split('\n\n---\n\n');
            const BATCH_SIZE = 100;
            const totalBatches = Math.ceil(chunksArray.length / BATCH_SIZE);
            for (let i = 0; i < chunksArray.length; i += BATCH_SIZE) {
                const batchNumber = (i / BATCH_SIZE) + 1;
                setLoadingState(true, startIndexButton, `Embedding Batch ${batchNumber} of ${totalBatches}...`);
                const batch = chunksArray.slice(i, i + BATCH_SIZE);
                const response = await callEmbeddingsApi(apiKey, batch, 'RETRIEVAL_DOCUMENT');
                const embeddings = response.embeddings.map(e => e.values);
                for (let j = 0; j < batch.length; j++) {
                    AppState.documentEmbeddings.push({
                        chunk: batch[j],
                        embedding: embeddings[j]
                    });
                }
                if (totalBatches > 1 && batchNumber < totalBatches) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            AppState.indexedChunksText = chunksText;
            AppState.isIndexingComplete = true;
            AppState.agentUiStates.seshat.status = 'complete';
            updateAgentProgress('seshat', 'complete');
            updateExecutionButtonStates();
            updateThothState(true);
            thothChatHistory.innerHTML = `<div class="flex justify-start"><div class="chat-bubble chat-bubble-agent"><p>Documents indexed & embedded. You can now chat or run the Forge.</p></div></div>`;
            startIndexButton.textContent = 'Documents Indexed';
            startIndexButton.disabled = true;
        } catch (error) {
            console.error(error);
            showErrorPopup(`Indexing error: ${error.message}`);
            AppState.agentUiStates.seshat.status = 'error';
            updateAgentProgress('seshat', 'error');
        } finally {
            setLoadingState(false, startIndexButton, 'Index Documents');
            saveState();
        }
    }

    async function startAnalysis(mode) {
        if (!AppState.projectGoal) {
            AppState.pendingAnalysisMode = mode;
            projectGoalModal.classList.remove('hidden');
            document.getElementById('projectGoalInput').focus();
            return;
        }
        AppState.activeMode = mode;
        AppState.isRunInProgress = true;
        AppState.stopRequested = false;
        if (!AppState.isIndexingComplete) {
            showErrorPopup('Please index documents first.');
            AppState.isRunInProgress = false;
            return;
        }
        updateExecutionButtonStates();
        stopAnalysisButton.classList.remove('hidden');
        startTimer(mode === 'full' || mode === 'manual');
        const pipelineToRun = (mode === 'manual')
            ? AGENT_PIPELINE.filter(agent => AppState.agentUiStates[agent]?.checked)
            : AGENT_PIPELINE;
        if (mode === 'manual' && pipelineToRun.length === 0) {
            showErrorPopup('Please select at least one agent to run.');
            stopAnalysis();
            return;
        }
if (AppState.currentStep === 'idle') {
    AppState.currentStep = pipelineToRun[0] || 'maat';
}    

if (mode === 'full' || mode === 'manual') {
    for (const agentName of pipelineToRun) {
        if (AppState.stopRequested) {
            showErrorPopup("Analysis stopped by user.");
            break;
        }
        AppState.currentStep = agentName;
        await runNextStep();
        const agentState = AppState.agentUiStates[agentName];
        if (agentState.status === 'error') {
            break;
        }
    }
        } else if (mode === 'step') {
    await runNextStep();
    const agentState = AppState.agentUiStates[AppState.currentStep];
    if (agentState.status !== 'error') {
        pauseTimer();
    }
    AppState.isRunInProgress = false;
}

        const lastAgentInRun = pipelineToRun[pipelineToRun.length - 1];
        if (AppState.agentUiStates[lastAgentInRun]?.status === 'complete') {
            // Run completed
        }
        if (AppState.activeMode !== 'step') {
            stopAnalysis();
        } else {
            updateExecutionButtonStates();
        }
    }

    function stopAnalysis() {
        AppState.isRunInProgress = false;
        AppState.stopRequested = false;
        stopTimer();
        updateExecutionButtonStates();
    }
   
    async function runNextStep() {
    const apiKey = getApiKey();
    const currentAgentName = AppState.currentStep;
    const agentState = AppState.agentUiStates[currentAgentName];
    const mode = AppState.activeMode;
    if (!currentAgentName || currentAgentName === 'complete') {
        showErrorPopup('The pipeline is already complete.');
        stopAnalysis();
        return;
    }
    if (!apiKey) {
        showErrorPopup('API Key is required.');
        agentState.status = 'error';
        updateAllAgentUIs();
        return;
    }
    if (!AppState.projectName) {
        showErrorPopup('Please provide Project Name');
        agentState.status = 'error';
        updateAllAgentUIs();
        return;
    }
    const agentIndex = AGENT_PIPELINE.indexOf(currentAgentName);
    if (agentIndex === -1) return;
    if (mode === 'step') {
        if (!AppState.timer.isRunning) resumeTimer();
        runStepAnalysisButton.disabled = true;
    }
    try {
        agentState.status = 'running';
        updateAllAgentUIs();
        let result;
        const prevAgentName = agentIndex > 0 ? AGENT_PIPELINE[agentIndex - 1] : null;
        let prevAgentOutput = prevAgentName ? AppState.agentOutputs[prevAgentName] : null;
        if(currentAgentName === 'osiris') {
            prevAgentOutput = AppState.agentOutputs.ptah;
        } else if (currentAgentName === 'bastet') {
            prevAgentOutput = AppState.agentOutputs.osiris;
        } else if (currentAgentName === 'anubis') {
            prevAgentOutput = AppState.agentOutputs.osiris;
        } else if (currentAgentName === 'ptah') {
            prevAgentOutput = AppState.agentOutputs.maat_requirements;
        }
        switch (currentAgentName) {
            case 'maat':
                result = await runExtractorAgent(apiKey, AppState.indexedChunksText, AppState.additionalContext);                
                AppState.agentOutputs.maat_requirements = result.output;
                AppState.agentOutputs.maat_gaps = result.gapsText;
                AppState.thoughtStreams.maat = result.thought;
                break;
            case 'ptah':
                result = await runBuilderAgent(apiKey, prevAgentOutput, AppState.indexedChunksText, AppState.agentFeedback.maat);
                AppState.agentOutputs.ptah = result.output;
                AppState.thoughtStreams.ptah = result.thought;
                break;
            case 'osiris':
                result = await runExpanderAgent(apiKey, prevAgentOutput, AppState.indexedChunksText, AppState.agentFeedback.ptah);
                AppState.agentOutputs.osiris = result.output;
                AppState.thoughtStreams.osiris = result.thought;
                break;
            case 'bastet':
                result = await runEstimatorAgent(apiKey, prevAgentOutput, AppState.agentFeedback.osiris);
                AppState.agentOutputs.bastet = result.output;
                AppState.thoughtStreams.bastet = result.thought;
                break;
            case 'anubis':
                result = await runAutomatorAgent(apiKey, prevAgentOutput, AppState.agentFeedback.bastet);
                AppState.agentOutputs.anubis = result.output;
                AppState.thoughtStreams.anubis = result.thought;
                break;
            case 'horus':
                result = await runHorusAgent(apiKey, AppState.agentOutputs.ptah, AppState.agentOutputs.maat_gaps, AppState.agentOutputs.bastet, AppState.agentOutputs.anubis, AppState.agentFeedback.anubis);
                AppState.agentOutputs.horus = result.output;
                AppState.thoughtStreams.horus = result.thought;
                break;
        }
        agentState.status = 'complete';
    } catch (error) {
        console.error(`Error in agent ${currentAgentName}:`, error);
        agentState.status = 'error';
        agentState.error = error.message;
        showErrorPopup(`Step failed: ${currentAgentName}. You can add feedback and retry.`);
    } finally {
        updateAllAgentUIs();
        saveState();
        if (mode === 'step' && currentAgentName !== 'horus') {
            const nextIndex = agentIndex + 1;
            AppState.currentStep = AGENT_PIPELINE[nextIndex];
            runStepAnalysisButton.textContent = `Run Next Step (${AppState.currentStep})`;
        }
    }
}

    async function runThinkWriteAgent(apiKey, config) {
        const { agentName, model, thinkPrompt, writePrompt, thinkContext, writeContext, writeTargetElement } = config;
        updateAgentProgress(agentName, 'running');
        let temperature;
        switch (agentName) {
            case 'maat':
            case 'bastet':
                temperature = 0.3;
                break;
            case 'horus':
                temperature = 0.2;
                break;
            default:
                temperature = 0.45;
                break;
        }
        const useSearch = ['maat', 'ptah', 'osiris'].includes(agentName);
        const thinkPayload = {
            contents: [{ role: "user", parts: [...thinkContext, { text: thinkPrompt }] }],
            generationConfig: {
                "maxOutputTokens": 65536,
                "temperature": temperature,
                "topP": 0.95,
                "thinkingConfig": { "thinkingBudget": AppState.isUltraThinkEnabled ? 24576 : -1 }
            }
        };
        if (useSearch) {
            thinkPayload.tools = [{ "google_search": {} }];
        }
        const thinkResult = await callStreamingApi(apiKey, thinkPayload, agentElements[agentName].thoughtStream, model, true);
        const finalThought = thinkResult.text;
        if (!finalThought) throw new Error(`${agentName} (Think) failed to produce output.`);
        const researchBox = document.getElementById(`web-research-${agentName}`);
        const researchContent = document.getElementById(`research-content-${agentName}`);
        if (researchBox && researchContent) {
            const researchRegex = /<web_research>([\s\S]*?)<\/web_research>/g;
            const matches = finalThought.matchAll(researchRegex);
            let researchHTML = '';
            for (const match of matches) {
                const innerXml = match[1];
                const queryMatch = innerXml.match(/<query>([\s\S]*?)<\/query>/);
                const sourceMatch = innerXml.match(/<source>([\s\S]*?)<\/source>/);
                const summaryMatch = innerXml.match(/<summary>([\s\S]*?)<\/summary>/);
                if (queryMatch && sourceMatch && summaryMatch) {
                    const query = queryMatch[1].trim();
                    const source = sourceMatch[1].trim();
                    const summary = summaryMatch[1].trim();
                    researchHTML += `
    <div class="border-t border-slate-700 pt-2 mt-2">
        <p class="text-xs text-slate-400 mb-1"><strong>Query:</strong> ${query}</p>
        <p class="text-xs text-slate-300 mb-1">${summary}</p>
        <a href="${source}" target="_blank" class="text-xs text-blue-400 hover:underline truncate block" rel="noopener noreferrer">Source: ${source}</a>
    </div>
    `;
                }
            }
            if (researchHTML) {
                researchContent.innerHTML = researchHTML;
                researchBox.classList.remove('hidden');
            }
        }
        const outputResult = await callStreamingApi(apiKey, createPayload(writePrompt(finalThought), writeContext, null, false, agentName), writeTargetElement, model, false);
        if (!outputResult.text) throw new Error(`${agentName} (Write) failed to produce output.`);
        updateAgentProgress(agentName, 'complete');
        return { thought: finalThought, output: outputResult.text };
    }

    async function runSeshatAgent(apiKey, apiParts) {
        updateAgentProgress('seshat', 'running');
        const model = 'gemini-2.5-flash';
        const prompt = `You are an expert document analyst. Your task is to analyze the following document(s), which may include text, images, or audio. For each piece of content, identify its source document name. Then, break all the information down into a series of detailed, self-contained, and semantically relevant chunks. Each chunk must have a concise, descriptive title, its content, and the source document name. Return the output as a JSON array of objects.`;
        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    content: { type: "STRING" },
                    source: { type: "STRING" }
                },
                required: ["title", "content", "source"]
            }
        };
        const finalApiParts = [...apiParts, {text: prompt}];
        const payload = createPayload(null, finalApiParts, schema);
        const result = await callStreamingApi(apiKey, payload, null, model, false);
        const jsonText = result.text;
        try {
            if (!jsonText) {
                throw new Error("The API returned an empty response. The document might be empty or unreadable.");
            }
            const chunksArray = JSON.parse(jsonText);
            const chunksText = chunksArray.map((chunk, i) => `Chunk ${i+1}: ${chunk.title}\nSource: ${chunk.source}\n${chunk.content}`).join('\n\n---\n\n');
            agentElements.seshat.out.innerHTML = '';
            chunksArray.forEach(chunk => {
                const chunkElement = document.createElement('div');
                chunkElement.className = 'p-4 border border-slate-700 rounded-lg bg-slate-800/50 mb-3';
                const sourceLabel = document.createElement('p');
                sourceLabel.className = 'text-xs font-semibold text-purple-400 mb-2 mono-font';
                sourceLabel.textContent = `Source: ${chunk.source || 'Unknown'}`;
                chunkElement.innerHTML = `<h4 class="font-semibold text-indigo-400 mb-2">${chunk.title}</h4><p class="text-sm text-slate-300">${chunk.content}</p>`;
                chunkElement.prepend(sourceLabel);
                agentElements.seshat.out.appendChild(chunkElement);
            });
            updateAgentProgress('seshat', 'complete');
            return chunksText;
        } catch (e) {
            console.error("Failed to parse Seshat's JSON output:", e);
            agentElements.seshat.out.innerHTML = `<p class="text-red-400">Error: Could not parse document chunks.</p>`;
            updateAgentProgress('seshat', 'error');
            throw new Error("Seshat failed to produce valid JSON chunks.");
        }
    }

    async function runExtractorAgent(apiKey, indexedChunks, additionalContext) {
    const retrievalQuery = `Project Goal: ${AppState.projectGoal}\n\nAdditional Context: ${additionalContext}`;
    const relevantContext = await retrieveRelevantContext(retrievalQuery);
    const config = {
        agentName: 'maat', model: 'gemini-2.5-pro',
        thinkPrompt: PROMPTS.maat.think(additionalContext),
        writePrompt: (thought) => PROMPTS.maat.write(thought, 'No stakeholder context provided.', relevantContext),
        thinkContext: [{text: `Semantically Relevant Chunks:\n${relevantContext}`}],
        writeContext: [], writeTargetElement: null
    };
    const { thought, output } = await runThinkWriteAgent(apiKey, config);
    const { requirementsText, gapsText } = displayExtractorOutput(output);
    return { thought, output: requirementsText, gapsText };
}

    async function runBuilderAgent(apiKey, requirements, indexedChunks, feedback) {
        const thoughts = AppState.thoughtStreams.maat;
        const config = {
            agentName: 'ptah', model: 'gemini-2.5-pro',
            thinkPrompt: PROMPTS.ptah.think(feedback, thoughts),
            writePrompt: (thought) => PROMPTS.ptah.write(thought, requirements, indexedChunks),
            thinkContext: [{text: `Requirements:\n${requirements}`}, {text: `Chunks:\n${indexedChunks}`}],
            writeContext: [], writeTargetElement: agentElements.ptah.out
        };
        return await runThinkWriteAgent(apiKey, config);
    }

    async function runExpanderAgent(apiKey, userStories, indexedChunks, feedback) {
        const thoughts = `--- From Ma'at ---\n${AppState.thoughtStreams.maat}\n\n--- From Ptah ---\n${AppState.thoughtStreams.ptah}`;
        const config = {
            agentName: 'osiris', model: 'gemini-2.5-pro',
            thinkPrompt: PROMPTS.osiris.think(feedback, thoughts),
            writePrompt: (thought) => PROMPTS.osiris.write(thought, userStories, indexedChunks),
            thinkContext: [{text: `User Stories:\n${userStories}`}, {text: `Chunks:\n${indexedChunks}`}],
            writeContext: [], writeTargetElement: agentElements.osiris.out
        };
        return await runThinkWriteAgent(apiKey, config);
    }

    async function runEstimatorAgent(apiKey, expandedStories, feedback) {
        const agentName = 'bastet';
        const model = 'gemini-2.5-pro';
        const agentUI = agentElements[agentName];
        updateAgentProgress(agentName, 'running');
        agentUI.out.innerHTML = '';
        const storyTitleRegex = /## User Story:\s*(.*)/;
        const storyDelimiterRegex = /(?=## User Story:)/g;
        const stories = expandedStories.split(storyDelimiterRegex).filter(s => s.trim() !== '');
        if (stories.length === 0) {
            throw new Error("No user stories could be parsed from the previous agent's output.");
        }
        let allEstimatesCsv = '"User Story Title","T-Shirt Size","Justification"\n';
        let fullThoughtStream = '';
        const previousThoughts = AppState.thoughtStreams.osiris;
        agentUI.out.innerHTML = marked.parse(`\`\`\`csv\n${allEstimatesCsv}\`\`\``);
        for (const storyText of stories) {
            if (AppState.stopRequested) {
                showErrorPopup("Analysis stopped by user.");
                break;
            }
            const match = storyText.match(storyTitleRegex);
            const storyTitle = match ? match[1].trim() : 'Untitled Story';
            try {
                const thinkPrompt = PROMPTS.bastet.think(storyText, storyTitle, feedback, previousThoughts);
                const thinkResult = await callStreamingApi(apiKey, createPayload(thinkPrompt, [], null, false, 'bastet'), null, model, false);
                const thought = thinkResult.text;
                if (!thought) throw new Error(`Bastet (Think) failed for story: ${storyTitle}`);
                fullThoughtStream += `--- Analyzing Story: "${storyTitle}" ---\n${thought}\n\n`;
                agentUI.thoughtStream.innerHTML = marked.parse(fullThoughtStream);
                agentUI.thoughtStream.scrollTop = agentUI.thoughtStream.scrollHeight;
                const writePrompt = PROMPTS.bastet.write(thought, storyTitle);
                const writeResult = await callStreamingApi(apiKey, createPayload(writePrompt, [], null, false, 'bastet'), null, model, false);
                if (!writeResult.text) throw new Error(`Bastet (Write) failed for story: ${storyTitle}`);
                const lineToAdd = writeResult.text.trim();
                allEstimatesCsv += lineToAdd + '\n';
                agentUI.out.innerHTML = marked.parse(`\`\`\`csv\n${allEstimatesCsv}\`\`\``);
                agentUI.out.scrollTop = agentUI.out.scrollHeight;
            } catch (error) {
                console.error(`Error processing story "${storyTitle}" in Bastet:`, error);
                allEstimatesCsv += `"${storyTitle}","ERROR","${error.message}"\n`;
            }
        }
        updateAgentProgress(agentName, 'complete');
        return { thought: fullThoughtStream, output: allEstimatesCsv.trim() };
    }

    async function runAutomatorAgent(apiKey, expandedStories, feedback) {
        const thoughts = AppState.thoughtStreams.osiris;
        const config = {
            agentName: 'anubis', model: 'gemini-2.5-pro',
            thinkPrompt: PROMPTS.anubis.think(feedback, thoughts),
            writePrompt: (thought) => PROMPTS.anubis.write(thought, expandedStories),
            thinkContext: [{text: `Expanded Stories:\n${expandedStories}`}],
            writeContext: [], writeTargetElement: agentElements.anubis.out
        };
        return await runThinkWriteAgent(apiKey, config);
    }
   
    async function runHorusAgent(apiKey, userStories, gaps, estimations, testCases, feedback) {
        const config = {
            agentName: 'horus', model: 'gemini-2.5-pro',
            thinkPrompt: PROMPTS.horus.think(feedback),
            writePrompt: (thought) => PROMPTS.horus.write(thought, userStories, gaps, estimations, testCases),
            thinkContext: [{text: `Stories:\n${userStories}`}, {text: `Gaps:\n${gaps}`}, {text: `Estimates:\n${estimations}`}, {text: `Tests:\n${testCases}`}],
            writeContext: [], writeTargetElement: null
        };
        const { thought, output } = await runThinkWriteAgent(apiKey, config);
        displayHorusOutput(output, AppState.projectName);
        return { thought, output };
    }

    async function handleThothChat() {
        const userPrompt = thothInput.value.trim();
        if (!userPrompt && AppState.thothAttachments.length === 0) return;
        const apiKey = getApiKey();
        if (!apiKey) {
            showErrorPopup('API Key is required.');
            return;
        }
        if (AppState.documentEmbeddings.length === 0 && AppState.thothAttachments.length === 0) {
            showErrorPopup('Please index documents or attach a file to the chat.');
            return;
        }
        appendMessageToChat(userPrompt || '[Attached Files]', 'user', 'text');
        thothInput.value = '';
        const thinkingBubble = appendMessageToChat('Thinking...', 'agent', 'thinking');
        try {
            let contextForChat = "No indexed documents available.";
            if (AppState.documentEmbeddings.length > 0) {
                contextForChat = await retrieveRelevantContext(userPrompt || "Analyze the attached files.");
            }
            const agentThoughts = Object.entries(AppState.thoughtStreams)
                .filter(([, value]) => value)
                .map(([key, value]) => `--- Thought Stream from ${key.toUpperCase()} ---\n${value}`)
                .join('\n\n');
            const apiParts = [];
            AppState.thothAttachments.forEach(file => {
                if (file.type === 'text') {
                    apiParts.push({ text: `--- Attached File: ${file.name} ---\n${file.content}` });
                } else {
                    apiParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
                }
            });
            const fullUserPrompt =
            `Your persona is a Principal Solution Architect. Your goal is to provide expert, factual guidance based on the context provided. You have access to web search to clarify technical terms or concepts if needed.

**COMMUNICATION RULES:**
1.  Analyze the user's question from the perspective of a Principal Solution Architect.
2.  Formulate your answer based on the information contained within the provided context and, if necessary, supplement it with factual information from your web search.
3.  Present the answer in a neutral, factual, and impersonal tone.
4.  DO NOT use first-person statements (e.g., "I think," "I recommend," "As a PSA...").
5.  DO NOT address the user by any name, even if a name appears in the context.
6.  If the answer is not in the provided context or cannot be found with a web search, you must state: "The answer to that question is not available in the provided documents."

---START OF CONTEXT---
**Relevant Document Excerpts:**
${contextForChat}

**Agent Analysis & Research So Far:**
${agentThoughts || 'No analysis has been run yet.'}
---END OF CONTEXT---

User Question: ${userPrompt || "Please analyze the attached file(s) in the context of our discussion."}`;
            apiParts.push({ text: fullUserPrompt });
            const payload = createPayload(null, apiParts, null, true);
            const output = await callStreamingApi(apiKey, payload, null, 'gemini-2.5-pro');
            thinkingBubble.parentElement.remove();
            appendMessageToChat(output.text, 'agent', 'text');
        } catch (error) {
            console.error("Thoth Error:", error);
            thinkingBubble.parentElement.remove();
            appendMessageToChat(`Sorry, an error occurred: ${error.message}`, 'agent', 'text');
        } finally {
            clearThothAttachments();
        }
    }
   
    function appendMessageToChat(content, sender, type = 'text') {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        const messageBubble = document.createElement('div');
        messageBubble.className = `chat-bubble ${sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}`;
        switch (type) {
            case 'thinking':
                messageBubble.innerHTML = `<div class="flex items-center gap-2"><div class="loader !w-4 !h-4 !border-2"></div><span>Thinking...</span></div>`;
                break;
            case 'image':
                messageBubble.style.padding = '0.5rem';
                const img = document.createElement('img');
                img.src = `data:image/png;base64,${content}`;
                img.className = 'rounded-lg max-w-full h-auto';
                messageBubble.appendChild(img);
                break;
            case 'text':
            default:
                const textContent = document.createElement('div');
                textContent.innerHTML = marked.parse(content);
                messageBubble.appendChild(textContent);
                if (sender === 'agent') {
                    const buttonContainer = document.createElement('div');
                    buttonContainer.className = 'absolute bottom-1 right-1 flex gap-1';
                    const speechButton = document.createElement('button');
                    speechButton.className = 'speech-btn copy-btn opacity-50 hover:opacity-100 transition-opacity';
                    speechButton.title = 'Read aloud';
                    speechButton.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>`;
                    speechButton.onclick = (e) => speakText(content, e.currentTarget);
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-btn opacity-50 hover:opacity-100 transition-opacity';
                    copyButton.title = 'Copy message';
                    copyButton.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
                    copyButton.onclick = () => copyToClipboard(null, content);
                    buttonContainer.appendChild(speechButton);
                    buttonContainer.appendChild(copyButton);
                    messageBubble.appendChild(buttonContainer);
                }
                break;
        }
        messageWrapper.appendChild(messageBubble);
        thothChatHistory.appendChild(messageWrapper);
        thothChatHistory.scrollTop = thothChatHistory.scrollHeight;
        if (!fullscreenModal.classList.contains('hidden') && !modalChatContainer.classList.contains('hidden')) {
            modalContent.innerHTML = thothChatHistory.innerHTML;
            modalContent.scrollTop = modalContent.scrollHeight;
        }
        return messageBubble;
    }

    thothSendButton.addEventListener('click', handleThothChat);
    thothInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleThothChat();
        }
    });

    modalThothSendButton.addEventListener('click', () => {
        const userPrompt = modalThothInput.value.trim();
        if (userPrompt) {
            thothInput.value = userPrompt;
            handleThothChat();
            modalThothInput.value = '';
        }
    });

    modalThothInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            modalThothSendButton.click();
        }
    });

    function createPayload(prompt, contextParts = [], schema = null, useTools = false, agentName = 'default') {
        const allParts = [...contextParts];
        if (prompt) {
            allParts.push({text: prompt});
        }
        let temperature;
        switch (agentName) {
            case 'maat':
            case 'bastet':
                temperature = 0.3;
                break;
            case 'horus':
                temperature = 0.2;
                break;
            default:
                temperature = 0.45;
                break;
        }
        const payload = {
            contents: [{ role: "user", parts: allParts }],
            generationConfig: {
                "maxOutputTokens": 65536,
                "temperature": temperature,
                "topP": 0.95,
                "thinkingConfig": { "thinkingBudget": AppState.isUltraThinkEnabled ? 24576 : -1 }
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ]
        };
        if (schema) {
            payload.generationConfig.responseMimeType = "application/json";
            payload.generationConfig.responseSchema = schema;
        }
        if (useTools) {
            payload.tools = [{ "google_search": {} }];
        }
        return payload;
    }

    function displayExtractorOutput(output) {
        const gapsIdentifier = /### Identified Gaps & Questions/i;
        const requirementsIdentifier = /### Extracted Requirements/i;
        let requirementsText = output, gapsText = '';
        if (gapsIdentifier.test(output)) {
            [requirementsText, gapsText] = output.split(gapsIdentifier);
        }
        requirementsText = requirementsText.replace(requirementsIdentifier, '').trim();
        agentElements.maat.out.innerHTML = marked.parse(requirementsText);
        agentElements.maat.gaps.innerHTML = gapsText.trim() ? marked.parse(gapsText) : '<p class="text-slate-400">No gaps identified.</p>';
        return { requirementsText, gapsText: gapsText.trim() };
    }
   
    function displayHorusOutput(allTextOutput, projectName) {
        if (!allTextOutput || !allTextOutput.trim()) {
            showErrorPopup('Orchestrator failed to produce a build.');
            return;
        }
        const finalFileName = projectName.replace(/\s/g, '_') || 'SCARAB_Build';
        const sections = allTextOutput.split('---[END OF SECTION]---');
        const [userStoriesCsv, gapsCsv, estimationsCsv, testCasesCsv] = sections.map(s => s.replace(/##.*_CSV\s*/, '').trim());
        try {
            const zip = new JSZip();
            if (userStoriesCsv) zip.file(`${finalFileName}_1_user_stories.csv`, userStoriesCsv);
            if (gapsCsv) zip.file(`${finalFileName}_2_gaps_and_questions.csv`, gapsCsv);
            if (estimationsCsv) zip.file(`${finalFileName}_3_estimations.csv`, estimationsCsv);
            if (testCasesCsv) zip.file(`${finalFileName}_4_test_cases.csv`, testCasesCsv);
            zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    const downloadButton = document.createElement('button');
                    downloadButton.className = 'btn btn-success text-white font-bold py-3 px-6 rounded-lg';
                    downloadButton.textContent = `Download "${finalFileName}.zip"`;
                    downloadButton.onclick = () => saveAs(content, `${finalFileName}.zip`);
                    downloadContainer.innerHTML = '';
                    downloadContainer.appendChild(downloadButton);
                });
        } catch (error) {
            console.error("Error creating zip file:", error);
            showErrorPopup('Failed to create the final build package.');
        }
    }
   
    async function callStreamingApi(apiKey, payload, targetElement, model, checkForTools) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
        if (targetElement) targetElement.innerHTML = '';
        let fullResponseText = '';
        let toolCallParts = [];
        let toolCodeResults = [];
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API request failed: ${await response.text()}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let eolIndex;
            while ((eolIndex = buffer.indexOf('\n')) >= 0) {
                const line = buffer.substring(0, eolIndex).trim();
                buffer = buffer.substring(eolIndex + 1);
                if (line.startsWith('data: ')) {
                    try {
                        const chunk = JSON.parse(line.substring(6));
                        const candidate = chunk.candidates?.[0];
                        if (candidate?.content?.parts) {
                            candidate.content.parts.forEach(part => {
                                if (part.text) {
                                    fullResponseText += part.text;
                                    if (targetElement) {
                                        targetElement.innerHTML = marked.parse(fullResponseText);
                                        targetElement.scrollTop = targetElement.scrollHeight;
                                    }
                                } else if (checkForTools && part.tool_code) {
                                    toolCallParts.push(part.tool_code);
                                } else if (part.tool_code_result) {
                                    toolCodeResults.push(part.tool_code_result);
                                }
                            });
                        }
                    } catch (error) {
                        // Ignore parsing errors for incomplete JSON chunks
                    }
                }
            }
        }
        return { text: fullResponseText.trim(), toolCalls: toolCallParts, toolCodeResults: toolCodeResults };
    }

    function setLoadingState(isLoading, button, text) {
        button.disabled = isLoading;
        button.innerHTML = isLoading ? `<div class="loader !w-6 !h-6 !border-2"></div><span class="ml-2">Running...</span>` : text;
    }

    function copyToClipboard(elementId, textToCopy) {
        if (elementId) textToCopy = document.getElementById(elementId).innerText;
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    }
   
    function startTimer(isContinuous = false) {
        if (AppState.timer.isRunning) return;
        if (!isContinuous || !AppState.isManualRunStarted) {
            AppState.timer.secondsElapsed = 0;
        }
        AppState.timer.isRunning = true;
        timerLabel.textContent = "The current task is running...";
        updateTimerDisplay();
        AppState.timer.interval = setInterval(() => {
            AppState.timer.secondsElapsed++;
            updateTimerDisplay();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(AppState.timer.interval);
        AppState.timer.isRunning = false;
        timerLabel.textContent = `The Forge paused after ${AppState.timer.secondsElapsed} seconds.`;
    }

    function resumeTimer() {
        if (AppState.timer.isRunning) return;
        AppState.timer.isRunning = true;
        timerLabel.textContent = "The current task is running...";
        AppState.timer.interval = setInterval(() => {
            AppState.timer.secondsElapsed++;
            updateTimerDisplay();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(AppState.timer.interval);
        AppState.timer.isRunning = false;
        if (AppState.timer.secondsElapsed > 0) {
            timerLabel.textContent = `The current task ran for ${AppState.timer.secondsElapsed} seconds.`;
        }
        AppState.isManualRunStarted = false;
    }

    function updateTimerDisplay() {
        const secondsStr = AppState.timer.secondsElapsed.toString().padStart(4, '0');
        timerDisplay.innerHTML = `<span class="timer-digit">${secondsStr[0]}</span><span class="timer-digit">${secondsStr[1]}</span><span class="timer-digit">${secondsStr[2]}</span><span class="timer-digit">${secondsStr[3]}</span>`;
    }

    function openModal(content, filename, type = 'text', agentName = 'Content') {
        AppState.modal = { content, filename };
        modalTitle.textContent = `${agentName}: ${type.replace(/_/g, ' ')}`;
        if (type === 'Chat_History') {
            modalContent.innerHTML = content;
            modalChatContainer.classList.remove('hidden');
            modalThothInput.focus();
        } else {
            modalContent.innerHTML = marked.parse(content);
            modalChatContainer.classList.add('hidden');
        }
        fullscreenModal.classList.remove('hidden');
    }

    function closeModal() {
        fullscreenModal.classList.add('hidden');
        modalContent.innerHTML = '';
        AppState.modal = { content: '', filename: '' };
    }

    modalCloseButton.addEventListener('click', closeModal);
    fullscreenModal.addEventListener('click', (e) => {
        if (e.target === fullscreenModal) closeModal();
    });

    modalDownloadButton.addEventListener('click', () => {
        if (AppState.modal.content && AppState.modal.filename) {
            const blob = new Blob([AppState.modal.content], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, AppState.modal.filename);
        }
    });

    document.querySelectorAll('.expand-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const { contentSource, agentName, contentType } = e.currentTarget.dataset;
            const sourceElement = document.getElementById(contentSource);
            if (sourceElement) {
                const projName = AppState.projectName.replace(/\s/g, '_') || 'Project';
                const filename = `SCARAB_${projName}_${agentName}_${contentType}.txt`;
                if (contentType === 'Chat_History') {
                    openModal(sourceElement.innerHTML, filename, contentType, agentName);
                } else {
                    const content = sourceElement.innerText;
                    openModal(content, filename, contentType, agentName);
                }
            }
        });
    });

    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(e.currentTarget.dataset.target);
        });
    });
   
    const themeIcon = document.getElementById('themeIcon');
    const sunIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
    const moonIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeIcon.innerHTML = moonIcon;
        } else {
            document.body.classList.remove('light-mode');
            themeIcon.innerHTML = sunIcon;
        }
    }

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.toggle('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
   
    function updateAgentCardUI(agentName) {
    const uiState = AppState.agentUiStates[agentName];
    if (!uiState) return;
    const controls = document.getElementById(`controls-${agentName}`);
    if (!controls) return;
    const feedbackBtn = controls.querySelector('.feedback-btn');
    const retryBtn = controls.querySelector('.retry-btn');
    const feedbackBox = document.getElementById(`refinement-chat-${agentName}`);

    // Always hide the feedback box and buttons by default
    feedbackBox?.classList.add('hidden');
    feedbackBtn?.classList.add('hidden');
    retryBtn?.classList.add('hidden');

    if (feedbackBtn) {
        feedbackBtn.disabled = uiState.feedbackSubmitted;
    }

    updateAgentProgress(agentName, uiState.status);

    switch (uiState.status) {
        case 'complete':
            // Only show the feedback button if the mode is 'step' AND feedback hasn't been submitted yet
            if (AppState.activeMode === 'step' && !uiState.feedbackSubmitted) {
                feedbackBtn?.classList.remove('hidden');
            }
            break;
        case 'editing_feedback':
            feedbackBox?.classList.remove('hidden');
            feedbackBox?.querySelector('input')?.focus();
            break;
        case 'error':
            retryBtn?.classList.remove('hidden');
            if (AppState.activeMode === 'step') {
                feedbackBtn?.classList.remove('hidden');
            }
            break;
    }
}

    function updateAllAgentUIs() {
        AGENT_PIPELINE.forEach(agentName => updateAgentCardUI(agentName));
    }

    function updateExecutionButtonStates() {
        const isAnalysisRunning = AppState.isRunInProgress;
        const isIndexingDone = AppState.isIndexingComplete;
        const isComplete = AppState.currentStep === 'complete';
        ultraThinkToggle.disabled = isAnalysisRunning;
        runFullAnalysisButton.disabled = isAnalysisRunning || !isIndexingDone || isComplete;
        runStepAnalysisButton.disabled = isAnalysisRunning || !isIndexingDone || isComplete;
        runManualAgentsButton.disabled = isAnalysisRunning || !isIndexingDone || isComplete;
        if (isAnalysisRunning) {
            runFullAnalysisButton.classList.add('hidden');
            runStepAnalysisButton.classList.add('hidden');
            runManualAgentsButton.classList.add('hidden');
            stopAnalysisButton.classList.remove('hidden');
        } else {
            runFullAnalysisButton.classList.remove('hidden');
            runStepAnalysisButton.classList.remove('hidden');
            runManualAgentsButton.classList.remove('hidden');
            stopAnalysisButton.classList.add('hidden');
        }
        const stepButtonTextSpan = runStepAnalysisButton.querySelector('span');
        if (stepButtonTextSpan) {
            if (AppState.activeMode === 'step' && !isAnalysisRunning && !isComplete) {
                stepButtonTextSpan.textContent = `Next Step (${AppState.currentStep})`;
            } else if (!isAnalysisRunning) {
                stepButtonTextSpan.textContent = 'HTL Analysis';
            }
        }
    }

    SELECTABLE_AGENTS.forEach((agentName) => {
        const checkbox = agentElements[agentName].checkbox;
        checkbox.addEventListener('change', () => {
            AppState.agentUiStates[agentName].checked = checkbox.checked;
            saveState();
        });
    });

    document.getElementById('agentGrid').addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    const agentCard = button.closest('.card');
    const agentName = agentCard?.id.split('-')[1];
    if (!agentName) return;
    const uiState = AppState.agentUiStates[agentName];

    if (button.classList.contains('feedback-btn')) {
        console.log(`--- Feedback Button Clicked for [${agentName}] ---`);
        const feedbackBox = document.getElementById(`refinement-chat-${agentName}`);
        console.log(`Attempting to find feedback box with ID: refinement-chat-${agentName}. Found:`, feedbackBox);
        uiState.status = 'editing_feedback';
        AppState.refinementHistory[agentName] = [];
        const historyElement = document.getElementById(`refinement-history-${agentName}`);
        if (historyElement) historyElement.innerHTML = '';

    } else if (button.classList.contains('refinement-send-btn')) {
        handleRefinement(agentName);

    } else if (button.classList.contains('approve-and-continue-btn')) {
        if (AppState.activeMode === 'step') {
            uiState.status = 'complete';
            uiState.feedbackSubmitted = true;
            updateAgentCardUI(agentName);
            const nextIndex = AGENT_PIPELINE.indexOf(agentName) + 1;
            if (nextIndex < AGENT_PIPELINE.length) {
                AppState.currentStep = AGENT_PIPELINE[nextIndex];
                startAnalysis('step');
            } else {
                stopAnalysis();
            }
        }
    } else if (button.classList.contains('retry-btn')) {
        startAnalysis(AppState.activeMode);
    }
    updateAgentCardUI(agentName);
});

    function hydrateUIFromState() {
    apiKeyInput.value = getApiKey();
    projectNameInput.value = AppState.projectName || '';
    additionalContextInput.value = AppState.additionalContext || '';
    updateFileList();
    updateProcessButtonState();
    Object.keys(AppState.agentOutputs).forEach(key => {
        if (key === 'maat_requirements' && AppState.agentOutputs[key]) agentElements.maat.out.innerHTML = marked.parse(AppState.agentOutputs[key]);
        else if (key === 'maat_gaps' && AppState.agentOutputs[key]) agentElements.maat.gaps.innerHTML = marked.parse(AppState.agentOutputs[key]);
        else if (agentElements[key]?.out && AppState.agentOutputs[key] && key !== 'horus') {
            agentElements[key].out.innerHTML = marked.parse(AppState.agentOutputs[key]);
        }
    });
    Object.keys(AppState.agentFeedback).forEach(agentName => {
        const feedbackBox = document.getElementById(`feedback-box-${agentName}`);
        if (feedbackBox) feedbackBox.querySelector('textarea').value = AppState.agentFeedback[agentName] || '';
    });
    SELECTABLE_AGENTS.forEach(agentName => {
        const checkbox = agentElements[agentName].checkbox;
        const uiState = AppState.agentUiStates[agentName];
        if (checkbox && uiState) {
            checkbox.checked = uiState.checked;
        }
    });
    if (AppState.isIndexingComplete) {
        startIndexButton.textContent = 'Documents Indexed';
        startIndexButton.disabled = true;
        thothInput.disabled = false;
        thothSendButton.disabled = false;
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    updateTimerDisplay();
    updateExecutionButtonStates();
    updateAllAgentUIs();
}
   
    loadState();
    ultraThinkToggle.addEventListener('change', (e) => {
        AppState.isUltraThinkEnabled = e.target.checked;
        saveState();
    });

        startIndexButton.addEventListener('click', startIndexing);
        runFullAnalysisButton.addEventListener('click', () => startAnalysis('full'));
        runStepAnalysisButton.addEventListener('click', () => startAnalysis('step'));
        runManualAgentsButton.addEventListener('click', () => startAnalysis('manual')); 

    hydrateUIFromState();
});
