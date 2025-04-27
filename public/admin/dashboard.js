$(function () {
    $(".navSection").load("/header");
});
import { categoryfunction } from "./category.js";
import { productfunction } from "./products.js";
// Define routes for the admin dashboard
const routes = {
    "/admin/dashboard/product-lists": "product-list",
    "/admin/dashboard/product-edit": "edit-product",
    "/admin/dashboard/product-create": "create-product",
    "/admin/dashboard/category-lists": "category-list",
    "/admin/dashboard/category-edit": "edit-category",
    "/admin/dashboard/category-create": "create-category"
};

// ✅ Show the correct section after page reload
async function showActiveSection() {
    const path = window.location.pathname;
    const sectionId = routes[path] || "not-found";

    // Hide all sections
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    // Show the target section
    // document.getElementById(sectionId)?.classList.add("active");
    // Show the target section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add("active");
        console.log(`Showing section: ${sectionId}`); // Log the active section ID
        if (sectionId === 'product-list') {
            console.log('this is a main clue to execute a product list funcs')
            productfunction();
        }
        else if (sectionId === 'create-product') {
            productfunction();
        }
        else if (sectionId === 'category-list') {
            console.log('this is a main clue to execute a maincaetgory funcs')
            // showMainCategory();
            categoryfunction()
        }
        else if (sectionId === 'create-category') {
            console.log('this is a main clue to execute a create category funcs')
            document.querySelector("#create-category").style.display = "block";
            document.querySelector("#create-category .main-content").style.display = "block";
            document.querySelector("#create-category .main-content .section").style.display = "block";
            document.querySelector("#create-category .main-content #createCategoryForm .section").style.display = "block";
            categoryfunction()
        }
    } else {
        console.error(`Section not found for path: ${path}`); // Log an error if the section is not found
    }
}

// ✅ Navigate & Reload Page on Click
document.addEventListener("click", (e) => {
    if (e.target.closest(".nav-link")) {
        e.preventDefault();
        window.location.href = e.target.closest(".nav-link").dataset.route;
    }
});

// ✅ Run on page load to show correct section
document.addEventListener("DOMContentLoaded", showActiveSection);

// function categoryfunction() {

//     let selected_Category_value = {};// Declare selected_Category_value as an object
//     let mainCatTagId
//     showMainCategory()
//     //main category shows with name and tagId
//     async function showMainCategory() {
//         // creating var to category data
//         const categoriesData = [];
//         // console.log(categoriesData)
//         if (window.location.pathname === '/admin/dashboard/category-lists') {
//             try {
//                 const response = await fetch('/admin/dashboard/getallcategory', {
//                     method: 'GET',
//                 });
//                 if (response.ok) {
//                     const categories = await response.json();
//                     console.log('Categories:', categories.data);
//                     categoriesData.push(...categories.data)
//                 } else {
//                     console.error('Failed to fetch categories');
//                 }
//             } catch (error) {
//                 console.error(error);
//             }
//         }

//         // console.log(categoriesData)
//         let div;
//         const categoriesContainer = document.querySelector('.categories-container')
//         categoriesContainer.innerHTML = '';

//         categoriesData.map((category, index) => {
//             //step1 : create a div element
//             div = document.createElement('div')
//             div.classList.add('category-box')
//             div.innerHTML = ''
//             console.log('index', index)
//             div.setAttribute('data-category', index)
//             div.innerHTML = `
//             <img src=${category.CategoryThumbnail} alt='Main Category' >
//             <p>${category.name}</p>
//             <p>${category.TagId}</p>
//              `
//             // console.log(category[0])
//             //step2 : append the div element to the categories-container
//             if (categoriesContainer) {
//                 categoriesContainer.appendChild(div)
//             }
//             else {
//                 console.log('categories-container element not found')
//             }
//             console.log('category of sub cat', category.subCategories)
//         })

//         const categoryBoxes = document.querySelectorAll(".category-box");
//         const subcategoryContainer = document.getElementById("subcategory-container");
//         const subcategoryList = document.getElementById("subcategory-list");
//         let selectedCategory;
//         categoryBoxes.forEach((box, index) => {
//             box.addEventListener("click", () => {
//                 console.log('clicked', index)
//                 console.log('box is', box.querySelector('p ~p').textContent)
//                 mainCatTagId = box.querySelector('p ~p').textContent
//                 console.log(mainCatTagId)
//                 selectedCategory = categoriesData[index];
//                 subcategoryContainer.style.display = "block";
//                 subcategoryList.innerHTML = "";
//                 // console.log(selected_Category_value)
//                 console.log("subCategory", selectedCategory)

