const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Helper function to fetch and scrape Hacker News data
async function fetchHackerNews(hackerNewsUrl) {
    try {
        const response = await axios.get(hackerNewsUrl, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'axios/1.7.7',
                'Accept-Encoding': 'gzip, compress, deflate, br'
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const rows = document.querySelectorAll('tr');
        let newsItems = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (row.classList.contains('athing')) {
                const titleLink = row.querySelector('.titleline a');
                const title = titleLink.innerText;
                const newsUrl = titleLink.href;

                let itemNumber = " ";
                const itemNumberElement = row.querySelector('.rank');
                if (itemNumberElement) {
                    itemNumber = itemNumberElement.textContent.trim().replace('.', '');
                } else {
                    console.log("No item number found");
                }

                const discussionRow = rows[i + 1].querySelector('.subtext a:last-child');
                let discussionUrl = discussionRow ? discussionRow.getAttribute('href') : '';

                // Ensure that discussion URL is absolute
                if (discussionUrl.startsWith('item')) {
                    discussionUrl = `https://news.ycombinator.com/${discussionUrl}`;
                }

                newsItems.push({
                    itemNumber: itemNumber,
                    title: title,
                    copiableString: `Content: ${newsUrl}\nDiscussion: ${discussionUrl}`
                });
            }
        }

        return newsItems;
    } catch (error) {
        console.error('Error fetching Hacker News data:', error.message);
        throw error;
    }
}

function getNewsUrl(req) {
    const pageId = req.query.p || null;
    const hackerNewsUrl = pageId ? `https://news.ycombinator.com?p=${pageId}` : `https://news.ycombinator.com`;
    return hackerNewsUrl;
}

// REST API to return JSON with item number, title, and copiable string
app.get('/api/news', async (req, res) => {
    try {
        const hackerNewsUrl = getNewsUrl(req);
        const newsItems = await fetchHackerNews(hackerNewsUrl);
        res.json(newsItems);
    } catch (error) {
        console.error('Error fetching Hacker News data:', error.message);
        res.status(500).json({ message: 'Error fetching Hacker News data' });
    }
});

// Default route to handle HTML scraping
app.get('/news', async (req, res) => {
    try {
        const hackerNewsUrl = getNewsUrl(req);
        console.log(`Fetching page: ${hackerNewsUrl}`);
        const response = await axios.get(hackerNewsUrl);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching Hacker News');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

