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
        'Cache-Control': 'public, max-age=120', // Cache for 2 minutes
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
    <title>${escapeHtml(title || 'Article')} - Havsite</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --accent-color: #6a11cb;
            --bg-color: #ffffff;
            --text-color: #1a1a1a;
            --secondary-text: #666;
            --card-bg: #fdfdfd;
            --border-color: rgba(0,0,0,0.08);
        }

        .dark-mode {
            --bg-color: #0f0f0f;
            --text-color: #e0e0e0;
            --secondary-text: #a0a0a0;
            --card-bg: #1a1a1a;
            --border-color: rgba(255,255,255,0.1);
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.8;
            margin: 0;
            transition: background 0.3s ease;
        }

        /* Hero Section */
        .article-hero {
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 40px 40px;
            text-align: center;
        }

        .article-category {
            text-transform: uppercase;
            letter-spacing: 3px;
            font-size: 0.75rem;
            color: var(--accent-color);
            font-weight: 700;
            margin-bottom: 20px;
            display: block;
        }

        .article-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2.5rem, 7vw, 4.5rem);
            line-height: 1.1;
            margin: 0 auto 30px;
            font-weight: 900;
            max-width: 900px;
        }

        .article-meta-top {
            font-size: 0.9rem;
            color: var(--secondary-text);
            display: flex;
            justify-content: center;
            gap: 20px;
            font-style: italic;
            margin-bottom: 40px;
        }

        /* Content Grid */
        .magazine-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 50px;
            padding: 0 40px;
        }

        .featured-image-container {
            grid-column: 1 / -1;
            margin-bottom: 50px;
        }

        .featured-image {
            width: 100%;
            height: 70vh;
            object-fit: cover;
            border-radius: 2px;
        }

        .article-body {
            font-size: 1.25rem;
            color: var(--text-color);
        }

        /* Sidebar & Buttons */
        .sidebar {
            position: sticky;
            top: 40px;
            height: fit-content;
        }

        .action-box {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            padding: 25px;
            border-radius: 8px;
            text-align: center;
        }

        .action-box h4 {
            font-family: 'Playfair Display', serif;
            margin-top: 0;
            font-size: 1.2rem;
        }

        /* THE SUMMARIZE BUTTON */
        #summarize {
            width: 100%;
            background: var(--text-color);
            color: var(--bg-color);
            border: none;
            padding: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 4px;
        }

        #summarize:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }

        #summarize:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* Typography Polish */
        .article-body p:first-of-type::first-letter {
            float: left;
            font-family: 'Playfair Display', serif;
            font-size: 4rem;
            line-height: 0.8;
            padding: 10px 10px 0 0;
            color: var(--accent-color);
        }

        /* Responsive */
        @media (max-width: 950px) {
            .magazine-grid { grid-template-columns: 1fr; }
            .sidebar { position: static; margin-bottom: 40px; }
            .article-hero { padding: 40px 20px; }
        }

        /* Keeping your existing Delete Popup CSS */
        .delete-popup {
            height: 40vh; width: 60vw; position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%); background: var(--bg-color-popup, #ffffff);
            color: var(--text-color); border-radius: 12px; padding: 20px;
            z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px); display: flex; flex-direction: column;
            justify-content: space-between; border: 1px solid rgba(255, 255, 255, 0.1);
        }
        body.modal-open > *:not(.delete-popup) { filter: blur(6px); }
    </style>
