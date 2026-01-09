// functions/articles.js
export async function onRequest(context) {
  const { env } = context;

  try {
    // Fetch articles from Firebase
    const articles = await fetchArticlesFromFirebase(env);
    
    // Generate the HTML with server-side rendered articles
    const html = generateArticlesHTML(articles);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600', // Cache for 5-10 minutes 
      },
    });
  } catch (error) {
    console.error('Error loading articles:', error);
    
    // Return a fallback HTML with error message
    const html = generateArticlesHTML([], error.message);
    
    return new Response(html, {
      status: 500,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  }
}

async function fetchArticlesFromFirebase(env) {
  const projectId = env.FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable missing');
  }

  // Fetch from Firestore REST API (no auth needed for public reads)
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/thumbnails`;
  
  const response = await fetch(firestoreUrl);

  if (!response.ok) {
    throw new Error(`Firebase API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  
  // Parse Firestore document format
  const articles = [];
  if (data.documents) {
    for (const doc of data.documents) {
      const fields = doc.fields || {};
      articles.push({
        articleid: fields.articleid?.stringValue || '',
        title: fields.title?.stringValue || 'Untitled',
        fileUrl: fields.fileUrl?.stringValue || '',
      });
    }
  }

  return articles;
}

function generateArticlesHTML(articles, errorMessage = null) {
  // Generate article cards HTML
  const hardcodedArticles = `
    <article class="article-card">
        <a href="https://havsite2.pages.dev/why-are-teenagers-depressed.html" style="color:var(--text-color);">
            <img src="https://havsite2.pages.dev/images/wrtd.jpg" alt="Why are teenagers depressed?">
            <p>why are teenagers<br> depressed?</p>
        </a>
    </article>

    <article class="article-card">
        <a href="https://havsite2.pages.dev/rt.html" style="color:var(--text-color);">
            <img src="https://havsite2.pages.dev/images/rtf-t.jfif" alt="Ratanji Tata">
            <p>Ratanji Tata<br>(1937-2024)</p>
        </a>
    </article>

    <article class="article-card">
        <a href="https://havsite2.pages.dev/burnoutreal.html" style="color:var(--text-color);">
            <img src="https://havsite2.pages.dev/images/The-Burnout-Generation-Why-Millennials-and-Gen-Z-Are-Getting-Tired-of-Work_Blog-Banner.png" alt="Burnout Generation">
            <p>Why are Mellinials and Gen-Z so tired?</p>
        </a>
    </article>

    <article class="article-card">
        <a href="https://havsite2.pages.dev/windows-10.html" style="color:var(--text-color);">
            <img src="https://havsite2.pages.dev/images/windows 10.jpg" alt="Windows 10">
            <p>windows 10 the best os ever?</p>
        </a>
    </article>
  `;

  const dynamicArticles = articles.map(article => {
    const thumbnailHTML = article.fileUrl 
      ? `<img src="/articles/${escapeHtml(article.fileUrl)}" alt="${escapeHtml(article.title)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22140%22 height=%22150%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">`
      : `<img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22140%22 height=%22150%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E" alt="${escapeHtml(article.title)}">`;

    return `
    <article class="article-card">
        <a href="${escapeHtml(article.articleid)}" style="color:var(--text-color);">
            ${thumbnailHTML}
            <p>${escapeHtml(article.title)}</p>
        </a>
    </article>
    `;
  }).join('');

  const newArticleCard = `
    <article class="article-card">
        <a href="https://havsite2.pages.dev/word_processor2.html" style="color:var(--text-color);">
            <div class="new">
                <div class="plus1"></div>
                <div class="plus2"></div>
            </div>
            <p>Create an article</p>
        </a>
    </article>
  `;

  const errorHTML = errorMessage ? `
    <div class="loading">
        <p style="color: #d32f2f;">⚠️ Failed to load some articles: ${escapeHtml(errorMessage)}</p>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="english" id="html-root">
<head>
    <title>Havsite - Articles</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Havsite - Articles and reading materials">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="icon" type="image/x-icon" href="https://havsite2.pages.dev/images/logo_og.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://havsite2.pages.dev/ai-assistant.css">
    <script src="https://havsite2.pages.dev/chatbot-js.js" defer></script>
    <link rel="stylesheet" href="https://havsite2.pages.dev/autohidenav.css">
    <script src="https://havsite2.pages.dev/autohidenav.js" defer></script>
    <link rel="stylesheet" href="https://havsite2.pages.dev/search-css.css">
    <script src="https://havsite2.pages.dev/search-js.js" defer></script>
<style>
    /* Theme Variables */
    :root {
        --primary-gradient: linear-gradient(45deg, #6a11cb, #2575fc);
        --secondary-gradient: linear-gradient(to right, #3494e6, #ec6ead);
        --accent-color: #6a11cb;
        --bg-color: #f9f9f9;
        --text-color: #333;
        --card-bg: #ffffff;
        --card-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        --img-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        --border-radius: 12px;
        --transition-speed: 0.3s;
        --arcticle-bg-color: #848482;
        --arcticle-box-shadow: #545454;
    }

    .dark-mode {
        --bg-color: #121212;
        --text-color: #f1f1f1;
        --card-bg: #1e1e1e;
        --card-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        --img-box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
        --arcticle-bg-color: #333;
        --arcticle-box-shadow: #e4e4e4;
    }

    h1::selection {
        background: var(--accent-color);
        color: white;
    }
    
    ::selection {
        background: rgba(106, 17, 203, 0.3);
        color: var(--text-color);
    }

    body {
        margin: 0;
        font-family: 'Poppins', Arial, sans-serif;
        background-color: var(--bg-color);
        color: var(--text-color);
        transition: background-color 0.3s ease, color 0.3s ease;
        line-height: 1.6;
    }

    .topnav a {
        float: left;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
        font-size: 16px;
        transition: all var(--transition-speed) ease;
        border-radius: 6px;
        margin: 8px 4px;
    }

    .topnav a:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    .topnav a.active {
        font-weight: 600;
        background-color: rgba(255, 255, 255, 0.15);
    }

    .topnav .logo {
        padding: 6px 16px;
    }

    .topnav .logo img {
        transition: transform 0.3s ease;
    }

    .topnav .logo:hover img {
        transform: scale(1.1);
    }

    .topnav .icon {
        display: none;
    }

    .topnav .search-bar {
        float: right;
        display: flex;
        align-items: center;
        margin: 8px 0;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 30px;
        padding: 4px 10px;
        transition: all 0.3s ease;
    }

    .topnav .search-bar:focus-within {
        background: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .topnav input[type="text"] {
        padding: 8px 12px;
        border: none;
        background: transparent;
        color: white;
        width: 200px;
        outline: none;
    }

    .topnav input[type="text"]::placeholder {
        color: rgba(255, 255, 255, 0.8);
    }

    .topnav button {
        padding: 8px;
        border: none;
        border-radius: 50%;
        background-color: transparent;
        color: white;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .topnav button:hover {
        transform: scale(1.1);
    }

    .theme-toggle {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 10px;
        margin-right: 10px;
        border-radius: 50%;
        transition: background-color 0.3s;
    }

    .theme-toggle:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    footer {
        background: var(--primary-gradient);
        color: white;
        text-align: center;
        padding: 30px 20px;
        margin-top: 1080px;
    }

    .footer-content {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        max-width: 1200px;
        margin: 0 auto 20px;
    }

    .footer-section {
        flex: 1;
        min-width: 250px;
        padding: 0 20px;
        margin-bottom: 20px;
        text-align: left;
    }

    .footer-section h3 {
        margin-top: 0;
        position: relative;
        padding-bottom: 10px;
    }

    .footer-section h3::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 3px;
        background: rgba(255, 255, 255, 0.5);
    }

    .footer-links {
        list-style: none;
        padding: 0;
    }

    .footer-links li {
        margin-bottom: 10px;
    }

    .footer-links a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: color 0.3s ease;
    }

    .footer-links a:hover {
        color: white;
        text-decoration: underline;
    }

    .social-icons {
        display: flex;
        gap: 15px;
        margin-top: 15px;
    }

    .social-icons a {
        color: white;
        font-size: 20px;
        transition: transform 0.3s ease;
        display: inline-block;
    }

    .social-icons a:hover {
        transform: translateY(-5px);
    }

    .copyright {
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
    }

    @media screen and (max-width: 800px) {
        h1 {
            font-size: 2.5em;
        }
    }

    @media screen and (max-width: 600px) {
        .topnav a:not(:first-child), .topnav .search-bar { display: none; }
        .topnav a.icon { 
            float: right; 
            display: block; 
        }
        
        h1 {
            font-size: 2em;
        }
        
        .footer-content {
            flex-direction: column;
            text-align: center;
        }
        
        .footer-section h3::after {
            left: 50%;
            transform: translateX(-50%);
        }
    }

    @media screen and (max-width: 600px) {
        .topnav.responsive {
            position: relative;
            flex-direction: column;
        }
        
        .topnav.responsive .icon {
            position: absolute;
            right: 0px;
            top: 0px;
        }
        
        .topnav.responsive a {
            float: none;
            display: block;
            text-align: left;
            width: 100%;
            box-sizing: border-box;
        }
        
        .topnav.responsive .search-bar {
            display: flex;
            width: 100%;
            margin: 10px 0;
            box-sizing: border-box;
        }
    }

    .back-to-top {
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: var(--primary-gradient);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
        z-index: 1000;
    }

    .back-to-top.visible {
        opacity: 1;
        visibility: visible;
    }

    .back-to-top:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .articles {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
        justify-content: flex-start;
    }

    .article-card {
        width: 160px;
        height: 260px;
        background: var(--arcticle-bg-color);
        border-radius: 12px;
        box-shadow: var(--arcticle-box-shadow);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1rem;
        flex-shrink: 0;
    }

    .article-card img {
        width: 140px;
        height: 150px;
        border-radius: 14%;
        object-fit: cover;
        margin-bottom: 0.8rem;
    }

    .article-card a {
        text-decoration: none;
        color: var(--text-color);
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    @media screen and (max-width: 600px) {
        .article-card {
            max-width: 130px;
            width: 100%;
            height: 260px;
        }
    }

    #new {
        width: 140px;
        height: 140px;
        object-fit: cover;
    }

    .new {
        display: block;
        width: 140px;
        height: 140px;
        border-radius: 80%;
        object-fit: cover;
        transition: transform 0.2s ease-out 0.1s;
        background: #191919;
    }

    .new:hover {
        transform-origin: center;
        transform: rotate(90deg);
    }

    .plus1 {
        position: relative;
        left: 60px;
        top: 10px;
        width: 20px;
        height: 120px;
        content: "";
        background: white;
        border-radius: 10px;
    }

    .plus2 {
        position: relative;
        left: 10px;
        top: -60px;
        width: 120px;
        height: 20px;
        content: "";
        background: white;
        border-radius: 10px;
    }

    .loading {
        grid-column: 1 / -1;
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: var(--text-color);
    }
</style>
</head>
<body>
    <div class="topnav" id="myTopnav">
        <a href="https://havsite2.pages.dev/about-tech-bro.html" class="logo">
            <img src="https://havsite2.pages.dev/images/logo_og.png" alt="Havsite Logo" height="40" width="40" style="border-radius: 8px;">
        </a>
        <a href="https://havsite2.pages.dev/help.html">Help</a>
        <a href="https://havsite2.pages.dev/tep.html">Contact</a>
        <a href="https://havsite2.pages.dev/tep.html">FAQ</a>
        <a href="https://havsite2.pages.dev/#">Articles</a>
        <a href="https://havsite2.pages.dev/Saas.html">Tools</a>
        <a href="https://havsite2.pages.dev/our team.html">Team</a>
        <a href="https://havsite2.pages.dev/download.html">Download</a>
        <a href="https://havsite2.pages.dev/index.html">
            <span class="material-symbols-outlined">home</span>
        </a>
        <a href="https://havsite2.pages.dev/cst.html" title="Profile">
            <img src="https://havsite2.pages.dev/images/user.png" style="height:24px; width:24px; border-radius:50%;">
        </a>
        <button class="theme-toggle" id="themeToggle" title="Toggle theme" onclick="toggleTheme()">
            <i class="fas fa-moon"></i>
        </button>
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Search...">
            <button onclick="searchFunction()"><i class="fas fa-search"></i></button>
        </div>
        <a href="javascript:void(0);" class="icon" onclick="myFunction()">
            <i class="fas fa-bars"></i>
        </a>
    </div>

    <div class="articles" id="articlesContainer">
        ${hardcodedArticles}
        ${dynamicArticles}
        ${newArticleCard}
        ${errorHTML}
    </div>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3>Quick Links</h3>
                <ul class="footer-links">
                    <li><a href="https://havsite2.pages.dev/help.html">Help Center</a></li>
                    <li><a href="https://havsite2.pages.dev/tep.html">Contact Us</a></li>
                    <li><a href="https://havsite2.pages.dev/tep.html">FAQ</a></li>
                    <li><a href="https://havsite2.pages.dev/#">Articles</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Features</h3>
                <ul class="footer-links">
                    <li><a href="https://havsite2.pages.dev/ca-u2.html">Chat</a></li>
                    <li><a href="https://havsite2.pages.dev/development_error_page2.html">Updates</a></li>
                    <li><a href="https://havsite2.pages.dev/tep.html">Stories</a></li>
                    <li><a href="https://havsite2.pages.dev/cst.html">Profile</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Connect With Us</h3>
                <p>Follow us on social media for updates and news</p>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-discord"></i></a>
                </div>
            </div>
        </div>
        <div class="copyright">
            <p>© 2024 by Vivaan | <a href="https://havsite2.pages.dev/privacy-policy.html">Privacy Policy</a> | <a href="https://havsite2.pages.dev/terms-of-service.html">Terms of Service</a></p>
        </div>
    </footer>

    <a href="#" class="back-to-top" id="backToTop">
        <i class="fas fa-arrow-up"></i>
    </a>

    <script src="https://havsite2.pages.dev/myscript.js"></script>
    
    <script>
        function myFunction() {
            var x = document.getElementById("myTopnav");
            if (x.className === "topnav") {
                x.className += " responsive";
                window.scrollTo(0, 0);
            } else {
                x.className = "topnav";
            }
        }

        window.addEventListener('scroll', function() {
            var backToTopButton = document.getElementById('backToTop');
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        document.getElementById("searchInput").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                searchFunction();
            }
        });
        
        function toggleTheme() {
            document.getElementById('html-root').classList.toggle('dark-mode');
            if (document.getElementById('html-root').classList.contains('dark-mode')) {
                document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('html-root').classList.contains('dark-mode')) {
                document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
            }
        });

        document.getElementById('backToTop').addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    </script>
</body>
</html>`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}