//                 selectedCategory.subCategories.forEach((subCategory) => {
//                     const row = document.createElement("tr");
//                     // console.log("subCategory", subCategory)
//                     row.innerHTML = `
//             <td>${subCategory.TagId}</td>
//           <td>${subCategory.name}</td>
//           <td>
//           <span class="action-btn edit">Edit</span>
//           <span class="action-btn delete">Delete</span>
//           </td>
//           `;
//                     subcategoryList.appendChild(row);
//                 });

//                 editMainCategory(selectedCategory)
//                 document.querySelector('.deleteCatBtn').style.display = 'flex'
//                 DeleteMainCategory(selectedCategory)
//             });
//             // console.log(selectedCategory)
//         });
//         const createSubCategorybtn = document.querySelector('.createSubCategorybtn')
//         createSubCategorybtn.addEventListener('click', () => {
//             const subCategoryForm = document.querySelector('.subCategoryForm')
//             if (subCategoryForm) {
//                 subCategoryForm.style.display = 'flex'
//                 subCategoryForm.style.color = 'blue'
//                 // document.querySelector('.subCategoryForm').id = 'subCatFormAdd'
//             }
//             console.log(selected_Category_value)
//             // Set the value of the Main Category TagId input
//             document.getElementById("mainCategoryTagId").value = mainCatTagId; // Assuming each category has a 'TagId'
//             console.log('create sub categoryBtn', createSubCategorybtn)
//         })

//         // Close subCategoryForm when clicking outside of it
//         document.addEventListener('click', (event) => {
//             const subCategoryForm = document.querySelector('.subCategoryForm');
//             document.querySelector('.subCategoryForm form .form-buttons .btn-danger').addEventListener('click', (event) => {
//                 console.log('cancel button')
//                 subCategoryForm.style.display = 'none ';
//             })
//         });
//         console.log(mainCatTagId)
//     }
//     // edit main category event
//     function editMainCategory(selectedCategory) {
//         document.querySelector('#category-list span h2 ~ button').addEventListener('click', (e) => {
//             // document.querySelector('#create-category').style.display = 'flex'
//             document.querySelector("#create-category").style.display = "block";
//             document.querySelector("#create-category .main-content").style.display = "block";
//             document.querySelector("#create-category .main-content .section").style.display = "block";
//             document.querySelector("#create-category .main-content #createCategoryForm .section").style.display = "block";
//             document.querySelector("#create-category")
//             const createCategorySection = document.querySelector("#create-category");
//             createCategorySection.style.position = "absolute";
//             createCategorySection.style.top = "100px";
//             createCategorySection.style.zIndex = "1000";
//             console.log('click for edit btn main category', selectedCategory.name)

//             //assigning  a value to the input field of form main category
//             document.getElementById('categoryTitle').value = selectedCategory.name;
//             document.getElementById('createdBy').value = selectedCategory.createdBy;
//             document.getElementById('tagID').value = selectedCategory.TagId;
//             document.getElementById('description').value = selectedCategory.description;

//             // Set thumbnail preview if available
//             if (selectedCategory.CategoryThumbnail) {
//                 const thumbnailContainer = document.querySelector('#categoryThumbnail');
//                 const thumbnailInput = document.querySelector('#thumbnailInput');
//                 thumbnailInput.removeAttribute('required')
//                 document.querySelector('#formMode').value = 'edit';

//                 // const img = document.createElement('img');
//                 // img.src = selectedCategory.CategoryThumbnail;
//                 // img.style.maxWidth = '100%';
//                 // img.style.marginTop = '10px';
//                 // thumbnailContainer.appendChild(img);
//                 thumbnailContainer.src = selectedCategory.CategoryThumbnail;
//                 console.log(thumbnailContainer.src)
//             }

//         })

//         //create category form logic to send data to server and receive response
//         const createCategoryForm = document.querySelector('#createCategoryForm');
//         createCategoryForm.children[0].action = `/admin/dashboard/updatecategory`

