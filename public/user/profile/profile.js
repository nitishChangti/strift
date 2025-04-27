$(function () {
  $(".navSection").load("/header");
  $("footer").load("/footer");


  // Store the active section in localStorage to persist between page refreshes
  let activeSection = localStorage.getItem('activeSection') || 'profile'; // Default to 'profile' if nothing is set
  // showContent(activeSection);


});



async function showContent(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => section.classList.remove("active"));

  // Show the selected section
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add("active");

  }
  console.log(sectionId)
  if (sectionId === 'addresses') {

    try {
      const response = await fetch('/profile/fetchAddress',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        });
      if (response.ok) {
        const data = await response.json();
        console.log(data.data.userAddress);
        appendAddress(data.data.userAddress)
      } else {
        console.log('Error fetching data');
      }
    }
    catch (error) {
      console.log(error)
    }
  }
}

// Display the first section by default
document.addEventListener("DOMContentLoaded", (event) => {

  showContent("profile"); // Default to "Profile Information"
  // document.querySelector(".ri-account-circle-fill ul li")
  // console.log('profile')
  event.preventDefault();
  fetchUserDataFromServer()
});

// address
const address = document.querySelector("#adr");
address.addEventListener("click", function () {
  console.log("hello");
  document.querySelector("#adr-form").style.display = "grid";
});

let resDataFromDb;
function appendAddress(resdata) {
  // console.log('resdata of address', resdata[0])
  const addAddress = document.createElement("div");
  addAddress.className = "addlist";

  // Clear existing addresses to avoid duplication
  savedAdr.innerHTML = '';

  // Iterate over the address data array
  resdata.forEach((address, index) => {
    const addAddress = document.createElement("div");
    addAddress.className = "addlist";
    addAddress.innerHTML = `
      <div class="sec-1">
        <span>${address.addressType || 'Home'}</span>
        <span><i class="ri-more-2-fill" onclick="popup(event, ${index})"></i></span>
      </div>
      <div class="sec-2">
        <div class="small-sec">
          <span>${address.name}</span>
          <span>${address.phoneNumber}</span>
        </div>
        <p>${address.address}, ${address.city}, ${address.state}, ${address.pinCode}</p>
      </div>`;
    savedAdr.appendChild(addAddress);
    resDataFromDb = resdata
  });
}


