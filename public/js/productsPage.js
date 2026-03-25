'use strict';

const BASE_URL = "http://34.160.225.35";

// Navbar active
document.querySelector('.active')?.classList.remove('active');
document.querySelector('a[href="/hamburguers"]')?.classList.add('active');

// Load more products
document.querySelector('#loadBtn')?.addEventListener('click', async (e) => {
    let page = parseInt(e.target.dataset.page);

    try {
        const response = await fetch(`${BASE_URL}/ajax/loadPage?page=${page}`);
        const data = await response.text();

        if (!data.includes('false')) {
            let parser = new DOMParser();
            let append = parser.parseFromString(data, 'text/html');

            append.body.childNodes.forEach(child => {
                document.querySelector('#productsList').appendChild(child);
            });

            e.target.dataset.page = page + 1;
        } else {
            e.target.innerText = 'No more products 😔';
        }

    } catch (err) {
        console.error("Pagination error:", err);
    }
});