//     }

//     //delete main category func
//     async function DeleteMainCategory(data) {
//         console.log('delete btn is clicked', data)
//         document.querySelector('.deleteCatBtn').addEventListener('click', async (e) => {
//             e.preventDefault();
//             const catId = data._id;
//             try {
//                 const response = await fetch('/admin/dashboard/deletecategory', {
//                     method: 'DELETE',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ catId }),
//                 })
//                 if (response.ok) {
//                     const data = await response.json();
//                     console.log('Category deleted successfully!', data);
//                 }
//                 else {
//                     const errorData = await response.json(); // Parse the error response
//                     console.error('Error:', errorData); // Log error details
//                     alert(`Error deleting category: ${errorData.error || 'Unknown error'}`); // Notify
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 alert('An error occurred. Please try again.');
//             }
//         })
//     }

//     const sCb = document.querySelector('#subcategory-list')
//     const subcategoryList = document.getElementById("subcategory-list");
//     subcategoryList.addEventListener("click", (event) => {
//         console.log(sCb)
//         const btn = document.querySelector('#subcategory-list tr ')
//         console.log(btn)
//         //      Find the closest parent <tr> for the clicked element
//         const clickedRow = event.target.closest('tr');

//         if (clickedRow) {
//             // Perform actions based on the clicked element's class
//             if (event.target.classList.contains("edit")) {
//                 console.log(mainCatTagId)
//                 subCategoryEditAction(clickedRow, mainCatTagId);
//                 console.log("Edit button clicked", clickedRow);

//                 // Perform actions for the "Edit" button
//             } else if (event.target.classList.contains("delete")) {
//                 console.log("Delete button clicked", clickedRow);
//                 // Perform actions for the "Delete" button
//                 subCategoryDeleteAction(clickedRow, mainCatTagId);
//             } else {
//                 console.log("Clicked outside buttons but within a row:", clickedRow);
//             }
//         } else {
//             console.log("Clicked outside any row, ignoring...");
//         }
//     });

//     function subCategoryEditAction(clickedRow, mainCatTagId) {
//         console.log('Edit button clicked');

//         // Get the container element and set its display property
//         const subCategoryForm = document.querySelector('.subCategoryForm');

//         // Check if the form is found
//         if (!subCategoryForm) {
//             console.error('SubCategory form not found!');
//             return; // Exit the function if the form is not found
//         }


//         // Set the form's display property to 'flex'
//         subCategoryForm.style.display = 'flex';
//         // console.log(clickedRow.children)
//         // console.log(clickedRow.children[0].innerHTML)
//         // console.log(clickedRow.children[1].innerHTML)
//         // console.log(mainCategoryTagId)
//         document.querySelector('.subCategoryForm form ').subCategoryName.value = clickedRow.children[0].innerHTML
//         document.querySelector('.subCategoryForm form ').tagId.value = clickedRow.children[1].innerHTML
//         document.querySelector('.subCategoryForm form').mainCategoryTagId.value = mainCatTagId
//         console.log(subCategoryForm.children[0].action)
//         const subformMode = document.querySelector('#subformMode').value = 'editSub';
//         console.log(`subformMode is ${subformMode}`);
//     }
//     async function subCategoryDeleteAction(clickedRow, mainCatTagId) {
//         console.log('Delete button clicked');
//         // Get the container element and set its display property
//         const delteData = {};
//         delteData.mainCategoryTagId = mainCatTagId;
//         delteData.subCategoryName = clickedRow.children[1].innerHTML;
//         delteData.tagId = clickedRow.children[0].innerHTML;
//         console.log(delteData);
//         try {
//             const response = await fetch('/admin/dashboard/deletesubcategory', {
//                 method: 'DELETE',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(delteData)
//             })
//             if (response.ok) {
//                 console.log('Data deleted successfully');
//                 const data = await response.json();
//                 console.log(data);
//             }
//             else {
//                 console.log('Failed to delete data');
//                 const errorData = await response.json();
//                 console.log(errorData);
//                 alert(errorData)
//             }
//         } catch (error) {

//         }
//     }

