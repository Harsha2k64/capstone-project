'use strict';

const BASE_URL = "http://34.160.225.35";

// Navbar active
document.querySelector('.active')?.classList.remove('active');
document.querySelector('a[href="/hamburguers"]')?.classList.add('active');

// Switch images
document.querySelectorAll('.product-thumbnail').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
        document.querySelector('.card-img').src = e.target.src;
    });
});

// Add product
document.querySelectorAll('.bi-caret-right-fill').forEach(btn => {
    btn.addEventListener('click', async (e) => {

        const div = e.target.nodeName === 'path'
            ? e.target.parentNode.parentNode
            : e.target.parentNode;

        const size = div.dataset.size;
        const counter = document.querySelector(`#counter-${size}`);
        const id = div.dataset.product;
        const quantity = parseInt(counter.textContent);

        try {
            const res = await fetch(`${BASE_URL}/ajax/checkStock?size=${size}&id=${id}`);
            const data = await res.json();

            if (quantity + 1 <= data.stock) {
                counter.textContent = quantity + 1;
            }
        } catch (err) {
            console.error("Stock check failed:", err);
        }
    });
});

// Remove product
document.querySelectorAll('.bi-caret-left-fill').forEach(btn => {
    btn.addEventListener('click', (e) => {

        const div = e.target.nodeName === 'path'
            ? e.target.parentNode.parentNode
            : e.target.parentNode;

        const size = div.dataset.size;
        const counter = document.querySelector(`#counter-${size}`);
        const quantity = parseInt(counter.textContent);

        if (quantity > 0) counter.textContent = quantity - 1;
    });
});

// Add to cart
document.querySelector('#cartAdd')?.addEventListener('click', async () => {

    const id = document.querySelector('div[data-product]').dataset.product;
    const sizes = document.querySelectorAll('div[data-size]');
    const addToCart = [];

    sizes.forEach(size => {
        let quantity = parseInt(
            document.querySelector(`#counter-${size.dataset.size}`).textContent
        );

        if (quantity > 0) {
            addToCart.push({
                id,
                size: size.dataset.size,
                quantity
            });
        }
    });

    if (addToCart.length === 0) return;

    try {
        await fetch(`${BASE_URL}/ajax/addToCart`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addToCart })
        });

        document.querySelectorAll('span[id^="counter"]').forEach(el => el.textContent = '0');

    } catch (err) {
        console.error("Add to cart failed:", err);
    }
});