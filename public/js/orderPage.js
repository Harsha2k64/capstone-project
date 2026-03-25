'use strict';

// ✅ ADD THIS (backend base URL)
const BASE_URL = "http://34.61.4.103:8000";

// Updating active link on navbar
document.querySelector('.active')?.classList.remove('active');
document.querySelector('a[href="/hamburguers"]')?.classList.add('active');

// Switch between product images
const thumbnails = document.querySelectorAll('.product-thumbnail');

for (let thumb of thumbnails) {
    thumb.addEventListener('click', (event) => {
        document.querySelector('.card-img').src = event.target.src;
    });
}

// Add product
const addButtons = document.querySelectorAll('.bi-caret-right-fill');

for (let addBtn of addButtons) {
    addBtn.addEventListener('click', async (e) => {
        const div = e.target.nodeName === 'path'
            ? e.target.parentNode.parentNode
            : e.target.parentNode;

        const size = div.dataset.size;
        const counter = document.querySelector(`#counter-${size}`);
        const id = div.dataset.product;
        const quantity = parseInt(counter.textContent);

        try {
            // ✅ CHANGED HERE
            const response = await fetch(`${BASE_URL}/ajax/checkStock?size=${size}&id=${id}`);
            const data = await response.json();

            if (quantity + 1 <= data.stock) {
                counter.textContent = quantity + 1;
            } else {
                const popoverBtn = e.target.nodeName === 'path'
                    ? e.target.parentNode
                    : e.target;

                $(popoverBtn).popover({ trigger: 'focus' }).popover('show');
                setTimeout(() => $(popoverBtn).popover('hide'), 2200);
            }
        } catch (err) {
            console.error("Stock check failed:", err);
        }
    });
}

// Remove product
const removeButtons = document.querySelectorAll('.bi-caret-left-fill');

for (let removeBtn of removeButtons) {
    removeBtn.addEventListener('click', (e) => {
        const div = e.target.nodeName === 'path'
            ? e.target.parentNode.parentNode
            : e.target.parentNode;

        const size = div.dataset.size;
        const counter = document.querySelector(`#counter-${size}`);
        const quantity = parseInt(counter.textContent);

        if (quantity > 0) counter.textContent = quantity - 1;
    });
}

// Add to cart
document.querySelector('#cartAdd').addEventListener('click', async () => {
    const id = document.querySelector('div[data-product]').dataset.product;
    const sizes = document.querySelectorAll('div[data-size]');
    const addToCart = [];

    for (let size of sizes) {
        let quantity = parseInt(
            document.querySelector('#counter-' + size.dataset.size).textContent
        );

        if (quantity > 0) {
            addToCart.push({
                id: id,
                size: size.dataset.size,
                quantity: quantity
            });
        }
    }

    let options = {
        trigger: 'manual',
        animation: true,
    };

    if (addToCart.length > 0) {
        try {
            // ✅ CHANGED HERE
            await fetch(`${BASE_URL}/ajax/addToCart`, {
                headers: { "Content-Type": "application/json" },
                method: 'POST',
                body: JSON.stringify({ addToCart })
            });

            options.title = 'Great! 🍔';
            options.content = 'Products added to the cart!';
            $('#cartAdd').popover('dispose').popover(options).popover('show');

            setTimeout(() => $('#cartAdd').popover('hide'), 2200);

            document.querySelectorAll('span[id^="counter"]')
                .forEach(el => el.textContent = '0');

        } catch (err) {
            console.error("Add to cart failed:", err);

            options.title = 'Error ❌';
            options.content = 'Something went wrong';
            $('#cartAdd').popover('dispose').popover(options).popover('show');
        }

    } else {
        options.title = 'Oops... ❌';
        options.content = 'No product selected';

        $('#cartAdd').popover('dispose').popover(options).popover('show');
        setTimeout(() => $('#cartAdd').popover('hide'), 2200);
    }
});