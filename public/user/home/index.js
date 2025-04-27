console.log(typeof $); // Should log "function" if jQuery is loaded
$(function () {
    $(".navSection").load("./header.html");
    $(".navSection").load("header.html", function () {

        if (!localStorage.getItem('isLoggedIn')) {
            // Show the login popup with options for new users and profile links
            showLoginPopup();
            console.log('before login popup')
        } else {
            // Show the account-related menu (My Profile, Orders, Wishlist, Logout)
            console.log('after login popup')
            showAccountPopup();
        }

        const logOutButton = document.querySelector('.loginClick');

        logOutButton.addEventListener('click', async (event) => {
            console.log('logout button')
            // event.preventDefault();
            try {
                event.preventDefault();
                const response = await fetch('/account/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    const responseData = await response.json();
                    localStorage.removeItem('isLoggedIn');
                    console.log('logged out', responseData)
                    console.log(responseData.data.redirect)
                    if (responseData.data.redirect) {
                        alert('logout is successfully done')
                        window.location.href = responseData.data.redirect

                    } else {
                        console.error('logout failed or redirect failed')
                    }
                    // responseData.redirect;

                }
                else {
                    console.log('error', response.status)
                    console.error('logout failed')
                }
            } catch (error) {
                console.error('Error:', error);
            }
        })
        // const searchBar = document.querySelector('.searchSection input');
        const searchButton = document.querySelector('.searchSection .material-symbols-outlined');
        searchButton.addEventListener('click', () => {
            const search = document.querySelector('.searchSection input').value;
            fetchSuggestions({ search });
            fetchProducts({ search });
            // console.log(searchBar.value, search)

        });

        // Handle search (Functionality 2)
        document.querySelector('.searchSection input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const search = event.target.value;
                fetchSuggestions({ search });
                fetchProducts({ search });
                console.log('searching', search)
            }
        });

        const searchBar = document.getElementById('searchBar');
        const suggestionsDropdown = document.getElementById('suggestionsDropdown');
        console.log(suggestionsDropdown)

        // Debounce function to limit API calls
        function debounce(func, delay) {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        }

        // Fetch suggestions from the backend
        async function fetchSuggestions(query) {
            if (!query) {
                suggestionsDropdown.style.display = 'none'; // Hide dropdown if query is empty
                return;
            }

            try {
                const response = await fetch(`/productsuggestionsforuser?query=${query}`);
                if (response.ok) {
                    const suggestions = await response.json();
                    console.log('suggestions:', suggestions);
                    displaySuggestions(suggestions.data.suggestions);
                } else {
                    console.error('Error:', response.status);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }

        // Display suggestions in the dropdown
        function displaySuggestions(suggestions) {
            if (suggestions.length === 0) {
                suggestionsDropdown.style.display = 'none'; // Hide dropdown if no suggestions
                return;
            }
            console.log('displaying suggestions:', suggestions);
            suggestionsDropdown.innerHTML = ''; // Clear previous suggestions
            suggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.textContent = suggestion.name; // Display suggestion name
                suggestionItem.style.padding = '5px';
                suggestionItem.style.borderBottom = '1px solid #ccc';
                suggestionItem.style.backgroundColor = 'white';
                suggestionItem.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                suggestionItem.addEventListener('click', () => {
                    searchBar.value = suggestion.name; // Autocomplete search bar
                    suggestionsDropdown.style.display = 'none'; // Hide dropdown
                    // displayProducts(suggestion.products); // Display products for the selected suggestion
                });
                suggestionsDropdown.appendChild(suggestionItem);
            });

            suggestionsDropdown.style.display = 'block'; // Show dropdown
        }

        // Display products in the UI
        function displayProducts(products) {
            const productsContainer = document.getElementById('productsContainer');
            productsContainer.innerHTML = ''; // Clear previous products
            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.textContent = product.name; // Display product name
                productsContainer.appendChild(productItem);
            });
        }

        // Listen for input events with debouncing
        searchBar.addEventListener('input', debounce(() => {
            console.log('input event');
            const query = searchBar.value.trim();
            fetchSuggestions(query); // Fetch suggestions as the user types
        }, 300));

        // Hide suggestions when clicking outside
        document.addEventListener('click', (event) => {
            if (!searchBar.contains(event.target) && !suggestionsDropdown.contains(event.target)) {
                suggestionsDropdown.style.display = 'none'; // Hide dropdown
            }
        });
    });


    $("footer").load("./footer.html");
});

