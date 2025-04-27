function productfunction() {
    //from here product related code starts
    const categoriesData = []
    if (window.location.pathname === '/admin/dashboard/product-create') {

        fetchCategories();

        async function fetchCategories() {
            if (window.location.pathname === '/admin/dashboard/product-create') {
                try {
                    console.log('fetchcategories')
                    const response = await fetch("/admin/dashboard/getallcategoryforcreateproduct",
                        {
                            method: "GET",
                        });
                    if (response.ok) {
                        const categories = await response.json();
                        // console.log('Categories', categories.data);
                        categoriesData.push(...categories.data)
                    }
                    else {
                        console.log('Error fetching categories')
                    }
                    // console.log(categoriesData)
                    // console.log(categoriesData[0].TagId)
                    categorySelect.innerHTML = `<option value="">Select a category</option>`;
                    categoriesData.forEach(category => {
                        categorySelect.innerHTML += `<option catTagId="${category.TagId}" value="${category.name}" >${category.name}</option>`;
                    });
                } catch (error) {
                    console.error("Failed to load categories:", error);
                }
            }
        }


    }
    // Get references
    const customFieldsContainer = document.getElementById('custom-fields-container');
    const addCustomFieldButton = document.getElementById('add-custom-field');

    //from product-list page createProduct button logic - when btn is clicked to render the create-product route/url show the form
    const createProductFormbtn = document.querySelector('#product-list .create-btn');
    createProductFormbtn.addEventListener('click', () => {
        window.location.pathname = '/admin/dashboard/product-create';
    })
    //createCustomField function logic
    function createCustomField(customfieldDataObject) {
        console.log(customfieldDataObject)
        if (customfieldDataObject !== undefined) {
            const customFieldKeys = Object.keys(customfieldDataObject);
            const customFieldValues = Object.values(customfieldDataObject);
            customFieldKeys.forEach((key, index) => {
                const fieldNameInput = document.createElement('input');
                fieldNameInput.type = 'text';
                fieldNameInput.placeholder = 'Custom Field Name';
                fieldNameInput.value = key;
                fieldNameInput.style.marginRight = '10px';
                fieldNameInput.style.width = '20vh';

                const fieldValueInput = document.createElement('input');
                fieldValueInput.type = 'text';
                fieldValueInput.placeholder = 'Custom Field Value';
                fieldValueInput.value = customFieldValues[index];
                // fieldValueInput.style.width = '20vh';
                fieldNameInput.style.marginRight = '10px';
                fieldNameInput.style.width = '20vh';

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.style.marginLeft = '10px';
                removeButton.style.backgroundColor = '#ff4d4d';
                removeButton.style.color = 'white';
                removeButton.style.border = 'none';
                removeButton.style.padding = '4px 8px';
                removeButton.style.borderRadius = '4px';
                removeButton.style.cursor = 'pointer';

                removeButton.addEventListener('click', () => customFieldDiv.remove());

                const customFieldDiv = document.createElement('div');
                const customFieldLabel = document.createElement('span');
                customFieldLabel.style.display = 'flex';
                customFieldDiv.appendChild(customFieldLabel);
                customFieldDiv.style.width = "330px";
                customFieldLabel.appendChild(fieldNameInput);
                customFieldLabel.appendChild(fieldValueInput);
                customFieldDiv.appendChild(removeButton);
                customFieldsContainer.appendChild(customFieldDiv);
            });
        }
        else {
            const customFieldDiv = document.createElement('div');
            const customFieldLabel = document.createElement('span');
            customFieldLabel.style.display = 'flex';
            customFieldDiv.appendChild(customFieldLabel);
            // customFieldDiv.style.display = 'flex';
            customFieldDiv.style.marginBottom = "10px";
            addCustomFieldButton.style.height = '5vh';
            // Input for custom field name
            const fieldNameInput = document.createElement('input');
            fieldNameInput.type = 'text';
            fieldNameInput.placeholder = 'Custom Field Name (e.g., Fabric)';
            fieldNameInput.style.marginRight = '10px';
            fieldNameInput.style.width = '20vh';


            // Input for custom field value
            const fieldValueInput = document.createElement('input');
            fieldValueInput.type = 'text';
            fieldValueInput.placeholder = 'Custom Field Value (e.g., Cotton)';
            fieldValueInput.style.width = '20vh';

            // Remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.style.marginLeft = '10px';
            removeButton.style.backgroundColor = '#ff4d4d';
            removeButton.style.color = 'white';
            removeButton.style.border = 'none';
            removeButton.style.padding = '4px 8px';
            removeButton.style.borderRadius = '4px';
            removeButton.style.cursor = 'pointer';

            removeButton.addEventListener('click', () => customFieldDiv.remove());

            // Append inputs and button to the container
            customFieldLabel.appendChild(fieldNameInput);
            customFieldLabel.appendChild(fieldValueInput);
            customFieldDiv.appendChild(customFieldLabel);
            customFieldDiv.appendChild(removeButton);

            customFieldsContainer.appendChild(customFieldDiv);

        }
    }

    // Add custom input fields
    addCustomFieldButton.addEventListener('click', () => {
        createCustomField();
    })
    //create product forms cancel button logic
    const cancelButton = document.querySelector('#create-product .create-form .cancel')
    cancelButton.addEventListener('click', () => {
        document.querySelector('#create-product').style.display = 'none'
    })
    // Select image upload elements
    const imageUpload = document.getElementById("image-upload");
    const imageUploads = document.getElementById("image-uploads");
    const uploadBoxMain = document.getElementById("upload-box");
    const uploadBoxSecondary = document.getElementById("upload-boxs");
    const createForm = document.querySelector(".create-form");

    // Handle main image upload
    uploadBoxMain.addEventListener("click", () => imageUpload.click());

    let mainImageFile;
    imageUpload.addEventListener("change", (event) => {
        mainImageFile = event.target.files[0];
        handleImageUpload([mainImageFile], ".preview img", true);
    });

    // Handle additional images upload
    let additionalImageFiles = [];
    uploadBoxSecondary.addEventListener("click", () => imageUploads.click());

    imageUploads.addEventListener("change", (event) => {
        additionalImageFiles = Array.from(event.target.files);
        handleImageUpload(additionalImageFiles, ".multiProductImage", false);
    });
    // console.log(additionalImageFiles)
    // Image upload handling function
    function handleImageUpload(files, selector, isSingle) {
        const previewContainer = document.querySelector(selector);
        if (isSingle) {
            if (files.length) {
                const reader = new FileReader();
                reader.onload = (e) => (previewContainer.src = e.target.result);
                reader.readAsDataURL(files[0]);
            }
        } else {
            previewContainer.innerHTML = "";
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.style.width = "60px";
                    img.style.marginRight = "5px";
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    }
    // Arrays to store selected sizes and colors
    let selectedSizes = [];
    // let selectedColors = [];
    let selectedColors = {}; // Store selected colors and their fields

    // Handle size selection
    document.querySelectorAll(".sizes span").forEach((sizeSpan) => {
        sizeSpan.addEventListener("click", () => {
            const size = sizeSpan.textContent;

            // Toggle selection state
            if (selectedSizes.includes(size)) {
                selectedSizes.splice(selectedSizes.indexOf(size), 1);
                sizeSpan.classList.remove("selected");
            } else {
                selectedSizes.push(size);
                document.querySelector('.sizes').setAttribute("aria-required", "true");
                sizeSpan.classList.add("selected");
            }
            console.log("Selected Sizes:", selectedSizes);
        });
    });

    // document.addEventListener("DOMContentLoaded", function () {
    const colorOptionsContainer = document.querySelector(".color-options");
    const colorDetailsContainer = document.getElementById("color-details-container");
    const newColorHexInput = document.getElementById("newColorHex");
    const addColorBtn = document.getElementById("addColorBtn");

    // Store selected colors as an object
    // const selectedColors = {};

    // Function to get color name from API
    async function getColorNameFromAPI(hex) {
        try {
            const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex.replace("#", "")}`);
            const data = await response.json();
            return data.name.value || `Custom Color (${hex})`; // Return color name or fallback
        } catch (error) {
            console.error("Error fetching color name:", error);
            return `Custom Color (${hex})`; // Fallback if API fails
        }
    }

    // Function to add new color
    addColorBtn.addEventListener("click", async function (e) {
        e.preventDefault()
        const colorHex = newColorHexInput.value.trim();
        if (!colorHex) {
            alert("Please select a color.");
            return;
        }

        // Check if color already exists
        if (selectedColors[colorHex]) {
            alert("This color is already added.");
            return;
        }

        const colorName = await getColorNameFromAPI(colorHex); // Get color name from API
        console.log(colorName)
        selectedColors[colorHex] = { name: colorName, price: "", stock: "" }; // Store color data

        // Create the color swatch button
        const colorSpan = document.createElement("span");
        colorSpan.classList.add("color-swatch");
        colorSpan.style.backgroundColor = colorHex;
        colorSpan.dataset.color = colorHex;
        colorOptionsContainer.appendChild(colorSpan);

        // Add event listener to show/hide Price & Stock fields
        colorSpan.addEventListener("click", function () {
            console.log('clicked in color span')
            togglePriceStockFields(colorHex, colorName, colorSpan);
        });

        console.log("Selected Colors:", selectedColors);
    });

    function togglePriceStockFields(colorHex, colorName, element) {
        if (selectedColors[colorHex].element) {
            // Remove fields if already added
            selectedColors[colorHex].element.remove();
            delete selectedColors[colorHex].element;
            element.classList.remove("selected");
        } else {
            // Create price/stock fields
            const detailsDiv = document.createElement("div");
            detailsDiv.classList.add("color-details");
            detailsDiv.innerHTML = `
                  <h3>${colorName} - Price & Stock</h3>
                  <label>Price:</label>
                  <input type="number" placeholder="Enter price" 
                         oninput="updateColorData('${colorHex}', 'price', this.value)">
                  <label>Stock:</label>
                  <input type="number" placeholder="Enter stock" 
                         oninput="updateColorData('${colorHex}', 'stock', this.value)">
              `;

            colorDetailsContainer.appendChild(detailsDiv);
            selectedColors[colorHex].element = detailsDiv;
            element.classList.add("selected");
        }
    }

    // Function to update selectedColors data
    window.updateColorData = function (colorHex, key, value) {
        if (selectedColors[colorHex]) {
            selectedColors[colorHex][key] = value;
            console.log("Updated Colors:", selectedColors);
        }
    };

    // Function to get selected colors as an array
    // function getSelectedColorsArray() {
    //     return Object.entries(selectedColors).map(([hex, data]) => ({
    //         hex,
    //         ...data
    //     }));
    // }

    // Example of how to retrieve selected colors in array form
    // document.getElementById("submitBtn").addEventListener("click", function () {
    //     console.log("Final Selected Colors Array:", getSelectedColorsArray());
    // });




    const categorySelect = document.querySelector("select[name='category']");
    const subCategorySelect = document.querySelector("select[name='subCategory']");

    // if (window.location.pathname == '/admin/dashboard/product-create') {
    //     console.log('hes')
    // }

    // Handle category selection and populate subcategories without additional API call
    categorySelect.addEventListener("change", (event) => {
        const categoryTagId = event.target.value;
        console.log(categoryTagId)
        // Clear subcategory select if no category selected
        subCategorySelect.innerHTML = `<option value="">Select a sub category</option>`;
        if (!categoryTagId) return;

        // Find the selected category in cached data
        const selectedCategory = categoriesData.find(category => category.name === categoryTagId);
        console.log(selectedCategory)

        if (selectedCategory && selectedCategory.subCategories) {
            selectedCategory.subCategories.forEach(subcategory => {
                subCategorySelect.innerHTML += `<option catTagId="${subcategory.TagId}" value="${subcategory.name}">${subcategory.name}</option>`;
            });
        }
    });

    // Handle form submission
    createForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        let isValid = true;
        let url;
        // Collect form data manually
        const formData = new FormData();

        // Access image data directly from the document
        const productName = createForm.productName.value;
        const TagId = createForm.TagId.value;
        const category = createForm.category.value;
        const subCategory = createForm.subCategory.value;
        const gender = createForm.gender.value;
        const description = createForm.description.value;
        const sizes = selectedSizes;
        const colors = selectedColors;
        const discount = createForm.discount.value;
        console.log(createForm.category, createForm.subCategory)
        const formMode = createForm.ProductformMode.value;
        if (formMode === 'create') {
            url = '/admin/dashboard/createproduct'
            // document.querySelector('#image-uploads').setAttribute('required');
        }
        else if (formMode === 'edit') {
            url = '/admin/dashboard/editproduct'
            const image = document.querySelector('.preview img')
            // console.log(image.src)
            mainImageFile = image.src
            console.log(mainImageFile)
            // Select all elements with the class 'multiProductImage'
            const imageContainers = document.querySelectorAll('.multiProductImage');

            // Check if any elements were found
            if (imageContainers.length > 0) {
                const allImages = [];
                imageContainers.forEach((container) => {
                    console.log(container.children);
                    Array.from(container.children).forEach((child) => {
                        allImages.push(child.src);
                    });
                });
                additionalImageFiles = allImages
                console.log(additionalImageFiles, allImages);
            } else {
                console.log('No elements with class "multiProductImage" found.');
            }
        }
        else {
            console.log('image is required')
        }

        // Append main image
        if (mainImageFile) {
            console.log('image is ', mainImageFile)
            formData.append('image', mainImageFile);
        }

        // Append additional images
        additionalImageFiles.forEach((file) => {
            formData.append('images', file);
            console.log('images', file)
        });
        if (productName && typeof (productName) === 'string' && productName.trim() !== '' && productName.length > 0) {
            console.log('productName is:', productName);
            formData.append('productName', productName);
        }
        else {
            alert('Please enter product name');
        }
        if (TagId && typeof (TagId) === 'string' && TagId.trim() !== '' && TagId.length > 0) {
            console.log("TagId is:", TagId);
            formData.append('TagId', TagId)
        }
        else {
            alert('Please enter Brand name');
        }
        if (category && typeof (category) === 'string' && category.trim() !== '' && category.length > 0) {
            console.log('category is:', category);
            formData.append('category', category);
        }
        else {
            alert('Please enter category');
        }
        if (subCategory && typeof (subCategory) === 'string' && subCategory.trim() !== '' && subCategory.length > 0) {
            console.log('subCategory is:', subCategory);
            formData.append('subCategory', subCategory);

        }
        else {
            alert('Please enter subCategory');
        }
        if (gender && typeof (gender) === 'string' && gender.trim() !== '' && gender.length > 0) {
            console.log('gender is:', gender);
            formData.append('gender', gender);
        }
        else {
            alert('Please enter gender');
        }
        if (description && typeof (description) === 'string' && description.trim() !== '' && description.length > 0) {
            console.log('description is:', description);
            formData.append('description', description);
        }
        else {
            alert('Please enter description');
        }
        if (selectedSizes && selectedSizes.length > 0) {
            console.log('selectedSizes is:', selectedSizes);
            formData.append('selectedSizes', JSON.stringify(sizes));
        }
        else {
            alert('Please select at least one size');
        }
        // Convert selectedColors object into an array & filter out empty price & stock
        const selectedColorsArray = Object.entries(selectedColors)
            .map(([hex, data]) => ({
                name: data.name,
                price: data.price,
                stock: data.stock
            }))
            .filter(color => color.price.trim() !== "" || color.stock.trim() !== ""); // Keep only valid entries

        console.log("Filtered Selected Colors Array:", selectedColorsArray);

        // Append to formData only if there are valid colors
        if (selectedColorsArray.length > 0) {
            formData.append("selectedColors", JSON.stringify(selectedColorsArray));
            console.log("Final formData:", formData.get("selectedColors")); // Debugging
        } else {
            alert("Please ensure at least one color has a price or stock before submitting.");
            isValid = false;
        }

        if (discount && typeof (discount) === 'string' && discount.trim() !== '' && discount.length > 0) {
            console.log('discount is:', discount);
            formData.append('discount', discount);
        }
        else {
            alert('Please enter discount');
        }

        const customFields = [];
        document.querySelectorAll("#custom-fields-container > div").forEach((customFieldDiv) => {
            const inputs = customFieldDiv.querySelectorAll("input");

            if (inputs.length === 2) {
                const fieldName = inputs[0].value.trim();
                const fieldValue = inputs[1].value.trim();

                // Remove previous error messages
                customFieldDiv.querySelectorAll(".error-message").forEach((msg) => msg.remove());

                let valid = true;

                // Validate Field Name
                if (!fieldName) {
                    showError(inputs[0], "Field name is required.");
                    valid = false;
                }

                // Validate Field Value
                if (!fieldValue) {
                    showError(inputs[1], "Field value is required.");
                    valid = false;
                }

                // Append if valid
                if (valid) {
                    // customFields.push({ name: fieldName, value: fieldValue });
                    formData.append(`${fieldName}`, fieldValue);
                } else {
                    isValid = false;
                }
            }
        });

        // // Display form data for debugging
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        console.log(formData)
        // alert("Product created successfully!");

        try {
            console.log(url)
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                alert("Product created successfully!");
                resetForm(mainImageFile, additionalImageFiles)
            }
            else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create product");
                alert("Failed to create product!");
            }
        } catch (error) {
            console.log('failed to create a product', error)
            console.error(error);
        }
    });

    // Reset form after submission
    function resetForm(mainImageFile, additionalImageElements) {
        createForm.reset();
        mainImageFile = null;
        additionalImageElements = [];
        document.querySelector(".preview img").src = "https://via.placeholder.com/300";
        document.querySelector(".multiProductImage").innerHTML = "";

    }
    console.log(window.location.pathname)
    if (window.location.pathname === '/admin/dashboard/product-lists') {
        //showProduct func for showing existing product from db
        console.log('done asd')
        showMainProduct();
        let productData = [];
        async function showMainProduct() {
            try {
                const skip = 0; // Example pagination values
                const limit = 10;

                const response = await fetch(`/admin/dashboard/getAllProducts?skip=${skip}&limit=${limit}`, {
                    method: 'GET',
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.data)
                    if (data.data.products && data.data.products.length > 0) {
                        productData.push(...data.data.products);
                        console.log("Products:", productData);
                        console.log("Has More Products:", data.data.hasMore);
                    } else {
                        alert("No products found.");
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Failed to fetch products");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                alert('An error occurred while fetching products from the server. Please try again.');
            }
            const tableBody = document.querySelector('.product-list-data');
            tableBody.innerHTML = productData.map((product, index) => `
  <tr data-index="${index}">
    <td>${product.TagId || index + 1}</td>
    <td><img src="${product.image || 'placeholder.jpg'}" alt="${product.name}" class="product-image" /></td>
    <td>${product.name}</td>
    <td>${product.CategoryTagId}</td>
    <td>${product.subCategoryTagId || 'N/A'}</td>
    <td>${product.gender}</td>
    <td>${product.price}</td>
    <td>${product.countInStock}</td>
    <td>${product.variants?.size?.join(', ') || 'N/A'}</td>
    <td>${product.variants?.color?.join(', ') || 'N/A'}</td>
    <td><button class="update-btn">Edit</button></td>
<td>
<button class="view-btn">View</button>
<button class="delete-btn">Delete</button>
</td>
</tr>
`).join('');
        }
        let productDataObject;
        const updateBtns = document.querySelectorAll('.product-list-data');
        // console.log(updateBtns)
        updateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('his')
                const clickedRowOfProduct = e.target.closest('tr');
                if (e.target.classList.contains('update-btn')) {


                    if (clickedRowOfProduct) {
                        console.log(clickedRowOfProduct)
                        // Find the product in the productData array using the tagId
                        const productToEdit = productData.find(product => product.TagId === clickedRowOfProduct.querySelector('td:nth-child(1)').textContent);
                        console.log(productToEdit)
                        if (productToEdit) {
                            console.log('Product found:', productToEdit);
                            // Perform actions with the found product
                        } else {
                            console.log('Product not found');
                        }
                        // console.log('Product Data:', productDataObject);
                        ProductEditAction(productToEdit)
                    }
                    else {
                        alert('Please select a product to edit')
                    }
                }
                if (e.target.classList.contains('view-btn')) {
                    if (clickedRowOfProduct) {
                        const productToView = productData.find(product => product.TagId === clickedRowOfProduct.querySelector
                            ('td:nth-child(1)').textContent);
                        if (productToView) {
                            console.log('Product found:', productToView);
                            // Perform actions with the found product
                            ProductViewAction(productToView)
                        } else {
                            console.log('Product not found');
                        }
                    }
                }
                if (e.target.classList.contains('delete-btn')) {
                    if (clickedRowOfProduct) {
                        const productToDelete = productData.find(product => product.TagId === clickedRowOfProduct.querySelector
                            ('td:nth-child(1)').textContent);
                        if (productToDelete) {
                            console.log('Product found:', productToDelete._id);
                            // Perform actions with the found product
                            ProductDeleteAction(productToDelete)
                        } else {
                            console.log('Product not found');
                        }
                    }
                }
            });
        });

        function ProductEditAction(productData) {
            console.log('Edit button clicked', productData);
            if (!document.querySelector(".create-form")) {
                console.error('SubCategory form not found!');
            }
            const createContainer = document.querySelector('.create-container')

            // document.querySelector("#edit-product").appendChild(createContainer);
            document.querySelector("#create-product").style.display = 'flex'
            const createProductSection = document.querySelector(".create-container");
            createProductSection.style.position = "absolute";
            createProductSection.style.position = 'abso'
            createProductSection.style.top = "90px";
            createProductSection.style.left = "50px";
            // Assign values to the form fields
            createForm.productName.value = productData.name;
            createForm.TagId.value = productData.TagId;
            const categoryOption = Array.from(createForm.category.options).find(option => option.value === productData.CategoryName);
            if (categoryOption) {
                categoryOption.selected = true;
                // Trigger change event to populate subcategories
                const event = new Event('change');
                createForm.category.dispatchEvent(event);
            }
            // Set selected subcategory
            const subCategoryOption = Array.from(createForm.subCategory.options).find(option => option.value === productData.subCategoryName);
            if (subCategoryOption) {
                subCategoryOption.selected = true;
            }

            createForm.gender.value = productData.gender;

            // createForm.price.value = productData.price;
            // createForm.stock.value = productData.countInStock;
            createForm.description.value = productData.description;
            console.log(productData.discount)
            createForm.discount.value = productData.discount || 0;
            // Set selected sizes
            selectedSizes = productData.variants.size || [];
            document.querySelectorAll(".sizes span").forEach((sizeSpan) => {
                if (selectedSizes.includes(sizeSpan.textContent)) {
                    sizeSpan.classList.add("selected");
                } else {
                    sizeSpan.classList.remove("selected");
                }
            });
            /////////////////////////
            // Set selected colors
            selectedColors = (productData.variants && productData.variants.color) || [];
            document.querySelectorAll(".colors span").forEach((colorSpan) => {
                if (selectedColors.includes(colorSpan.textContent)) {
                    colorSpan.classList.add("selected");
                } else {
                    colorSpan.classList.remove("selected");
                }
            });
            /////////////////////////////////////



            // Set main image preview
            const mainImagePreview = document.querySelector(".preview img");
            if (productData.image) {
                mainImagePreview.src = productData.image;
                document.querySelector('#image-upload').removeAttribute('required')
            } else {
                mainImagePreview.src = "https://via.placeholder.com/300"; // Placeholder image
            }

            // Set additional images preview (if any)
            const additionalImagesPreview = document.querySelector(".multiProductImage");
            additionalImagesPreview.innerHTML = "";
            if (productData && productData.images) {
                productData.images.forEach((image) => {
                    const img = document.createElement("img");
                    img.src = image;
                    img.style.width = "60px";
                    img.style.marginRight = "5px";
                    additionalImagesPreview.appendChild(img);
                });
                // document.querySelector('#image-uploads').removeAttribute('multiple');
                document.querySelector('#image-uploads').removeAttribute('required');
            }
            document.querySelector('#ProductformMode').value = 'edit'
            const customFieldsContainer = document.getElementById('custom-fields-container');
            const addCustomFieldButton = document.getElementById('add-custom-field');
            const numberOfKeys = Object.keys(productData.productDetails).length;
            console.log(productData.productDetails, numberOfKeys)
            // Function to create multiple custom fields
            function createMultipleCustomFields(count) {
                for (let i = 0; i < count; i++) {
                    createCustomField(productData.productDetails); // Create the specified number of custom fields
                }
            }

            // Create 5 custom fields when the page loads
            createMultipleCustomFields(1); // Call the function to create 5 custom fields



        }

        function ProductViewAction(productToView) {
            console.log(productToView)
            const createContainer = document.querySelector('.create-container')

            // document.querySelector("#edit-product").appendChild(createContainer);
            document.querySelector("#create-product").style.display = 'flex'


            const createProductSection = document.querySelector(".create-container");
            createProductSection.style.position = "absolute";
            createProductSection.style.position = 'abso'
            createProductSection.style.top = "90px";
            createProductSection.style.left = "50px";
            // Assign values to the form fields
            createForm.productName.value = productToView.name;
            createForm.TagId.value = productToView.TagId;
            const categoryOption = Array.from(createForm.category.options).find(option => option.value === productToView.CategoryName);
            if (categoryOption) {
                categoryOption.selected = true;
                // Trigger change event to populate subcategories
                const event = new Event('change');
                createForm.category.dispatchEvent(event);
            }
            // Set selected subcategory
            const subCategoryOption = Array.from(createForm.subCategory.options).find(option => option.value === productToView.subCategoryName);
            if (subCategoryOption) {
                subCategoryOption.selected = true;
            }

            createForm.gender.value = productToView.gender;

            createForm.price.value = productToView.price;
            createForm.stock.value = productToView.countInStock;
            createForm.description.value = productToView.description;
            console.log(productToView.discount)
            createForm.discount.value = productToView.discount || 0;
            // Set selected sizes
            selectedSizes = productToView.variants.size || [];
            document.querySelectorAll(".sizes span").forEach((sizeSpan) => {
                if (selectedSizes.includes(sizeSpan.textContent)) {
                    sizeSpan.classList.add("selected");
                } else {
                    sizeSpan.classList.remove("selected");
                }
            });
            /////////////////////////
            // Set selected colors
            selectedColors = (productToView.variants && productToView.variants.color) || [];
            document.querySelectorAll(".colors span").forEach((colorSpan) => {
                if (selectedColors.includes(colorSpan.textContent)) {
                    colorSpan.classList.add("selected");
                } else {
                    colorSpan.classList.remove("selected");
                }
            });
            /////////////////////////////////////



            // Set main image preview
            const mainImagePreview = document.querySelector(".preview img");
            if (productToView.image) {
                mainImagePreview.src = productToView.image;
                document.querySelector('#image-upload').removeAttribute('required')
            } else {
                mainImagePreview.src = "https://via.placeholder.com/300"; // Placeholder image
            }

            // Set additional images preview (if any)
            const additionalImagesPreview = document.querySelector(".multiProductImage");
            additionalImagesPreview.innerHTML = "";
            if (productToView && productToView.images) {
                productToView.images.forEach((image) => {
                    const img = document.createElement("img");
                    img.src = image;
                    img.style.width = "60px";
                    img.style.marginRight = "5px";
                    additionalImagesPreview.appendChild(img);
                });
                // document.querySelector('#image-uploads').removeAttribute('multiple');
                document.querySelector('#image-uploads').removeAttribute('required');
            }
            document.querySelector('#ProductformMode').value = 'edit'
            const customFieldsContainer = document.getElementById('custom-fields-container');
            const addCustomFieldButton = document.getElementById('add-custom-field');
            const numberOfKeys = Object.keys(productToView.productDetails).length;
            console.log(productToView.productDetails, numberOfKeys)
            // Function to create multiple custom fields
            function createMultipleCustomFields(count) {
                for (let i = 0; i < count; i++) {
                    createCustomField(productToView.productDetails); // Create the specified number of custom fields
                }
            }

            // Create 5 custom fields when the page loads
            createMultipleCustomFields(1); // Call the function to create 5 custom fields

            // Select the form element
            const form = document.querySelector('#create-product .create-form');

            // Apply readonly to all text-based input elements and textarea
            form.querySelectorAll('input:not([type="file"]):not([type="hidden"]), textarea')
                .forEach(element => {
                    element.readOnly = true;
                });

            // Optionally, disable select elements
            form.querySelectorAll('select')
                .forEach(select => {
                    select.disabled = true;
                });

            // Disable the custom button for adding fields
            document.getElementById('add-custom-field').disabled = true;

            // Disable size and color selection
            form.querySelectorAll('.sizes span, .colors span')
                .forEach(element => {
                    element.style.pointerEvents = 'none'; // Disable clicks
                    element.style.opacity = '0.5';        // Visual indication of non-editable state
                });

            // Disable the image upload inputs
            form.querySelectorAll('input[type="file"]')
                .forEach(fileInput => {
                    fileInput.disabled = true;
                });
        }

        async function ProductDeleteAction(productToDelete) {
            const productId = productToDelete._id
            const response = await fetch(`/admin/dashboard/deleteproduct/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                console.log('Product deleted successfully');
                alert('Product deleted successfully')
                window.location.reload();
            } else {
                console.log('Error deleting product');
                alert('Error deleting product')
            }
        }
    }

}
export { productfunction }