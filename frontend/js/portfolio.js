// Dark mode synchronization on portfolio page
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;

if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlElement.classList.add('dark');
    darkModeToggle.textContent = '☀️';
}

darkModeToggle.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    if (htmlElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
        darkModeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        darkModeToggle.textContent = '🌙';
    }
});

// Extract query parameter ?user=channelname
const urlParams = new URLSearchParams(window.location.search);
const channelName = urlParams.get('user');

const loader = document.getElementById('loader');
const projectsGrid = document.getElementById('projectsGrid');
const errorContainer = document.getElementById('errorContainer');
const channelTitle = document.getElementById('channelTitle');
const channelHandle = document.getElementById('channelHandle');
const avatarLetter = document.getElementById('avatarLetter');
const postCountBadge = document.getElementById('postCountBadge');

if (!channelName) {
    loader.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    document.getElementById('errorDescription').textContent = 'No channel username was provided.';
} else {
    fetchPortfolioData(channelName);
}

async function fetchPortfolioData(username) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/portfolio/${username}`);
        
        if (!response.ok) {
            throw new Error('Channel not found or private');
        }

        const data = await response.json();
        renderPortfolio(data);
    } catch (err) {
        loader.classList.add('hidden');
        errorContainer.classList.remove('hidden');
        document.getElementById('errorDescription').textContent = err.message || 'Failed to connect to the backend server.';
    }
}

function renderPortfolio(data) {
    loader.classList.add('hidden');
    
    // Set Header Info
    channelTitle.textContent = data.channel;
    channelHandle.textContent = `@${data.channel}`;
    avatarLetter.textContent = data.channel.charAt(0).toUpperCase();
    postCountBadge.textContent = `Found ${data.total_posts} project milestones`;

    if (data.projects.length === 0) {
        projectsGrid.innerHTML = `<p class="col-span-2 text-center text-slate-500 py-10">No public project posts found in this channel.</p>`;
        projectsGrid.classList.remove('hidden');
        return;
    }

    // Render Cards
    projectsGrid.innerHTML = data.projects.map(project => {
        // Build tags markup
        const tagsHtml = project.tags.map(tag => 
            `<span class="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium px-2.5 py-1 rounded-lg">#${tag}</span>`
        ).join('');

        // Build links markup
        const linksHtml = project.links.map(link => {
            let label = 'Demo/Link';
            if (