function showLoginPopup() {
    const accountHover = document.querySelector('.accountLink');
    if (accountHover) {
        let beforeLoginPopUp = document.querySelector('.beforeloginPopUp')

        accountHover.addEventListener('mouseenter', () => {
            console.log('hover')
            console.log('mouseover on accountLink')
            accountHover.style.backgroundColor = 'lightgreen'
            beforeLoginPopUp.style.display = "flex ";
        });
        accountHover.addEventListener('mouseleave', () => {
            console.log('mouseleave on accountLink')
            beforeLoginPopUp.style.display = "none ";
        })

        // Keep the popup open when the mouse enters the popup
        beforeLoginPopUp.addEventListener('mouseenter', () => {
            console.log('mouseenter on beforeloginPopUp');
            beforeLoginPopUp.style.display = "flex"; // Keep the popup open
        });

        // Hide the popup when the mouse leaves the popup
        beforeLoginPopUp.addEventListener('mouseleave', () => {
            console.log('mouseleave on beforeloginPopUp');
            beforeLoginPopUp.style.display = "none"; // Hide the popup
            // accountHover1.style.backgroundColor = ''; // Reset background color
        });

    } else {
        console.error("Element not found!");
    }

}
function showAccountPopup() {
    const accountHover = document.querySelector('.accountLink');
    if (accountHover) {
        let afterLoginPopUp = document.querySelector('.afterloginPopUp')

        console.log(document.querySelector('.navLinks a').href = '')
        accountHover.addEventListener('mouseenter', () => {
            console.log('mouseover on accountLink')
            accountHover.style.backgroundColor = 'lightgreen'
            afterLoginPopUp.style.display = "flex ";
        });
        accountHover.addEventListener('mouseleave', () => {
            console.log('mouseleave on accountLink')
            afterLoginPopUp.style.display = "none ";
        })

        // Keep the popup open when the mouse enters the popup
        afterLoginPopUp.addEventListener('mouseenter', () => {
            console.log('mouseenter on afterLoginPopUp');
            afterLoginPopUp.style.display = "flex"; // Keep the popup open
        });

        // Hide the popup when the mouse leaves the popup
        afterLoginPopUp.addEventListener('mouseleave', () => {
            console.log('mouseleave on afterLoginPopUp');
            afterLoginPopUp.style.display = "none"; // Hide the popup
            // accountHover1.style.backgroundColor = ''; // Reset background color
        });

    } else {
        console.error("Element not found!");
    }

}


//navbar hamburgar animation
window.onload = function () {
    var menuButton = document.querySelector(".menuButton");
    var resNavbar = document.querySelector(".res_navbar");

    menuButton.addEventListener("click", function () {
        resNavbar.classList.toggle("fade-in");
    });
};

function myfunction() {
    alert("Order placed Successfully");
}

function scrolltosection() {
    document.querySelector(".cat-logo").scrollIntoView({ behavior: "smooth" });
}

function changeMainImage(imageSrc) {
    document.querySelector("#main-img").src = imageSrc;
}

function selectSize(size) {
    document.querySelector("#size-s").classList.remove("selected");
    document.querySelector("#size-m").classList.remove("selected");
    document.querySelector("#size-l").classList.remove("selected");

    document
        .querySelector("#size-" + size.toLowerCase())
        .classList.add("selected");
}

function selectQuantity(quantity) {
    document.querySelector("#quantity-1").classList.remove("selected");
    document.querySelector("#quantity-2").classList.remove("selected");
    document.querySelector("#quantity-3").classList.remove("selected");

    document
        .querySelector("#quantity-" + quantity.toLowerCase())
        .classList.add("selected");
}

// buy btn
function openCheckoutPopup() {
    document.getElementById("checkout-popup").classList.remove("hidden");
}

function closeCheckoutPopup() {
    document.getElementById("checkout-popup").classList.add("hidden");
}

function placeOrder() {
    const form = document.getElementById("billing-form");
    if (!form.checkValidity()) {
        alert("Please fill in all required fields.");
        // form.reportValidity();
        return;
    }

    //   //   // Clear the cart after order placement
    localStorage.removeItem("cart");
    closeCheckoutPopup();
    document.getElementById("order-confirmation").classList.remove("hidden");
}

function closeOrderConfirmation() {
    document.getElementById("order-confirmation").classList.add("hidden");
    window.location.href = "index.html"; // Redirect to home or any other page
}

////////////////

// const accountHover = document.querySelector('.accountLink');
// if (accountHover) {
//     let beforeLoginPopUp = document.querySelector('.beforeloginPopUp')

//     accountHover.addEventListener('mouseenter', () => {
//         console.log('mouseover on accountLink')
//         accountHover.style.backgroundColor = 'lightgreen'
//         beforeLoginPopUp.style.display = "flex ";

//     });
//     accountHover.addEventListener('mouseleave', () => {
//         console.log('mouseleave on accountLink')
//         beforeLoginPopUp.style.display = "none ";
//     })

//     // Keep the popup open when the mouse enters the popup
//     beforeLoginPopUp.addEventListener('mouseenter', () => {
//         console.log('mouseenter on beforeloginPopUp');
//         beforeLoginPopUp.style.display = "flex"; // Keep the popup open
//     });

//     // Hide the popup when the mouse leaves the popup
//     beforeLoginPopUp.addEventListener('mouseleave', () => {
//         console.log('mouseleave on beforeloginPopUp');
//         beforeLoginPopUp.style.display = "none"; // Hide the popup
//         // accountHover1.style.backgroundColor = ''; // Reset background color
//     });

// } else {
//     console.error("Element not found!");
// }



// category clicked on home page
// Add event listeners to all category links
document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent the default link behavior
        console.log('category clicked')
        // Get the database-friendly category name from the data attribute
        const category = this.getAttribute('data-category');
        console.log(category)
        // fetchProducts(category)
        // Redirect to the product page with the correct category
        // window.location.href = `product.html?category=${category}`;
    });
});
// public/user/home/index.js
import { productData } from "./export.js";
// let productSearchedData = 10;
async function fetchProducts(params = {}) {
    console.log('fetching products')
    const queryString = new URLSearchParams(params).toString();
    try {
        // Send a GET request to the server with the category name
        const response = await fetch(`/productsuggestionsforuser?query=${queryString}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )
        if (response.ok) {
            let responseData = await response.json();
            console.log('category data:', responseData);
            const data = responseData.data.completeproductData;
            console.log('Data:', data);
            // Store data in cookies
            localStorage.setItem('productData', JSON.stringify(data));

            window.location.pathname = '/products'
        } else {
            console.error('Error:', response.status);
        }

    } catch (error) {
        console.error('this is from home page for fetching the category data Error:', error);
    }
}