function popup(event, index) {
  // console.log(resdata)
  if (!event || !event.target) {
    console.error("Invalid event object:", event);
    return;
  }

  // Remove any existing popup to avoid duplication
  const existingPopup = document.querySelector(".popup");
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create the popup element
  const popOption = document.createElement("div");
  popOption.className = "popup";
  popOption.innerHTML = `
    <span class="edit-option">Edit</span>
    <span class="delete-option">Delete</span>
  `;

  // // Position the popup near the clicked element
  const rect = event.target.getBoundingClientRect();
  popOption.style.position = "absolute";
  popOption.style.top = `${rect.bottom + window.scrollY}px`;
  popOption.style.left = `${rect.left + window.scrollX}px`;

  //////////////
  // let top = rect.bottom + window.scrollY;
  // let left = rect.left + window.scrollX;

  // Adjust for overflow
  // if (top + 100 > window.innerHeight) top = 20; // Adjust upwards if close to bottom
  // if (left + 150 > window.innerWidth) left = 150; // Adjust leftwards if close to right edge

  // popOption.style.top = `${top}px`;
  // popOption.style.left = `${left}px`;
  //////////////////


  /******** */
  // Edit and Delete event listeners
  popOption.querySelector(".edit-option").addEventListener("click", () => {
    console.log("Edit option clicked");
    // Use the index to prefill the form with the selected address
    // prefillForm(resdata[index]);
    prefillForm(resDataFromDb[index]);
    popOption.remove();
  });
  // cancle()
  popOption.querySelector(".delete-option").addEventListener("click", async () => {
    console.log("Delete option clicked");
    try {
      const res = await fetch(`/profile/deleteAddress?index=${index}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        console.log("Address deleted successfully");
        resDataFromDb.splice(index, 1); // Remove the address from resdata
        appendAddress(resDataFromDb); // Re-render the address list
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
    popOption.remove();
  });

  // Append the popup to the body
  document.body.appendChild(popOption);

  // Close the popup if clicking outside of it
  document.addEventListener("click", function closePopup(e) {
    if (!popOption.contains(e.target) && e.target !== event.target) {
      popOption.remove();
      document.removeEventListener("click", closePopup);
    }
  });
  // *******




  // Append the popup to the body
  // document.body.appendChild(popOption);

  // Add event listeners for Edit and Delete actions
  // popOption.querySelector(".edit-option").addEventListener("click", () => {
  //   console.log("Edit option clicked");
  //   // Handle the edit logic here
  //   popOption.remove();
  // });

  // popOption.querySelector(".delete-option").addEventListener("click", () => {
  //   console.log("Delete option clicked");
  //   // Handle the delete logic here
  //   popOption.remove();
  // });

  // Close the popup if clicking anywhere outside it
  // document.addEventListener("click", function closePopup(e) {
  //   if (!popOption.contains(e.target) && e.target !== event.target) {
  //     popOption.remove();
  //     document.removeEventListener("click", closePopup);
  //   }
  // });


}








const savedAdr = document.querySelector(".adr-show");
if (savedAdr.children.length === 0) {
  // appendAddress();
  console.log("empty");
} else {
  savedAdr.insertBefore(appendAddress(), savedAdr.firstChild);
}

const addressForm = document.querySelector("#adr-form");
addressForm.addEventListener("submit", async function (event) {
  const name = addressForm.name.value;
  const phoneNumber = addressForm.phoneNumber.value;
  const pinCode = addressForm.pinCode.value;
  const locality = addressForm.locality.value;
  const address = addressForm.address.value;
  const city = addressForm.city.value;
  const state = addressForm.state.value;
  const landmark = addressForm.landmark.value;
  const altNumber = addressForm.altNumber.value;
  const addressType = addressForm.querySelector('input[name="addressType"]:checked')?.value;
  if (!addressType) {
    console.error('Please select an address type.');
    return;
  }

  console.log('Selected Address Type:', addressType);

  const data = {};
  console.log("name is", phoneNumber);

  if (name && typeof name === "string" && name.length > 0) {
    console.log("name is valid", name);
    data.name = name;
  }
  if (
    phoneNumber && typeof phoneNumber === "string" &&
    phoneNumber.length >= 10 &&
    phoneNumber != null
  ) {
    console.log("phone number is valid");
    data.phoneNumber = phoneNumber;
  }
  if (pinCode && typeof pinCode === "string" && pinCode.length >= 6 && phoneNumber != null) {
    console.log("pinCode  is valid");
    data.pinCode = pinCode;
  }
  if (locality && typeof locality === "string" && locality.length != 0 && locality != null) {
    console.log("locality is valid");
    data.locality = locality;
  }
  if (address && typeof address === "string" && address.length != 0 && address != null) {
    console.log("Address is valid");
    data.address = address;
  }
  if (city && typeof city === "string" && city.length != 0 && city != null) {
    console.log(" city is valid");
    data.city = city;
  }
  if (state && typeof state === "string" && state.length != 0 && state != null) {
    console.log(" state is valid");
    data.state = state;
  }
  if (landmark && typeof landmark === "string" && landmark.length != 0 && landmark != null) {
    console.log(" landmark is valid");
    data.landmark = landmark;
  }
  if (altNumber && typeof altNumber === "number" && altNumber.length >= 10 && altNumber != null) {
    console.log(" Number is valid");
    data.altNumber = altNumber;
  }
  if (addressType && typeof addressType === "string" && addressType.length != 0 && addressType != null) {
    console.log(" home is valid");
    data.addressType = addressType;
  }
  console.log(data)
  try {
    event.preventDefault()
    const res = await fetch("/account/profile/address", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const resdata = await res.json()
      console.log("Data sent successfully", resdata);
      document.querySelector("#adr-form").style.display = "none";
      // appendAddress(resdata)
      console.log('resdata of address', resdata.data.user.address)
    } else {
    }
  } catch (error) {
    console.error("Error sending data:", error);
  }
});

function cancle() {
  const addressForm = document.querySelector("#adr-form");
  addressForm.style.display = "none";
  console.log('cancel has to be applied')
}

document.querySelector('.cancel-btn').addEventListener('click', (Event) => {
  Event.preventDefault()
  // cancle()
})

function prefillForm(addressData) {
  // Assuming you have form fields like 'name', 'phoneNumber', etc.
  // const addressForm = document.querySelector("#adr-form");
  const addressForm = document.querySelector("#adr-form");

  // Store the original data before editing (for reference)
  originalAddressData = { ...addressData };

  // Prefill the form with address data
  addressForm.name.value = addressData.name || '';
  addressForm.phoneNumber.value = addressData.phoneNumber || '';
  addressForm.pinCode.value = addressData.pinCode || '';
  addressForm.locality.value = addressData.locality || '';
  addressForm.address.value = addressData.address || '';
  addressForm.city.value = addressData.city || '';
  addressForm.state.value = addressData.state || '';
  addressForm.landmark.value = addressData.landmark || '';
  addressForm.altNumber.value = addressData.altNumber || '';

  // Set the selected address type (assuming you have radio buttons for addressType)
  if (addressData.addressType) {
    const addressTypeRadio = addressForm.querySelector(`input[name="addressType"][value="${addressData.addressType}"]`);
    if (addressTypeRadio) {
      addressTypeRadio.checked = true;
    }
  }
  // Optionally, you can make the form visible for editing if hidden
  addressForm.style.display = "grid";
}















//profile section frontend code
// Get the elements for Personal Information
const editPersonalInfo = document.getElementById('editPersonalInfo');
const savePersonalInfo = document.getElementById('savePersonalInfo');
const input1 = document.getElementById('input1');
const input2 = document.getElementById('input2');

// Gender radio buttons
const genderMale = document.getElementById('genderMale');
const genderFemale = document.getElementById('genderFemale');



// Add event listener for the "Edit" button
editPersonalInfo.addEventListener('click', () => {
  // Enable the inputs
  input1.disabled = false;
  input2.disabled = false;

  // Enable gender selection
  genderMale.disabled = false;
  genderFemale.disabled = false;

  // Show the Save button
  savePersonalInfo.style.display = 'inline';

  // Hide the Edit button
  editPersonalInfo.style.display = 'none';
});

// Add event listener for the "Save" button
savePersonalInfo.addEventListener('click', (event) => {
  event.preventDefault()
  // Disable the inputs
  input1.disabled = true;
  input2.disabled = true;

  // Disable gender selection
  genderMale.disabled = true;
  genderFemale.disabled = true;

  // Hide the Save button
  savePersonalInfo.style.display = 'none';

  // Show the Edit button
  editPersonalInfo.style.display = 'inline';

  const personalInfo = document.querySelector('#profile h2 ~ form')
  console.log(personalInfo)

  const firstName = personalInfo.firstName.value;
  const lastName = personalInfo.lastName.value;
  const gender = personalInfo.gender.value;
  console.log(firstName, lastName, gender)

  const data = {}
  if (firstName && typeof firstName === 'string' && firstName.length > 0) data.firstName = firstName
  if (lastName && typeof lastName === 'string' && lastName.length > 0) data.lastName = lastName
  if (gender && typeof gender === 'string' && gender.length > 0) data.gender = gender
  console.log(data)
  profileFetchInformation(data)
});


async function profileFetchInformation(data) {
  try {
    const response = await fetch('/account/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (response.ok) {
      const result = await response.json()
      console.log(result)
    }
    else {
      console.log('response error in personal information', Error)
    }
  } catch (error) {
    console.error(error);
  }
}


// Get the elements for Email Address
const editEmail = document.querySelector('.edit_Email');
const saveEmail = document.getElementById('saveEmail');
const emailInput = document.getElementById('emailInput');

// Add event listener for the "Edit" button in Email Address
editEmail.addEventListener('click', () => {
  // Enable the email input
  emailInput.readOnly = false;

  // Show the Save button
  saveEmail.style.display = 'inline';

  // Hide the Edit button
  editEmail.style.display = 'none';
});

// Add event listener for the "Save" button in Email Address
saveEmail.addEventListener('click', (event) => {
  event.preventDefault();
  // Disable the email input
  emailInput.readOnly = true;

  // Hide the Save button
  saveEmail.style.display = 'none';

  // Show the Edit button
  editEmail.style.display = 'inline';

  const emailInfo = document.querySelector('#email_sec ~ form')
  const email = emailInfo.emailAddress.value;
  console.log(emailInfo, email)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    alert('Invalid email address');
    console.log('invalid email')
    document.getElementById('statusMessage').innerHTML = `<p style="color: red;">Invalid email format. Please use "username@gmail.com".</p>`;
    return;
  }
  const data = {}
  data.email = email
  console.log('email is valid')
  profileFetchInformation(data)
});

// Mobile Number Elements
const editMobile = document.querySelector('.Number_sec #edit');
const saveMobile = document.getElementById('save_Mobile');
const mobileInput = document.getElementById('mobileInput');

// Mobile Number Logic
editMobile.addEventListener('click', () => {
  mobileInput.readOnly = false; // Make the field editable
  saveMobile.style.display = 'inline'; // Show Save button
  editMobile.style.display = 'none'; // Hide Edit button
});

console.log(saveMobile)
saveMobile.addEventListener('click', (event) => {
  event.preventDefault();
  mobileInput.readOnly = true; // Make the field uneditable
  saveMobile.style.display = 'none'; // Hide Save button
  editMobile.style.display = 'inline'; // Show Edit button

  const mobileInfo = document.querySelector('.Number_sec ~ form')
  console.log(mobileInfo)
  const phone = "+" + mobileInfo.mobileNumber.value;
  console.log(phone)
  const data = {}
  // Validate mobile number format
  const mobileRegex = /^\+\d{1,3}\d{10}$/ // Must start with 6-9 and have exactly 10 digits
  if (!mobileRegex.test(phone)) {
    alert('Invalid mobile number');
    document.getElementById('statusMessage').innerHTML = `<p style="color: red;">Invalid mobile number. It must start with 6-9 and be exactly 10 digits long.</p>`;
    return;
  }
  data.phone = phone
  profileFetchInformation(data)// Fetch profile information with the new mobile number
});

// document.querySelector('#profile').addEventListener('click', async (Event) => {
// Event.preventDefault();
async function fetchUserDataFromServer() {
  try {
    const response = await fetch('/account/profile/userData', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json();
      console.log('fetched the user data from ', data.data.user)
      if (data.data.user.email) {
        console.log('exists')
        document.querySelector('#email_sec ~ form').emailAddress.value = data.data.user.email
      }
      if (data.data.user.
        phone) {
        const mobileNumber = String(data.data.user.phone)
        console.log('exists', data.data.user.phone, mobileNumber)
        document.querySelector('.Number_sec ~ form').mobileNumber.value = mobileNumber
      }
      const addressType = data.data.user.gender;
      console.log(addressType)
      const radioButton = document.querySelector(`input[name="gender"][value="${addressType}"]`);
      console.log(radioButton)


      if (data.data.user.
        gender
      ) {
        console.log('exists')
        radioButton.checked = true; // Set the radio button as checked
        console.log(`${addressType} radio button selected.`);
      }

      if (data.data.user.firstName) {
        console.log('exists')
        document.querySelector('#profile h2 ~ form').firstName.value = data.data.user.firstName
      }
      if (data.data.user.lastName) {
        console.log('exists')
        document.querySelector('#profile h2 ~ form').lastName.value = data.data.user.lastName
      }


    }
  } catch (error) {
    console.error(error)
  }
}
// })