</head>
<body id="body">
    <header style="padding: 20px 40px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
        <div style="font-family: 'Playfair Display'; font-weight: 900; font-size: 1.4rem;">HAVSITE</div>
        <a href="/arcticles.html" style="text-decoration: none; color: var(--secondary-text); font-size: 0.8rem; font-weight: 600; letter-spacing: 1px;">
            <i class="fas fa-arrow-left"></i> BACK TO FEED
        </a>
    </header>

    <div class="article-hero">
        <span class="article-category">Digital Edition</span>
        <h1 class="article-title">${escapeHtml(title || 'Untitled Article')}</h1>
        <div class="article-meta-top" id="article-meta">
            <span>Written by <strong>${escapeHtml(author || 'Unknown')}</strong></span>
            <span>•</span>
            <span>${formattedDate}</span>
        </div>
    </div>

    <main class="magazine-grid">
        ${thumbnailUrl ? `
        <div class="featured-image-container">
            <img src="${escapeHtml(thumbnailUrl)}" alt="Cover" class="featured-image">
        </div>` : ''}

        <div class="article-body" id="content">
            ${content || '<p>No content available.</p>'}
        </div>

        <aside class="sidebar">
            <div class="action-box">
                <h4>Reading Tools</h4>
                <p style="font-size: 0.85rem; color: var(--secondary-text); margin-bottom: 20px;">
                    Short on time? Use our AI to condense this article into key points.
                </p>
                <button id="summarize">
                    <i class="fas fa-bolt"></i> Summarize
                </button>
            </div>
        </aside>
    </main>

    <footer style="margin-top: 80px; padding: 60px; text-align: center; background: var(--card-bg); border-top: 1px solid var(--border-color);">
        <p style="font-family: 'Playfair Display'; font-style: italic;">The Havsite Collective © 2026</p>
    </footer>

    <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" style="position:fixed; bottom:30px; left:30px; width:45px; height:45px; border-radius:50%; border:none; background:var(--text-color); color:var(--bg-color); cursor:pointer; z-index:999;">
        <i class="fas fa-moon"></i>
    </button>

    <script src="/myscript.js"></script>
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
    </script>
<script type="module">
    import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
    import { doc, getDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
    import { db, auth } from '/firebase_auth.js';
    import { getpoints, subpoints } from '/points.js';
    
    const summarizebtn = document.getElementById("summarize");
    const originalText = document.getElementById('content').innerText;
    const author = '${escapeHtml(author || 'Unknown')}';
    const articleId = '${escapeHtml(articleId)}';
    const WORKER_URL = 'https://summarizer.vm002248.workers.dev/';
    let username = '';

    console.log('author'); //debug test

    // Set up auth state listener ONCE when page loads
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                username = userDoc.data().username;
                console.log('User logged in:', username);
            }
        }
	adddeleteicon();
    });

    function adddeleteicon(){
      if( username.trim() === author.trim() ){
        document.getElementById('article-meta').insertAdjacentHTML('beforeend', 
      '<span id="delete"><i class="fa fa-edit"></i><strong>delete</strong></span>'
    );
        const deletebtn = document.getElementById("delete");
        deletebtn.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior
            deletepopup();
        });
      }
    }

  function deletepopup(){
    //Check if the popup already exists to prevent duplicates
    if (document.getElementById('delete-popup')) return;

    document.getElementById('body').insertAdjacentHTML('beforeend', 
      '<div class="delete-popup" id="delete-popup"><p class="conformation">Are you sure you want to delete this article? This action cannot be undone</p><button class="no-btn" id="cancel-delete">No</button><button class="yes-btn" id="delete-btn">Yes, Delete</button></div>'
    );

    // Use parentheses () to call the function, not = to assign it
    document.body.classList.add("modal-open");
    const cancelBtn = document.getElementById("cancel-delete");
    const popup = document.getElementById("delete-popup");
    const deletebtn = document.getElementById("delete-btn");
    
        deletebtn.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior
            deletearticle();
            popup.remove();
	    document.body.classList.remove("modal-open");
        });

    // Handle the "No" (Cancel) action
    cancelBtn.addEventListener("click", () => {
        popup.remove(); // Simply removes the popup from the DOM
        document.body.classList.remove("modal-open");
    });
}

