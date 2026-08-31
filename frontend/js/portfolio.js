const API_BASE_URL = "http://127.0.0.1:8000/api/portfolio";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const channelName = urlParams.get("user");

    if (!channelName) {
        displayError("No channel specified. Please go back and enter a username.");
        return;
    }

    document.getElementById("channelTitle").textContent = `@${channelName}'s Portfolio`;
    fetchPortfolioData(channelName);
});

async function fetchPortfolioData(channelName) {
    try {
        const response = await `${API_BASE_URL}/${channelName}`;
        const res = await fetch(response);
        
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Failed to fetch channel data.");
        }

        const data = await res.json();
        renderPortfolio(data);
    } catch (err) {
        displayError(err.message);
    }
}

function renderPortfolio(data) {
    document.getElementById("loadingState").classList.add("hidden");
    
    if (data.projects.length === 0) {
        displayError("No matching project updates found in this channel's public feed.");
        return;
    }

    document.getElementById("postCount").textContent = `${data.total_posts} milestones found`;
    
    const gridContainer = document.getElementById("projectsGrid");
    gridContainer.classList.remove("hidden");

    data.projects.forEach(project => {
        const card = document.createElement("article");
        card.className = "bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-all space-y-4";

        // Image attachment (if any)
        let imageHtml = "";
        if (project.image) {
            imageHtml = `
                <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 max-h-72">
                    <img src="${project.image}" alt="Project preview" class="w-full h-full object-cover">
                </div>
            `;
        }

        // Tags formatting
        let tagsHtml = "";
        if (project.tags && project.tags.length > 0) {
            tagsHtml = `<div class="flex flex-wrap gap-2 pt-2">`;
            project.tags.forEach(tag => {
                tagsHtml += `<span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-full font-medium">#${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        // Action links (GitHub, live demos extracted from text)
        let linksHtml = "";
        if (project.links && project.links.length > 0) {
            linksHtml = `<div class="flex flex-wrap gap-3 pt-2 border-t border-slate-800/60 mt-4">`;
            project.links.forEach(link => {
                // Shorten link label for neatness
                let domain = new URL(link).hostname.replace('www.', '');
                linksHtml += `
                    <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 transition-all">
                        ↗ ${domain}
                    </a>
                `;
            });
            linksHtml += `</div>`;
        }

        // Format raw text (preserve line breaks)
        let formattedText = project.text.replace(/\n/g, '<br>');

        card.innerHTML = `
            ${imageHtml}
            <div class="text-slate-300 text-sm leading-relaxed space-y-2">
                <p>${formattedText}</p>
            </div>
            ${tagsHtml}
            ${linksHtml}
        `;

        gridContainer.appendChild(card);
    });
}

function displayError(message) {
    document.getElementById("loadingState").classList.add("hidden");
    const errorState = document.getElementById("errorState");
    const errorText = document.getElementById("errorText");
    
    errorText.textContent = message;
    errorState.classList.remove("hidden");
}
// Inside your renderPortfolio function loop, add this to each card's innerHTML:

let boostHtml = `
    <div class="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-4">
        <button onclick="boostProject('${data.channel}', '${project.project_id}', this)" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 transition-all cursor-pointer">
            🚀 Boost <span class="bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold">${project.boosts}</span>
        </button>
        <span class="text-xs text-slate-600">ID: ${project.project_id}</span>
    </div>
`;
async function boostProject(channelName, projectId, btnElement) {
    try {
        const response = `http://127.0.0.1:8000/api/boost/${channelName}/${projectId}`;
        const res = await fetch(response, { method: "POST" });
        const result = await res.json();
        
        if (result.success) {
            const countSpan = btnElement.querySelector("span");
            countSpan.textContent = result.new_count;
            
            // Brief pop animation effect
            btnElement.classList.add("scale-105", "border-indigo-500");
            setTimeout(() => btnElement.classList.remove("scale-105", "border-indigo-500"), 200);
        }
    } catch (err) {
        console.error("Failed to boost project:", err);
    }
}

function toggleAIChat() {
    const modal = document.getElementById("aiChatModal");
    modal.classList.toggle("hidden");
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById("chatChannelName").textContent = urlParams.get("user");
}

async function sendAIQuery() {
    const input = document.getElementById("chatInput");
    const history = document.getElementById("chatHistory");
    const question = input.value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const channelName = urlParams.get("user");

    if (!question) return;

    // Append user question
    history.innerHTML += `<div class="text-right"><span class="inline-block bg-indigo-600/20 text-indigo-300 px-3 py-1.5 rounded-xl">${question}</span></div>`;
    input.value = "";

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/chat/${channelName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });
        const data = await res.json();

        // Append AI response
        history.innerHTML += `<div><span class="inline-block bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700/60">${data.answer}</span></div>`;
        history.scrollTop = history.scrollHeight;
    } catch (err) {
        history.innerHTML += `<div class="text-red-400">Failed to fetch AI response.</div>`;
    }
}