// functions/articles/[id].js
// Cloudflare Pages Function for server-side rendering articles

const WORKER_URL = 'https://firebase.vm002248.workers.dev';

export async function onRequest(context) {
  const { params } = context;
  const articleId = params.id;

  try {
    // Fetch article data from worker
    const response = await fetch(`${WORKER_URL}/article/${articleId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return new Response(generateErrorHTML('Article not found', articleId), {
          status: 404,
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
      throw new Error(`Worker returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.article) {
      throw new Error('Invalid response from worker');
    }

    // Generate HTML with article content
    const html = generateArticleHTML(data.article, data.thumbnail, articleId);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error loading article:', error);
    
    return new Response(
      generateErrorHTML('Error loading article', articleId, error.message),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      }
    );
  }
}

function generateArticleHTML(article, thumbnail, articleId) {
  const { title, content, author, timestamp } = article;
  const thumbnailUrl = thumbnail?.fileUrl || '';
  
  // Format timestamp
  let formattedDate = 'Unknown date';
  if (timestamp) {
    try {
      const date = new Date(timestamp);
      formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
    }
  }

  return `<!DOCTYPE html>
<html lang="en" id="html-root">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Article by ${author || 'Unknown author'}">
    <meta property="og:title" content="${escapeHtml(title || 'Untitled Article')}">
    <meta property="og:description" content="Read this article on Havsite">
    ${thumbnailUrl ? `<meta property="og:image" content="${escapeHtml(thumbnailUrl)}">` : ''}
    <meta property="og:type" content="article">
    <title>${escapeHtml(title || 'Article')} - Havsite</title>
    <link rel="icon" type="image/x-icon" href="/images/logo_og.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap">
    <style>
        :root {
            --primary-gradient: linear-gradient(45deg, #6a11cb, #2575fc);
            --accent-color: #6a11cb;
            --bg-color: #f9f9f9;
            --text-color: #333;
            --card-bg: #ffffff;
            --card-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            --border-radius: 12px;
        }

        .dark-mode {
            --bg-color: #121212;
            --text-color: #f1f1f1;
            --card-bg: #1e1e1e;
            --card-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .header {
            background: var(--primary-gradient);
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-content {
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .back-link {
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            transition: background 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .back-link:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .container {
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .article-header {
            background: var(--card-bg);
            padding: 40px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            margin-bottom: 30px;
        }

    .article-title {
        font-size: 3em;
        margin: 20px 0;
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        position: relative;
        display: inline-block;
    }

    .article-title::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 4px;
        background: var(--primary-gradient);
        border-radius: 2px;
    }

        .article-meta {
            color: #666;
            font-size: 0.95rem;
            display: flex;
            gap: 25px;
            flex-wrap: wrap;
            padding-top: 15px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .dark-mode .article-meta {
            color: #aaa;
            border-top-color: rgba(255, 255, 255, 0.1);
        }

        .article-meta span {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .article-meta i {
            color: var(--accent-color);
        }

        .thumbnail {
            width: 100%;
            max-height: 500px;
            object-fit: cover;
            border-radius: var(--border-radius);
            margin-bottom: 30px;
            box-shadow: var(--card-shadow);
        }

        .article-content {
            background: var(--card-bg);
            padding: 50px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            font-size: 1.1rem;
            line-height: 1.8;
        }

        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
            margin-top: 1.5em;
            margin-bottom: 0.75em;
            color: var(--text-color);
            font-weight: 600;
        }

        .article-content h1 { font-size: 2rem; }
        .article-content h2 { font-size: 1.75rem; }
        .article-content h3 { font-size: 1.5rem; }

        .article-content p {
            margin-bottom: 1.2em;
        }

        .article-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 25px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .article-content ul,
        .article-content ol {
            margin-left: 2em;
            margin-bottom: 1.2em;
        }

        .article-content li {
            margin-bottom: 0.5em;
        }

        .article-content blockquote {
            border-left: 4px solid var(--accent-color);
            padding-left: 20px;
            margin: 25px 0;
            font-style: italic;
            color: #666;
            background: rgba(106, 17, 203, 0.05);
            padding: 15px 20px;
            border-radius: 4px;
        }

        .dark-mode .article-content blockquote {
            color: #aaa;
        }

        .article-content code {
            background: rgba(106, 17, 203, 0.1);
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        .article-content pre {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 25px 0;
        }

        .dark-mode .article-content pre {
            background: #2d2d2d;
        }

        .article-content a {
            color: var(--accent-color);
            text-decoration: none;
            border-bottom: 1px solid var(--accent-color);
            transition: opacity 0.3s ease;
        }

        .article-content a:hover {
            opacity: 0.7;
        }

        footer {
            background: var(--primary-gradient);
            color: white;
            text-align: center;
            padding: 30px 20px;
            margin-top: 60px;
        }

        footer a {
            color: white;
            text-decoration: underline;
        }

        .theme-toggle {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--accent-color);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            z-index: 1000;
        }

        .theme-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
            .article-title {
                font-size: 2rem;
            }

            .article-header,
            .article-content {
                padding: 25px;
            }

            .container {
                margin: 20px auto;
            }

            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }

            .article-meta {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <h1>📄 Havsite Articles</h1>
            <a href="#" class="back-link" id="summarize">
                summarize
            </a>
            <a href="/arcticles.html" class="back-link">
                <i class="fas fa-arrow-left"></i> Back to Articles
            </a>
        </div>
    </div>

    <div class="container">
        <div class="article-header">
            <h1 class="article-title">${escapeHtml(title || 'Untitled Article')}</h1>
            <div class="article-meta">
                <span>
                    <i class="fas fa-user"></i>
                    <strong>By:</strong> ${escapeHtml(author || 'Unknown')}
                </span>
                <span>
                    <i class="fas fa-calendar"></i>
                    <strong>Published:</strong> ${formattedDate}
                </span>
            </div>
        </div>

        ${thumbnailUrl ? `<img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(title || 'Article')}" class="thumbnail">` : ''}

        <div class="article-content" id="content">
            ${content || '<p>No content available.</p>'}
        </div>
    </div>

    <footer>
        <p>© 2024 Havsite | <a href="/arcticles.html">Browse More Articles</a></p>
        <div id="id" style="height: 0px; width: 0px;">${escapeHtml(author || 'Unknown')}${escapeHtml(title || 'Untitled Article')}</div>
    </footer>

    <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()">
        <i class="fas fa-moon"></i>
    </button>

    <script>
        function toggleTheme() {
            document.getElementById('html-root').classList.toggle('dark-mode');
            const icon = document.querySelector('#themeToggle i');
            if (document.getElementById('html-root').classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }

        // Check for saved theme preference
        if (localStorage.getItem('theme') === 'dark') {
            document.getElementById('html-root').classList.add('dark-mode');
            document.querySelector('#themeToggle i').className = 'fas fa-sun';
        }

        // Save theme preference
        document.getElementById('themeToggle').addEventListener('click', () => {
            const isDark = document.getElementById('html-root').classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    </script>
    <script type="module">
	import {  doc, getDoc, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
	import { db } from '/firebase_auth.js';
	import { getpoints, addpoints, subpoints } from '/points.js';
	let summary;
	let articleId = document.getElementById('id').value;
	console.log("DEBUG: articleId is", articleId);

	async function fetchsummarizedArticles() {
	  try {
	    const articleId = document.getElementById('id').value;
	    
	    // Use doc() to point to the specific document
	    const docRef = doc(db, 'summaries', articleId);
	    const docSnap = await getDoc(docRef);
	
	    if (docSnap.exists()) {
	      const data = docSnap.data();
	      
	      // Update the UI with the content
	      document.getElementById('content').innerHTML = data.content;
	
	      // CRITICAL: Call subpoints BEFORE returning
	      let subval = 3;
	      subpoints(subval);      
	      return data.content;
	    } else {
	      console.warn("No summary found with ID:", articleId);
              document.getElementById('content').innerHTML = "Summary not found.";
	    }
	  } catch (error) {
	    console.error('Error fetching summary:', error);
    	    throw error;
	  }
	}
	document.getElementById("summarize").addEventListener("click", fetchsummarizedArticles);	
    </script>
</body>
</html>`;
}

function generateErrorHTML(message, articleId, details = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Havsite</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap">
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            background: linear-gradient(45deg, #6a11cb, #2575fc);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
            padding: 20px;
        }
        .error-container {
            max-width: 600px;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 15px;
            line-height: 1.6;
        }
        .article-id {
            background: rgba(0, 0, 0, 0.2);
            padding: 10px 15px;
            border-radius: 6px;
            display: inline-block;
            margin: 15px 0;
            font-family: monospace;
        }
        .details {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 20px;
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 6px;
        }
        a {
            display: inline-block;
            margin-top: 30px;
            padding: 15px 35px;
            background: white;
            color: #6a11cb;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        a:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px;"></i>
        <h1>${escapeHtml(message)}</h1>
        <p>Article ID:</p>
        <div class="article-id">${escapeHtml(articleId)}</div>
        ${details ? `<div class="details"><strong>Details:</strong><br>${escapeHtml(details)}</div>` : ''}
        <a href="/arcticles.html">
            <i class="fas fa-arrow-left"></i> Back to Articles
        </a>
    </div>
</body>
</html>`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}