async function deletearticle() {
  try {
    // Step 1: Attempt to delete summary
    const summaryRef = doc(db, "summaries", articleId);
    await deleteDoc(summaryRef);
    console.log("Summary successfully deleted!");

    try {
      // Step 2: ONLY runs if Step 1 succeeded
      const articleRef = doc(db, "articles", articleId);
      await deleteDoc(articleRef);
      console.log("Article successfully deleted!");

        try {
          // Step 3: ONLY runs if Step 2 succeeded
          const articleRef = doc(db, "thumbnails", articleId);
          await deleteDoc(articleRef);
          console.log("Thumbnail successfully deleted!");

          // Step 4: Success UI - ONLY runs if ALL 3 deletions worked
          alert("Articled deleted successfully! Redirecting...");
          setTimeout(() => {
          window.location.href = "https://havsite2.pages.dev/articles/articles";
        }, 1000);
  
        } catch (error) {
          // Error specifically for the article deletion
          console.error("Summary was deleted, but error removing article: ", error);
          alert("Summary deleted, but failed to remove the article.");
        }

    } catch (error) {
      // Error specifically for the article deletion
      console.error("Summary was deleted, but error removing article: ", error);
      alert("Summary deleted, but failed to remove the article.");
    }

  } catch (error) {
    // Error for the summary deletion (Article deletion is never even reached)
    console.error("Error removing summary (Article deletion aborted): ", error);
    alert("Failed to delete summary. Operation stopped.");
  }
}
    
    async function fetchsummarizedArticles() {
        try {
            // Use doc() to point to the specific document
            const docRef = doc(db, 'summaries', articleId);
            const docSnap = await getDoc(docRef);
    
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Update the UI with the content
                document.getElementById('content').innerHTML = data.content;
    
                // Call subpoints
                let subval = 3;
                subpoints(subval);      
                return data.content;
            } else {
                // If summary doesn't exist, generate it
                await sendMessage();
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
            document.getElementById('content').innerHTML = '<p style="color: red;">Error loading summary. Please try again.</p>';
        }
    }

    async function sendMessage() {
        const message = originalText;

        // Disable button while processing
        summarizebtn.disabled = true;
        summarizebtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Summarizing...';
        
        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: \`Please provide a concise summary of the following article:\n\n\${message}\`,
                    type: 'summary'
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error('Worker error:', data);
                document.getElementById('content').innerHTML = '<p style="color: red;">Sorry, something went wrong. Please try again.</p>';
                return;
            }
            
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Summary not found(ai failure).';
            
            // Format and display the summary (returns HTML)
            const htmlContent = formatMarkdown(text);
            
            // Save formatted HTML to Firestore for future use
            await saveSummaryToFirestore(htmlContent);
            
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('content').innerHTML = '<p style="color: red;">Sorry, something went wrong. Please try again.</p>';
        } finally {
            summarizebtn.disabled = false;
            summarizebtn.innerHTML = 'Summarize';
        }
    }

    async function saveSummaryToFirestore(htmlContent) {
        try {
            const docRef = doc(db, 'summaries', articleId);
            await setDoc(docRef, {
                content: htmlContent, // Save the HTML version
                createdAt: new Date().toISOString(),
                articleId: articleId
            });
            console.log('Summary saved successfully');
        } catch (error) {
            console.error('Error saving summary:', error);
            // Don't show error to user - summary still displayed
        }
        
        // Delete from unsummarized collection after successful save
        try {
            const docRef = doc(db, "unsummarized", articleId);
            await deleteDoc(docRef);
            console.log("Document successfully deleted from unsummarized!");
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    }


function formatMarkdown(text) {
        if (!text) {
            document.getElementById('content').innerHTML = '<p>No summary available.</p>';
            return;
        }

        let html = text.replace(/&/g, '&amp;')
                       .replace(/</g, '&lt;')
                       .replace(/>/g, '&gt;');
        
        html = html.replace(/\`\`\`(\\w+)?\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
            return \`<pre><code class="language-\${lang || 'text'}">\${code.trim()}</code></pre>\`;
        });
        
        html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        html = html.replace(/\\*([^\\*]+)\\*/g, '<em>$1</em>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
        html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        html = html.replace(/^[\\*\\-] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^\\d+\\. (.+)$/gm, '<li class="ordered">$1</li>');
        html = html.replace(/(<li>.*?<\\/li>\\n?)+/g, (match) => {
            return \`<ul>\${match}</ul>\`;
        });
        html = html.replace(/(<li class="ordered">.*?<\\/li>\\n?)+/g, (match) => {
            const cleaned = match.replace(/ class="ordered"/g, '');
            return \`<ol>\${cleaned}</ol>\`;
        });
        
        html = html.replace(/\\n\\n+/g, '</p><p>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p><\\/p>/g, '');
        html = html.replace(/<p>\\s*<\\/p>/g, '');
        html = html.replace(/\\n(?![<])/g, '<br>');
        html = html.replace(/<\\/p><br>/g, '</p>');
        html = html.replace(/<br><p>/g, '<p>');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\\/h[1-6]>)<\\/p>/g, '$1');
        html = html.replace(/<p>(<ul>|<ol>)/g, '$1');
        html = html.replace(/(<\\/ul>|<\\/ol>)<\\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\\/pre>)<\\/p>/g, '$1');

        document.getElementById('content').innerHTML = html;
        let subval = 3;
        subpoints(subval);
        return html;
    }
    // Add event listener to summarize button
    var points = getpoints();
    if (summarizebtn && points >= 3) {
        summarizebtn.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior
            fetchsummarizedArticles();
        });
    }
    else{
        summarizebtn.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior
            alert('insufficient points balance: ' + points);
        });
    }
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