//     // sub category form logic to send data to server and receive response
//     const subCategoryForm = document.querySelector('.subCategoryForm form');
//     // console.log(subCategoryForm)
//     subCategoryForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         let url;
//         if (document.querySelector('#subformMode').value === 'createSub') {
//             url = '/admin/dashboard/createsubcategory'
//         }
//         else if (document.querySelector('#subformMode').value === 'editSub') {
//             url = '/admin/dashboard/editsubcategory'
//         }
//         const formData = {};
//         const subCategoryName = subCategoryForm.subCategoryName.value;
//         // const subCategoryCreatedBy = subCategoryForm.subCategoryCreatedBy.value;
//         const description = subCategoryForm.description.value;
//         const categoryTagId = subCategoryForm.mainCategoryTagId.value;
//         const TagId = subCategoryForm.tagId.value;
//         console.log(TagId)
//         if (categoryTagId && categoryTagId.trim() !== '' && typeof categoryTagId === 'string' && categoryTagId.length > 0) {
//             console.log('Category TagId:', categoryTagId);
//             formData.categoryTagId = categoryTagId;
//         }

//         if (subCategoryName && subCategoryName.trim() !== '' && typeof subCategoryName === 'string' && subCategoryName.length > 0) {
//             console.log('Sub Category Name:', subCategoryName);
//             formData.subCategoryName = subCategoryName;
//         }
//         else {
//             alert('Sub Category name is required.');
//             return;
//         }
//         if (description && description.trim() !== '' && typeof description === 'string' && description.length > 0) {
//             console.log('Description:', description);
//             formData.description = description;
//         }
//         else {
//             alert('Description is required.');
//             return;
//         }
//         if (TagId && TagId.trim() !== '' && typeof TagId === 'string' && TagId.length <= 10) {
//             console.log('TagId:', TagId);
//             formData.TagId = TagId;
//         }
//         else {
//             alert('TagId is required.');
//             return;
//         }
//         console.log('formData', formData)
//         try {
//             console.log(url)
//             console.log('Selected Portion is empty. Adding logs to the entire code file.')
//             const response = await fetch('/admin/dashboard/createsubcategory', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData),
//             })
//             if (response.ok) {
//                 const data = await response.json();
//                 console.log('Sub Category Added Successfully', data);
//                 alert('Sub Category Added Successfully');
//                 // document.querySelector('.subCategoryForm').style.hidden = true
//                 document.querySelector('.subCategoryForm').style.display = 'none'
//             }
//             else {
//                 const data = await response.json();
//                 console.log('Error while adding sub category', data);
//                 alert('Failed to add sub category something went wrong or sub category already exists in db');
//                 // document.querySelector('.subCategoryForm').style.display = 'none'
//                 document.querySelector('.subCategoryForm').style.hidden = true
//                 // document.querySelector('.subCategoryForm').id = 'subCatFormRemove'
//             }

//         } catch (error) {
//             console.error('Error:', error);
//             alert('An error occurred in sub Category form while sending data or receiving data from server . Please try again.');
//         }
//     })

//     const createCategoryBtn = document.querySelector('.createCatBtn')
//     createCategoryBtn.addEventListener('click', () => {
//         window.location.href = 'http://localhost:3000/admin/dashboard/category-create';
//         document.querySelector('#formMode').value = 'create';
//     })

//     // Reset Form Functionality
//     function resetForm() {
//         const form = document.getElementById("createCategoryForm");
//         form.reset();
//         document.getElementById("thumbnailInput").value = "";
//         document.getElementById("categoryThumbnail").src =
//             "https://via.placeholder.com/200x150";
//     }

//     // Thumbnail Preview
//     document.getElementById("thumbnailInput").addEventListener("change", function () {
//         const file = this.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = function (e) {
//                 document.getElementById("categoryThumbnail").src = e.target.result;
//             };
//             reader.readAsDataURL(file);
//         }
//         console.log(file)
//     });

//     //create category form logic to send data to server and receive response
//     const createCategoryForm = document.querySelector('#createCategoryForm');
//     console.log(createCategoryForm)
//     createCategoryForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const formMode = document.querySelector('#formMode').value;
//         console.log(`formMode is ${formMode}`);
//         let url;
//         // Validate form fields
//         const categoryName = createCategoryForm.categoryTitle.value;
//         const createdBy = createCategoryForm.createdBy.value;
//         const description = createCategoryForm.description.value;
//         const TagId = createCategoryForm.tagId.value;
//         // const file = createCategoryForm.get('categoryThumbnail'); // Retrieve the image file from FormData
//         // const fileInput = createCategoryForm.querySelector('input[name="image"]'); // Get the file input element
//         const cat_existing_thumbnail_for_edit = document.querySelector('#categoryThumbnail')
//         console.log(cat_existing_thumbnail_for_edit.src)
//         const fileInput = createCategoryForm.querySelector('#thumbnailInput'); // Get the file input element
//         console.log('fileInput is', fileInput)
//         const formData = new FormData();

