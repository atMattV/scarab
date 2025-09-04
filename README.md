SCARAB - System for Crafting Agile Roadmaps And Backlogs
SCARAB is a powerful, browser-based multi-agent system designed to accelerate the initial phases of agile software development. It leverages the Google Gemini model to analyze raw project documents—such as Product Requirement Documents (PRDs), text files, PDFs, and even images of whiteboards—and transforms them into a structured set of downloadable agile artifacts.

This tool is built as a single, self-contained HTML file, making it incredibly easy to run locally or deploy on any static hosting service.

✨ Features
Multi-Agent Pipeline: A series of specialized AI agents work in sequence to process information and build upon each other's work, ensuring a comprehensive and structured output.

Versatile Document Handling: Upload and process various file types including .txt, .md, .pdf, .json, and image files (.png, .jpg). Image content is analyzed and described by a vision-capable model.

RAG-Powered Context: Utilizes a Retrieval-Augmented Generation (RAG) pipeline to index all document content, enabling a powerful semantic search and providing deep contextual understanding for all agents.

Contextual Q&A Chat: Interact with an AI chat agent that has full context of your uploaded documents and the generated artifacts to answer specific questions.

Flexible Execution Modes:

Full Analysis: Run the entire pipeline from start to finish without interruption.

HTL (Human-in-the-Loop) Analysis: Run the pipeline step-by-step, allowing you to review, edit, and approve the output of each agent before proceeding.

Manual Agent Selection: Choose and run specific agents from the pipeline on demand.

"UltraThink" Mode: Allocate a larger processing budget to the AI models for more detailed internal reasoning, planning, and web research, leading to higher-quality results for complex documents.

Downloadable Artifacts: The final output is compiled into a .zip file containing organized CSVs, ready for import into project management tools like Jira or Azure DevOps.

🤖 The Agent Pipeline
SCARAB's workflow is powered by a series of specialized agents:

RAG Indexer: Reads and processes all uploaded documents. It describes images and breaks down all text into semantically relevant chunks, creating vector embeddings for the RAG index.

Requirements Extractor: Analyzes the indexed chunks to identify functional/non-functional requirements, gaps, and ambiguities. It uses web search to enrich technical terms.

User Stories Builder: Converts the extracted requirements into a formal agile backlog of Epics and User Stories. It uses web search to enrich personas and justifications.

User Stories Expander: Elaborates on each user story by adding detailed technical implementation tasks and Gherkin-style acceptance criteria.

Effort Estimator: Assesses the complexity of each expanded story and assigns a T-shirt size estimate (XS, S, M, L, XL) with a justification.

Test Cases Builder: Generates BDD (Behavior-Driven Development) test cases in Gherkin format based on the acceptance criteria.

Artifacts Compiler: Gathers all the generated artifacts and packages them into the final downloadable .zip file.

🛠️ Tech Stack
Frontend: HTML, JavaScript, Tailwind CSS

AI & Machine Learning: Google Gemini API (including Gemini Pro, Flash, and text embedding models)

Core Libraries:

PDF.js for client-side PDF text extraction.

JSZip for creating the downloadable .zip archive.

FileSaver.js for saving the generated files.

Marked.js for rendering Markdown in the UI.

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
A modern web browser (e.g., Chrome, Firefox, Safari, Edge).

A Google Gemini API key. You can obtain one from Google AI Studio.

Installation & Setup
Clone the repository (or download the HTML file):

git clone [https://github.com/YOUR_USERNAME/scarab.git](https://github.com/YOUR_USERNAME/scarab.git)

Open the file in your browser:

Navigate to the repository folder on your local machine.

Double-click the index.html file to open it directly in your browser.

Set Your API Key:

Click the "API" button in the top-right corner of the application.

Enter your Google Gemini API key into the modal and click "Save". The key is stored only in your browser's local storage and is never sent anywhere except to the official Google AI APIs.

⚙️ How to Use
Upload Documents: Click the upload area to select your project files or drag and drop them.

Define Context: Enter a Project Name and provide the high-level Project Goal. This context is crucial for guiding the AI agents.

Index Documents: Click the Index Documents button. The RAG Indexer agent will process and embed the content of your files. This step is required before you can run any analysis.

Choose an Analysis Mode:

Click Full Analysis to run the entire agent pipeline automatically.

Click HTL Analysis to proceed step-by-step with review stages.

Click Manual Agents after selecting specific agent checkboxes to run a custom pipeline.

Monitor Progress: Watch as each agent card updates in real-time, showing its thought process and final output.

Download Artifacts: Once the "Artifacts Compiler" agent has finished, a download button will appear, allowing you to save the generated .zip file.
