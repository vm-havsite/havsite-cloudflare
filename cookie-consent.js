
// Cookie Consent Popup for Havsite
(function() {
    // Check if user has already responded to cookie consent
    if (localStorage.getItem('havsiteCookieConsent')) {
        return;
    }

    // Create popup HTML
    const cookiePopupHTML = `
        <div id="cookieConsent" style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            max-width: 500px;
            margin: 0 auto;
            background: var(--card-bg, #ffffff);
            border-radius: var(--border-radius, 12px);
            box-shadow: var(--card-shadow, 0 8px 16px rgba(0, 0, 0, 0.1));
            padding: 20px;
            z-index: 10000;
            font-family: 'Poppins', Arial, sans-serif;
            color: var(--text-color, #333);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid transparent;
            background-clip: padding-box;
        ">
            <div style="
                display: flex;
                align-items: flex-start;
                gap: 15px;
            ">
                <div style="
                    background: linear-gradient(45deg, #6a11cb, #2575fc);
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 18px;
                ">
                    🍪
                </div>
                <div style="flex: 1;">
                    <h3 style="
                        margin: 0 0 10px 0;
                        font-size: 18px;
                        font-weight: 600;
                        background: linear-gradient(45deg, #6a11cb, #2575fc);
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                    ">Cookie Preferences</h3>
                    <p style="
                        margin: 0 0 20px 0;
                        font-size: 14px;
                        line-height: 1.5;
                        color: var(--text-color, #333);
                    ">
                        Havsite uses cookies to store your preferences (like theme settings) and improve your browsing experience. We respect your privacy!
                    </p>
                    <div style="
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                    ">
                        <button id="acceptCookies" style="
                            background: linear-gradient(45deg, #6a11cb, #2575fc);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 30px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-family: 'Poppins', Arial, sans-serif;
                        ">Accept All</button>
                        <button id="essentialCookies" style="
                            background: transparent;
                            color: var(--accent-color, #6a11cb);
                            border: 2px solid var(--accent-color, #6a11cb);
                            padding: 8px 18px;
                            border-radius: 30px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-family: 'Poppins', Arial, sans-serif;
                        ">Essential Only</button>
                    </div>
                </div>
                <button id="closeCookie" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-color, #333);
                    opacity: 0.6;
                    transition: opacity 0.3s ease;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                ">&times;</button>
            </div>
        </div>
    `;

    // Create and insert popup
    const popupContainer = document.createElement('div');
    popupContainer.innerHTML = cookiePopupHTML;
    document.body.appendChild(popupContainer);

    const popup = document.getElementById('cookieConsent');
    const acceptBtn = document.getElementById('acceptCookies');
    const essentialBtn = document.getElementById('essentialCookies');
    const closeBtn = document.getElementById('closeCookie');

    // Show popup with animation
    setTimeout(() => {
        popup.style.transform = 'translateY(0)';
        popup.style.opacity = '1';
    }, 500);

    // Add hover effects
    acceptBtn.addEventListener('mouseenter', () => {
        acceptBtn.style.transform = 'translateY(-2px)';
        acceptBtn.style.boxShadow = '0 5px 15px rgba(106, 17, 203, 0.4)';
    });

    acceptBtn.addEventListener('mouseleave', () => {
        acceptBtn.style.transform = 'translateY(0)';
        acceptBtn.style.boxShadow = 'none';
    });

    essentialBtn.addEventListener('mouseenter', () => {
        essentialBtn.style.backgroundColor = 'var(--accent-color, #6a11cb)';
        essentialBtn.style.color = 'white';
        essentialBtn.style.transform = 'translateY(-2px)';
    });

    essentialBtn.addEventListener('mouseleave', () => {
        essentialBtn.style.backgroundColor = 'transparent';
        essentialBtn.style.color = 'var(--accent-color, #6a11cb)';
        essentialBtn.style.transform = 'translateY(0)';
    });

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.6';
    });

    // Handle button clicks
    function hidePopup() {
        popup.style.transform = 'translateY(100px)';
        popup.style.opacity = '0';
        setTimeout(() => {
            popupContainer.remove();
        }, 400);
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('havsiteCookieConsent', 'accepted');
        hidePopup();
    });

    essentialBtn.addEventListener('click', () => {
        localStorage.setItem('havsiteCookieConsent', 'essential');
        hidePopup();
    });

    closeBtn.addEventListener('click', () => {
        localStorage.setItem('havsiteCookieConsent', 'dismissed');
        hidePopup();
    });

    // Auto-hide after 30 seconds if no interaction
    setTimeout(() => {
        if (document.getElementById('cookieConsent')) {
            localStorage.setItem('havsiteCookieConsent', 'auto-dismissed');
            hidePopup();
        }
    }, 30000);

    // Handle responsive design
    function updatePopupStyle() {
        if (window.innerWidth <= 600) {
            popup.style.left = '10px';
            popup.style.right = '10px';
            popup.style.bottom = '10px';
        } else {
            popup.style.left = '20px';
            popup.style.right = '20px';
            popup.style.bottom = '20px';
        }
    }

    window.addEventListener('resize', updatePopupStyle);
    updatePopupStyle();

})();

// Utility function to check cookie consent status (optional - for other scripts)
function getHavsiteCookieConsent() {
    return localStorage.getItem('havsiteCookieConsent');
}ss