//         if (formMode === 'create') {
//             if (fileInput.files[0] !== undefined) {
//                 console.log(fileInput)
//                 const file = fileInput.files[0]; // Retrieve the selected file from the file input
//                 console.log(file)
//                 url = '/admin/dashboard/createcategory'
//                 // Create a FormData object
//                 // thumbnailContainer.children[0].src
//                 // Check if a file is selected
//                 formData.append('image', file)
//                 console.log('Image Selected:', file.name);
//                 console.log('File Name:', file.name);
//                 console.log('File Size:', file.size, 'bytes');
//                 console.log('File Type:', file.type);
//             } else {
//                 // alert('image is required')
//                 console.log(' image is required')
//             }
//         } else if (formMode === 'edit') {
//             if (fileInput.files[0] !== undefined) {
//                 console.log(fileInput)
//                 const file = fileInput.files[0]; // Retrieve the selected file from the file input
//                 console.log(file)
//                 url = '/admin/dashboard/updatecategory'
//                 // Create a FormData object
//                 // thumbnailContainer.children[0].src
//                 // Check if a file is selected
//                 formData.append('image', file)
//                 console.log('Image Selected:', file.name);
//                 console.log('File Name:', file.name);
//                 console.log('File Size:', file.size, 'bytes');
//                 console.log('File Type:', file.type);
//             } else {
//                 alert('image is required')
//                 console.log(' image is required')
//                 url = '/admin/dashboard/updatecategory'
//                 formData.append('image', cat_existing_thumbnail_for_edit.src)
//                 console.log('image is selected from cat_existing_thumbnail_for_edit.src')
//             }
//         }

//         if (categoryName && categoryName.trim() !== '' && typeof categoryName === 'string' && categoryName.length > 0) {
//             formData.append('categoryName', categoryName)
//             console.log("category name is appended into formData object")
//         } else {
//             alert('Category name is required.');
//             return;
//         }

//         if (createdBy && createdBy.trim() !== '' && typeof createdBy === 'string' && createdBy.length > 0) {
//             formData.append('createdBy', createdBy)
//             console.log("createdBy is appended into formData object")
//         }
//         else {
//             alert('Created By is required.');
//             return;
//         }
//         if (description && description.trim() !== '' && typeof description === 'string' && description.length > 0) {
//             formData.append('description', description)
//             console.log("description is appended into formData object")
//         }
//         else {
//             alert('Description is required.');
//             return;
//         }
//         if (TagId && TagId.trim() !== '' && typeof TagId === 'string' && TagId.length > 0) {
//             formData.append('TagId', TagId)
//             console.log("TagId is appended into formData object")
//         }
//         else {
//             alert('TagId is required.');
//             return;
//         }
//         // console.log('formData', formData)
//         // Log formData correctly
//         for (let [key, value] of formData.entries()) {
//             console.log(`${key}:`, value);
//         }

//         try {
//             console.log(url)
//             const response = await fetch(url, {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 console.log(`Category updated successfully!`, data);
//                 // resetForm();
//                 if (data.data) {
//                     // console.log(data.message)
//                     alert(`${data.message}`);
//                     console.log('Category created successfully!');
//                     // resetForm();
//                     // showCategory('category-list')
//                     window.location.href = 'http://localhost:3000/admin/dashboard/category-lists'
//                     console.log(window.location.href)
//                 }
//                 else {
//                     alert('Failed to create category. Please try again.');
//                 }
//             } else {
//                 // alert('Failed to create category. Please try again.');
//                 const errorData = await response.json(); // Parse the error response

//                 console.error('Error:', errorData); // Log error details

//                 alert(`Error uploading image: ${errorData.error || 'Unknown error'}`); // Notify the users
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             alert('An error occurred. Please try again.');
//         }
//     })



// }