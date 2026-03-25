'use strict';

// ✅ ADD THIS (backend base URL)
const BASE_URL = "http://34.61.4.103:8000";

// Updating active link on navbar
document.querySelector('.active')?.classList.remove('active');
document.querySelector('a[href="/hamburguers"]')?.classList.add('active');

// Load more products (pagination)
document.querySelector('#loadBtn').addEventListener('click', async (e) => {
    let page = parseInt(e.target.dataset.page);

    try {
        // ✅ CHANGED HERE
        const response = await fetch(`${BASE_URL}/ajax/loadPage?page=${page}`);
        const data = await response.text();

        if (!data.includes('false')) {
            let parser = new DOMParser();
            let append = parser.parseFromString(data, 'text/html');

            for (let child of append.body.childNodes) {
                document.querySelector('#productsList').appendChild(child);
            }

            e.target.dataset.page = page + 1;
        } else {
            e.target.innerText = 'No more products 😔';
        }

    } catch (err) {
        console.error("Pagination error:", err);
    }
});