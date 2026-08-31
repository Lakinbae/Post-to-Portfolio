document.getElementById('portfolioForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let username = document.getElementById('channelInput').value.trim();
    
    // Clean up input if the user accidentally typed '@' or the full URL
    username = username.replace('@', '');
    if (username.includes('t.me/')) {
        username = username.split('t.me/')[1].split('/')[0];
    }
    
    if (!username) {
        showError("Please enter a valid channel username.");
        return;
    }
    
    // Redirect to portfolio view page with query parameter
    window.location.href = `portfolio.html?user=${encodeURIComponent(username)}`;
});

function showError(message) {
    const errorEl = document.getElementById('errorMsg');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}