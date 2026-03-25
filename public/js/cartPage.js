'use strict';

const BASE_URL = "http://34.61.4.103:8000";

// Navbar active
document.querySelector('.active')?.classList.remove('active');
document.querySelector('a[href="/hamburguers"]')?.classList.add('active');

// Add product
document.querySelectorAll('.bi-caret-right-fill').forEach(btn => {
    btn.addEventListener('click', async (e) => {

        const div = e.target.nodeName === 'path'
            ? e.target.parentNode.parentNode
            : e.target.parentNode;

        const size = div.dataset.size;
        const id = div.dataset.product;
        const counter = document.querySelector(`#counter-${size}${id}`);
        let quantity = parseInt(counter.textContent);

        try {
            const res = await fetch(`${BASE_URL}/ajax/checkStock?size=${size}&id=${id}`);
            const data = await res.json();

            if (quantity + 1 <= data.stock) {
                quantity = counter.textContent = quantity + 1;

                updateCart({ id, size, quantity });
                updateTotal(id, size, quantity, 'add');
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
        const id = div.dataset.product;
        const counter = document.querySelector(`#counter-${size}${id}`);
        let quantity = parseInt(counter.textContent);

        if (quantity > 0) {
            quantity = counter.textContent = quantity - 1;

            updateCart({ id, size, quantity });
            updateTotal(id, size, quantity, 'remove');
        }
    });
});

// Update cart
async function updateCart(modifiedProduct) {
    try {
        await fetch(`${BASE_URL}/ajax/updateCart`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updateProduct: modifiedProduct })
        });
    } catch (err) {
        console.error("Update cart failed:", err);
    }
}

// Update total
function updateTotal(id, size, qnty, operation) {
    let price = parseFloat(document.querySelector(`#unityPrice-${size}${id}`).textContent);
    let subTotal = document.querySelector(`#totalPrice-${size}${id}`);
    let total = document.querySelector(`#cartTotal`);

    subTotal.textContent = price * qnty;

    if (operation === 'add') {
        if (total.textContent === "0") {
            document.querySelector('input[value="Checkout"]').disabled = false;
        }
        total.textContent = parseFloat(total.textContent) + price;

    } else {
        total.textContent = parseFloat(total.textContent) - price;

        if (total.textContent === "0") {
            document.querySelector('input[value="Checkout"]').disabled = true;
        }
    }
}