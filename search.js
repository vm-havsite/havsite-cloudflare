        // Search functionality
        function searchFunction() {
            var searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const pages = {
                "help": "https://havsite.pages.dev/help",
                "tools": "https://havsite.pages.dev/tools",
                "arcticles": "https://havsite.pages.dev/arcticles",
                "homepage": "https://havsite.pages.dev/homepage",
                "download": "https://havsite.pages.dev/download",
                "our team": "https://havsite.pages.dev/our team",
                "team": "https://havsite.pages.dev/our team",
                "music": "https://havsite.pages.dev/music",
                "faq": "https://havsite.pages.dev/tep",
                "contact": "https://havsite.pages.dev/tep",
                "contact us": "https://havsite.pages.dev/tep",
                "profiles": "https://havsite.pages.dev/cst"
            };
            
            if (pages[searchTerm]) {
                window.location.href = pages[searchTerm];
            } else {
                alert("No results found for: " + searchTerm);
            }
        }