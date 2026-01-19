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
            --accent-secondary: #2575fc;
            --bg-color: #f5f7fa;
            --text-color: #2c3e50;
            --text-secondary: #64748b;
            --card-bg: #ffffff;
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            --card-shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.12);
            --border-radius: 16px;
            --border-color: #e2e8f0;
        }

        .dark-mode {
            --bg-color: #121212;
            --text-color: #f1f1f1;
            --text-secondary: #94a3b8;
            --card-bg: #1e1e1e;
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            --card-shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.7);
            --border-color: #334155;
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
            line-height: 1.7;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .header {
            background: var(--primary-gradient);
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-content {
            max-width: 1000px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 1.6rem;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
        }

        .back-link {
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .back-link:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 60px 24px;
        }

        .article-header {
            background: var(--card-bg);
            padding: 50px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            margin-bottom: 40px;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }

        .article-header:hover {
            box-shadow: var(--card-shadow-hover);
        }

        .article-title {
            font-size: 3.2em;
            font-weight: 700;
            margin: 0 0 30px 0;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            line-height: 1.2;
            letter-spacing: -0.02em;
        }

        .article-meta {
            display: flex;
            gap: 32px;
            flex-wrap: wrap;
            padding-top: 24px;
            margin-top: 24px;
            border-top: 2px solid var(--border-color);
        }

        .article-meta span {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
        }

        .article-meta i {
            color: var(--accent-color);
            font-size: 1.1rem;
        }

        .article-meta strong {
            color: var(--text-color);
        }

        .thumbnail-wrapper {
            position: relative;
            margin-bottom: 40px;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--card-shadow);
        }

        .thumbnail {
            width: 100%;
            max-height: 550px;
            object-fit: cover;
            display: block;
            transition: transform 0.5s ease;
        }

        .thumbnail-wrapper:hover .thumbnail {
            transform: scale(1.03);
        }

        .article-content {
            background: var(--card-bg);
            padding: 60px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            font-size: 1.125rem;
            line-height: 1.9;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }

        .article-content:hover {
            box-shadow: var(--card-shadow-hover);
        }

        .summarize-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: white;
            background: var(--primary-gradient);
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 500;
            font-size: 0.95rem;
            margin-bottom: 40px;
        }

        .summarize-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4);
        }

        .summarize-btn i {
            font-size: 1.1rem;
        }

        .content-wrapper {
            margin-top: 30px;
        }

        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
            margin-top: 2em;
            margin-bottom: 1em;
            color: var(--text-color);
            font-weight: 700;
            line-height: 1.3;
            letter-spacing: -0.01em;
        }

        .article-content h1 { font-size: 2.2rem; }
        .article-content h2 { font-size: 1.9rem; }
        .article-content h3 { font-size: 1.6rem; }

        .article-content p {
            margin-bottom: 1.5em;
            color: var(--text-color);
        }

        .article-content img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 35px 0;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .article-content img:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
        }

        .article-content ul,
        .article-content ol {
            margin-left: 2.5em;
            margin-bottom: 1.5em;
        }

        .article-content li {
            margin-bottom: 0.7em;
            padding-left: 0.5em;
        }

        .article-content blockquote {
            border-left: 5px solid var(--accent-color);
            padding: 20px 25px;
            margin: 35px 0;
            font-style: italic;
            color: var(--text-secondary);
            background: linear-gradient(135deg, rgba(106, 17, 203, 0.05), rgba(37, 117, 252, 0.05));
            border-radius: 8px;
            font-size: 1.05em;
            position: relative;
        }

        .article-content blockquote::before {
            content: '"';
            font-size: 4rem;
            color: var(--accent-color);
            opacity: 0.2;
            position: absolute;
            top: -10px;
            left: 15px;
            font-family: Georgia, serif;
        }

        .article-content code {
            background: rgba(106, 17, 203, 0.12);
            padding: 4px 10px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: var(--accent-color);
            border: 1px solid rgba(106, 17, 203, 0.2);
        }

        .article-content pre {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            overflow-x: auto;
            margin: 35px 0;
            border: 1px solid var(--border-color);
            box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .dark-mode .article-content pre {
            background: #1a202c;
        }

        .article-content a {
            color: var(--accent-color);
            text-decoration: none;
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .article-content a:hover {
            border-bottom-color: var(--accent-color);
            opacity: 0.8;
        }

        footer {
            background: var(--primary-gradient);
            color: white;
            text-align: center;
            padding: 40px 20px;
            margin-top: 80px;
            box-shadow: 0 -4px 20px rgba(106, 17, 203, 0.2);
        }

        footer p {
            font-size: 1rem;
            font-weight: 500;
        }

        footer a {
            color: white;
            text-decoration: underline;
            transition: opacity 0.3s ease;
        }

        footer a:hover {
            opacity: 0.8;
        }

        .theme-toggle {
            position: fixed;
            bottom: 35px;
            right: 35px;
            background: var(--accent-color);
            color: white;
            border: none;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.3rem;
            box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4);
            transition: all 0.3s ease;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .theme-toggle:hover {
            transform: scale(1.1) rotate(15deg);
            box-shadow: 0 8px 25px rgba(106, 17, 203, 0.5);
        }

        .theme-toggle:active {
            transform: scale(0.95);
        }

        @media (max-width: 768px) {
            .container {
                padding: 30px 16px;
            }

            .article-title {
                font-size: 2.2rem;
            }

            .article-header {
                padding: 30px 24px;
            }

            .article-content {
                padding: 30px 24px;
                font-size: 1.05rem;
            }

            .header-content {
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }

            .header h1 {
                font-size: 1.3rem;
            }

            .article-meta {
                flex-direction: column;
                gap: 12px;
            }

            .thumbnail {
                max-height: 350px;
            }

            .theme-toggle {
                bottom: 25px;
                right: 25px;
                width: 55px;
                height: 55px;
            }

            .article-content h1 { font-size: 1.8rem; }
            .article-content h2 { font-size: 1.6rem; }
            .article-content h3 { font-size: 1.4rem; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <h1>📄 Havsite Articles</h1>
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
                    <strong>Author:</strong> ${escapeHtml(author || 'Unknown')}
                </span>
                <span>
                    <i class="fas fa-calendar"></i>
                    <strong>Published:</strong> ${formattedDate}
                </span>
            </div>
        </div>

        ${thumbnailUrl ? `
        <div class="thumbnail-wrapper">
            <img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(title || 'Article')}" class="thumbnail">
        </div>
        ` : ''}

        <div class="article-content">
            <a href="#" class="summarize-btn" id="summarize">
                <i class="fas fa-magic"></i>
                Generate Summary
            </a>
            <div class="content-wrapper" id="content">
                ${content || '<p>No content available.</p>'}
            </div>
        </div>
    </div>

    <footer>
        <p>© 2024 Havsite | <a href="/arcticles.html">Browse More Articles</a></p>
        <div id="id" style="height: 0px; width: 0px; font-size: 0px;">${escapeHtml(author || 'Unknown')}${escapeHtml(title || 'Untitled Article')}</div>
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
	let articleId = document.getElementById('id').innerText;
	console.log("DEBUG: articleId is", articleId);
	console.log("DEBUG: db is", db);

	async function fetchsummarizedArticles() {
	  try {
	    
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