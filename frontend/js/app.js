// Dark mode initialization
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

// Form submission handler
const form = document.getElementById('portfolioForm');
const channelInput = document.getElementById('channelInput');
const errorMsg = document.getElementById('errorMsg');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = channelInput.value.trim().replace('@', '');
    
    if (!username) {
        errorMsg.textContent = 'Please enter a valid channel username.';
        errorMsg.classList.remove('hidden');
        return;
    }

    // Redirect to portfolio view page with query parameter
    window.location.href = `portfolio.html?user=${encodeURIComponent(username)}`;
});
