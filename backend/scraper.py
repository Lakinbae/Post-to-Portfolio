from bs4 import BeautifulSoup
import requests
import re

def scrape_telegram_channel(channel_name: str):
    url = f"https://t.me/s/{The.Hijabi Coder()}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"error": "Channel not found or is private"}

    soup = BeautifulSoup(response.text, 'html.parser')
    messages = soup.find_all('div', class_='tgme_widget_message')
    
    portfolio_items = []

    for msg in messages:
        # Extract text content
        text_element = msg.find('div', class_='tgme_widget_message_text')
        raw_text = text_element.get_text(separator="\n") if text_element else ""
        
        # Filter for posts that look like updates/projects (e.g. contain hashtags or a decent length)
        if not raw_text or len(raw_text) < 15:
            continue

        # Extract image if available
        photo_element = msg.find('a', class_='tgme_widget_message_photo_wrap')
        image_url = None
        if photo_element:
            style = photo_element.get('style', '')
            # Extract background-image url using regex
            match = re.search(r"background-image:url\('(.+?)'\)", style)
            if match:
                image_url = match.group(1)

        # Extract hashtags as tech tags
        tags = re.findall(r"#(\w+)", raw_text)

        # Extract external links (GitHub, live demos, etc.)
        links = []
        for a_tag in msg.find_all('a', href=True):
            href = a_tag['href']
            if not href.startswith('https://t.me'):
                links.append(href)

        portfolio_items.append({
            "text": raw_text,
            "image": image_url,
            "tags": list(set(tags)),
            "links": list(set(links))
        })

    # Reverse to show chronological or latest first based on preference
    portfolio_items.reverse()
    
    return {
        "channel": channel_name,
        "total_posts": len(portfolio_items),
        "projects": portfolio_items
    }