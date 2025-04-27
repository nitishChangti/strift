$(function () {
    $(".navSection").load("/header");
    $("footer").load("/footer");
});


// ✅ Check if User is Logged In (from localStorage)
const isLoggedIn = localStorage.getItem('isLoggedIn');
let userWishlistedProducts = [];

// ✅ Fetch Wishlist Only If Logged In
if (isLoggedIn === 'true') {
    console.log('User is logged in. Fetching wishlist.');
    fetchWishlist();
} else {
    console.log('User not logged in. Showing products without wishlist.');
    showProducts();
}

// ✅ Function to Fetch Wishlist
async function fetchWishlist() {
    try {
        const response = await fetch('/getuserproductWishlist', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            userWishlistedProducts = data.data.wishlistTagIds;
            console.log('User wishlisted products:', userWishlistedProducts);
        } else {
            const error = await response.json();
            console.error('Error:', error);
        }
    } catch (error) {
        console.error('Failed to fetch user wishlisted products', error);
    }

    // ✅ After fetching wishlist, render products with wishlist status
    showProducts();
}

// ✅ Function to Show Products
function showProducts() {
    const storedProductData = localStorage.getItem('productData');
    if (storedProductData) {
        try {
            const productData = JSON.parse(storedProductData);
            displayProducts(productData, userWishlistedProducts);
        } catch (error) {
            console.error("Error parsing product data:", error);
        }
    } else {
        console.log('No product data found in localStorage.');
    }
}

// ✅ Function to Display Products
function displayProducts(products, userWishlistedProducts = []) {
    console.log('Displaying products:', products);

    // ✅ Separate wishlisted and non-wishlisted products
    const wishlistedProducts = products.filter(product => userWishlistedProducts.includes(product.TagId));
    const nonWishlistedProducts = products.filter(product => !userWishlistedProducts.includes(product.TagId));
    const sortedProducts = [...wishlistedProducts, ...nonWishlistedProducts];

    const productsContainer = document.querySelector('.product-grid .grid');
    if (!productsContainer) {
        console.error("Product container not found.");
        return;
    }

    // ✅ Clear previous products
    productsContainer.innerHTML = '';

    // ✅ Loop through products and render them
    sortedProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div style="position: relative;">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 285px; object-fit: cover;">
                <h3>${product.name}</h3>
                <p>${product.variants.color[0].price}</p>
                <button
                    class="w-18 h-12 flex-center rounded-button hover-bg-gray-100 opacity-0"
                    style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 30px;"
                    onclick="event.stopPropagation();">
                    <i class="${userWishlistedProducts.includes(product.TagId) ? 'ri-heart-fill' : 'ri-heart-line'}"
                    style="color: ${userWishlistedProducts.includes(product.TagId) ? 'red' : '#000000'};"></i>
                </button>
            </div>
        `;

        // ✅ Append the product to the container
        productsContainer.appendChild(productElement);
        productElement.style.border = '1px solid #ccc';
        productElement.style.width = 'auto';
        productElement.style.display = 'inline-block';

        // ✅ Set product attributes
        productElement.setAttribute('data-product-id', product._id);
        const wishlistBtn = productElement.querySelector('button');
        wishlistBtn.setAttribute('data-product-tag-id', product.TagId);

        // ✅ Add Wishlist Toggle Functionality
        wishlistBtn.addEventListener('click', async function () {
            if (isLoggedIn !== 'true') {
                alert('Please login to add product to wishlist');
                return;
            }

            const icon = this.querySelector('i');
            const productTagId = this.getAttribute('data-product-tag-id');
            icon.classList.toggle('ri-heart-line');
            icon.classList.toggle('ri-heart-fill');
            icon.style.color = icon.classList.contains('ri-heart-fill') ? 'red' : '#000000';

            // ✅ Call the Wishlist API
            try {
                const response = await fetch(`/productWishlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productTagId })
                });

                if (response.ok) {
                    const resData = await response.json();
                    console.log(`${resData.message}`, resData);

                    // ✅ Update Wishlist Status in LocalStorage
                    if (resData.status === 200) {
                        localStorage.setItem(`wishlist_${productTagId}`, 'true');
                    }
                } else {
                    const errData = await response.json();
                    throw new Error('Failed to add product to wishlist', errData);
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    // ✅ Redirect to Product Details Page
    productsContainer.addEventListener('click', async (event) => {
        event.preventDefault();
        const productElement = event.target.closest('.product-item');
        if (productElement) {
            const productId = productElement.getAttribute('data-product-id');
            window.location.pathname = `/productdetails/${productId}`;
        }
    });
}

// Function to store product data in localStorage
function storeProductData(data) {
    localStorage.setItem('productData', JSON.stringify(data));
}

// Example usage:
// storeProductData([{name: "Product 1", image: "image1.jpg", price: "$10"}]);
