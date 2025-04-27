$(function () {
    $('.navbar').load('/header1.html')
    // $('.navbar').load('header.html')

})


const intlTelInputConfig = {
    initialCountry: 'in', // Set default country code as India
    preferredCountries: ['us', 'gb', 'ca'],
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
    separateDialCode: true,
}
const countryCodeInput = document.querySelector('#country-code');
const login_section1 = document.querySelector('.login_page .section1')
const register_section1 = document.querySelector('.register .section1')
if (login_section1.style.display === "") {
    console.log('success')
    const input = document.querySelector('#phone');
    intlTelInput(input, intlTelInputConfig)
    input.addEventListener('countrychange', function () {
        const countryCode = input.getSelectedCountryData().dialCode;
        countryCodeInput.value = '+' + countryCode;
        // console.log(countryCodeInput)
    });
}
if (register_section1.style.display === "") {
    console.log('success');
    const input = document.querySelector('#phone1');
    intlTelInput(input, intlTelInputConfig);

    input.addEventListener('countrychange', function () {
        const countryCode = input.getSelectedCountryData().dialCode;
        countryCodeInput.value = '+' + countryCode;
    });

    // Add an event listener to restrict input to numbers and limit to 10 characters
    input.addEventListener('input', function (event) {
        // Remove any non-numeric characters
        let sanitizedValue = event.target.value.replace(/\D/g, '');

        // Limit the input to 10 characters
        if (sanitizedValue.length > 10) {
            sanitizedValue = sanitizedValue.slice(0, 10);
        }

        // Update the input value
        event.target.value = sanitizedValue;
    });
}


const urlParams = new URLSearchParams(window.location.search);
const signup = urlParams.get('signup');
const login = urlParams.get('ret');
console.log(signup, login, urlParams)

if (signup === 'true') {
    document.querySelector('.login_page').style.display = 'none'
    document.querySelector('.register').style.display = 'flex'
}
else {
    document.querySelector('.login_page').style.display = 'flex'
    document.querySelector('.register').style.display = 'none'

}


//navbar hamburgar animation
window.onload = function () {
    var menuButton = document.querySelector('.menuButton');
    var resNavbar = document.querySelector('.res_navbar');

    menuButton.addEventListener('click', function () {
        resNavbar.classList.toggle('fade-in');
    })
}


const inputField = document.querySelector('.login_page .section2 form input[type="tel"]');
const labelElement = document.querySelector('.login_page  .section2 form label');



const newToStriftClick = document.querySelector('.login_page .section2 form+a');
newToStriftClick.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelector('.login_page').style.display = 'none';
    document.querySelector('.register').style.display = 'flex'
})
const requestOTP = document.querySelector('.login_page .section2 form ')
const requestOTP1 = document.querySelector('.login_page .section2  ')
const verifyOTP = document.querySelector('.login_page .otp_verify')
let storedMobileNumber;
const mobileNumber = document.querySelector('.otp_verify .otp_section_1 span a')
const Verification_code_sent = document.querySelector('.Verification_code_sent')

//////////////////
requestOTP.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const mobileNumber = requestOTP.mobileNumber.value;
    const countryCode = document.querySelector('.iti__selected-dial-code').textContent.trim();
    const correctMobileNumber = countryCode + mobileNumber;

    // Validate the phone number format
    const phonePattern = new RegExp(`^\\${countryCode}\\d{10,}$`);
    if (!phonePattern.test(correctMobileNumber)) {
        alert('Phone number is not valid')
        console.log("Phone number is not valid");
        document.querySelector('.error-message').textContent = 'Invalid phone number format.';
        return;
    }

    console.log('Mobile number is valid:', correctMobileNumber);

    // Show OTP verification section
    requestOTP1.style.display = 'none';
    verifyOTP.style.display = 'flex';

    // Display popup notification
    const maskedNumber = `${countryCode}****${mobileNumber.slice(-4)}`;
    document.querySelector('.Verification_code_sent span~ h1').innerHTML = `Verification code sent to ${maskedNumber}`;
    Verification_code_sent.style.display = 'flex';
    setTimeout(() => {
        Verification_code_sent.style.display = 'none';
    }, 3000);

    // Start countdown timer
    startCountdownTimer(60);

    try {
        const response = await fetch('/account/login?ret=/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: correctMobileNumber }),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);

            if (responseData.redirect) {
                alert('User does not have an account with this mobile number.');
                window.location.href = responseData.redirect;
            } else {
                console.log('Login successful');
            }
        } else {
            const responseData = await response.json();
            console.log('Error:', responseData.message);
            document.querySelector('.error-message').textContent = responseData.message || 'An error occurred.';
        }
    } catch (error) {
        console.error('Error registering user:', error);
        document.querySelector('.error-message').textContent = 'Failed to send OTP. Please try again.';
    }
});

////////////////


const loginOtpVerify = document.querySelector('.otp_verify .otp_section_1~ form')

loginOtpVerify.addEventListener('submit', async (e) => {
    loginOtpVerify.OTP_Number_One.value
    loginOtpVerify.OTP_Number_Two.value
    loginOtpVerify.OTP_Number_Three.value
    loginOtpVerify.OTP_Number_Four.value
    loginOtpVerify.OTP_Number_Five.value
    loginOtpVerify.OTP_Number_Six.value

    const otp = `${loginOtpVerify.OTP_Number_One.value
        }${loginOtpVerify.OTP_Number_Two.value
        }${loginOtpVerify.OTP_Number_Three.value
        }${loginOtpVerify.OTP_Number_Four.value
        }${loginOtpVerify.OTP_Number_Five.value
        }${loginOtpVerify.OTP_Number_Six.value
        }`
    const currentTime = new Date()
    const formattedCurrentTime = currentTime.toISOString().replace('Z', '+00:00');
    console.log(otp, formattedCurrentTime)
    if (otp.length === 6 && otp !== '' && !isNaN(otp)) {
        console.log('OTP is valid');
        try {
            e.preventDefault()
            const response = await fetch('/account/login?ret=/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp: otp, currentTime: currentTime })
            });
            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData)
                console.log(responseData.data.redirect)
                // console.log('login successful')
                // alert('Login Successful!')
                // ✅ Check if cart exists in LocalStorage
                let cart = JSON.parse(localStorage.getItem('cart')) || [];

                if (cart.length > 0) {
                    // ✅ Sync Cart to DB before saving user info
                    await syncCartToDatabase(responseData.userId);
                }
                // ✅ Save user info to LocalStorage
                if (responseData.data.redirect) {
                    localStorage.setItem('isLoggedIn', true);
                    // ✅ Sync LocalStorage Cart to Database
                    await syncCartToDatabase();
                    window.location.href = responseData.data.redirect;
                    // window.history.replaceState({}, '', '/');
                    // window.history.forward();
                } else {
                    console.error('Invalid OTP');
                }

            }
            else {
                const responseData = await response.json()
                const errmessage = responseData.message;
                console.log(responseData, errmessage)
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }
    else {
        console.log('OTP is invalid');
    }
})
///
// ✅ Function to Sync Cart to Database (Without userId)
async function syncCartToDatabase() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('cart exists in localstorage', cart)
    if (cart.length > 0) {
        try {

            const response = await fetch('/sync-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // credentials: 'include', // 🔥 Ensures authentication token is sent with the request
                body: JSON.stringify({ cart }),
            });
            if (response.ok) {
                const resData = await response.json();
                console.log('cart synced to database', resData)
                // ✅ Clear LocalStorage Cart After Sync
                localStorage.removeItem('cart');
                window.location.pathname = '/viewcart';
            }
            else {
                const errData = await response.json(); // 🔥 Handle error response
                console.error('Error syncing cart to database:', errData);
            }
        }
        catch (error) {
            console.error('Error syncing cart to database:', error);
        }
    }
}
// //
const changeNumber = document.querySelector(".otp_verify .otp_section_1  a")

// user entered number and requested for otp.otp verification is showed but he want to change  his number for that this is
changeNumber.addEventListener('click', async (event) => {
    event.preventDefault()
    //if it is true it comes back to login otp request page and to change number
    if (event.type == 'click') {
        requestOTP1.style.display = 'flex'
        verifyOTP.style.display = 'none'
        mobileNumber.value = storedMobileNumber

        document.querySelector('.login_page .section2 form+a').classList.add('fix')
    }
})

const loignResendOTP = document.querySelector('.otp_verify  form+span p a')
let isTimerRunning = false;

//if didn't receive otp or otp has timeouted for that user can  request for otp resend
loignResendOTP.addEventListener('click', async (event) => {
    // event.preventDefault()
    // Start 15-second countdown timer
    if (!isTimerRunning) {
        await startCountdownTimer(60);
        const currentTime = new Date()
        console.log(currentTime)
        try {
            event.preventDefault()
            const response = await fetch('/account/login/resend-Otp', {
                method: 'POST',
                headers: {
                    'content-Type': 'application/json'
                },
                body: JSON.stringify({ currentTime: currentTime })
            })
            if (response.ok) {
                console.log('OTP resent successfully')
                const responseData = await response.json()
            }
            else {
                console.error('Error resending OTP:', response.status)
            }

        } catch (error) {
            console.error('Error resending OTP:', error)
        }
    }
});


async function startCountdownTimer(seconds) {
    isTimerRunning = true;
    // resendOTP.disabled = true;
    // const countdownTimerElement = document.querySelector('#countdown-timer');
    let intervalId;

    // Set initial countdown timer value
    // countdownTimerElement.textContent = `00:${seconds.toString().padStart(2, '0')}`;
    loignResendOTP.textContent = `00:${seconds.toString().padStart(2, '0')}`;

    // Start countdown timer
    intervalId = setInterval(async () => {
        seconds--;
        if (seconds < 0) {
            clearInterval(intervalId);
            loignResendOTP.textContent = 'Resend OTP';
            loignResendOTP.disabled = false;
            isTimerRunning = false;
        } else {
            // resendOTP.textContent = '';
            loignResendOTP.textContent = `00:${seconds.toString().padStart(2, '0')}`;
            loignResendOTP.disabled = true;

        }
    }, 1000);
}
//
async function startCountdownTimerReg(seconds) {
    isTimerRunning = true;

    // Disable the button immediately when the timer starts
    registerOtpResend.disabled = true;

    // const countdownTimerElement = document.querySelector('#countdown-timer');
    let intervalId;

    // Set initial countdown timer value
    // countdownTimerElement.textContent = `00:${seconds.toString().padStart(2, '0')}`;
    registerOtpResend.textContent = `00:${seconds.toString().padStart(2, '0')}`;

    // Start countdown timer
    intervalId = setInterval(async () => {
        seconds--;
        if (seconds < 0) {
            clearInterval(intervalId);
            registerOtpResend.textContent = 'Resend OTP';
            registerOtpResend.disabled = false;
            isTimerRunning = false;

        } else {
            // resendOTP.textContent = '';
            registerOtpResend.textContent = `00:${seconds.toString().padStart(2, '0')}`;
            registerOtpResend.disabled = true;


        }
    }, 1000);
}

//
const otp_input_move_next_input = document.querySelectorAll('.otp_verify form span input')
otp_input_move_next_input.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === 1) {
            if (index < otp_input_move_next_input.length - 1) {
                otp_input_move_next_input[index + 1].focus();
            }
        }
    });
});

document.querySelector('.login_page .section2 form ~ a').addEventListener('click', (event) => {

    window.location.href = '/account?signup=true';
})

const registerInputField = document.querySelector('.register .section2 form input[type="tel"]');
const registerlabelElement = document.querySelector('.register .section2  form label');



const registerRequestOtp = document.querySelector('.register .section2 form ');
const registerRequestOtp1 = document.querySelector('.register .section3 form ');
const registerOtpResend = document.querySelector('.register .section3 .otp-notification .anchor')

registerRequestOtp.addEventListener('submit', async (event) => {
    event.preventDefault();
    startCountdownTimerReg(60);
    const mobileNumber = registerRequestOtp.mobileNumber.value
    const countryCode = document.querySelector('.iti__selected-dial-code').textContent
    console.log(countryCode, mobileNumber)
    const correctMobileNumber = countryCode + mobileNumber
    console.log(correctMobileNumber)
    // mobileNumber = document.getElementById('phone1').value;
    // Display the entered mobile number in the next section
    document.querySelector('.register .section3 .form1 input').value = correctMobileNumber;
    document.querySelector('.register .section2 form div input').value = correctMobileNumber;
    // Make the input field readonly
    document.querySelector('.register .section3  .form1 input').readOnly = true;

    const phonePattern = new RegExp(`^\\${countryCode}\\d{10,}$`);
    //hiding a register section2 if it is true  and  showing a otp_verify
    if (event.type === 'submit') {
        console.log('success')
        if (phonePattern.test(correctMobileNumber)) {

            document.querySelector('.register .section2').style.display = 'none'
            document.querySelector('.register .section3').style.display = 'block'
        }
    }
    else {
        document.querySelector('.register .section2').style.display = 'flex'
        document.querySelector('.register .section3').style.display = 'none'
    }

    if (phonePattern.test(correctMobileNumber)) {
        console.log('mobile number is valid')
        try {
            const response = await fetch('/account/register?signup=true', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone: correctMobileNumber })
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData)
                // console.log('registration is successful')
                // alert('registration is  Successful!')
                if (responseData.redirect) {
                    alert('User already exists with this mobile number')
                    window.location.href = responseData.redirect;
                }
                else {
                    console.log(responseData)
                }
            }
            else {
                const responseData = await response.json()
                const errmessage = responseData.message;
                console.log(errmessage)
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }
    else {
        console.log("Phone number is not valid")
        alert('Phone number is not valid')
    }
})

const registerOtpVerification = document.querySelector('.register .section3 .form2 ')

registerOtpVerification.addEventListener('submit', async (e) => {
    const otp = registerOtpVerification.mobileNumberOtp.value

    console.log(otp)
    const currentTime = new Date()
    const formattedCurrentTime = currentTime.toISOString().replace('Z', '+00:00');
    console.log(otp, formattedCurrentTime)
    if (otp.length === 6 && otp !== '' && !isNaN(otp)) {
        console.log('OTP is valid');
        try {
            e.preventDefault()
            const response = await fetch('/account/register?signup=true', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp: otp, currentTime: currentTime })
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData)
                // console.log('login successful')
                if (responseData.redirect) {
                    alert('registration Successful!')

                    window.location.href = responseData.redirect;
                } else {
                    console.error('Invalid OTP');
                }

            }
            else {
                const errResponseData = await response.json()
                console.log(errResponseData)
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }
    else {
        console.log('OTP is invalid');
    }
})


registerOtpResend.addEventListener('click', async (event) => {
    if (!isTimerRunning) {
        await startCountdownTimerReg(60);
        const currentTime = new Date()
        console.log(currentTime)
        try {
            event.preventDefault()
            const response = await fetch('/account/register/resend-Otp', {
                method: 'POST',
                headers: {
                    'content-Type': 'application/json'
                },
                body: JSON.stringify({ currentTime: currentTime })
            })
            if (response.ok) {
                console.log('OTP resent successfully')
                const responseData = await response.json()
            }
            else {
                console.error('Error resending OTP:', response.status)
            }

        } catch (error) {
            console.error('Error resending OTP:', error)
        }
    }
})

document.querySelector('.register .section3 .form1 a').addEventListener('click', function (event) {
    console.log('change')
    event.preventDefault();
    if (event.type === 'click') {
        document.querySelector('.register .section3 .form2+button').classList.add('register_section2_form2_button');        // document.querySelector('.register .section3 .form2+button').id = 'register_section2_form2_button';
        // document.querySelector('.register .section3 .form2~button ').style.marginRight = '20vw'
        // document.querySelector('.register .section3 .form2+button ').style.top = '20vw'
        console.log(
            // document.querySelector('.register .section3 .form2+button ').style
        )
        // Take the user back to the previous section
        document.querySelector('.register .section2').style.display = 'flex';
        document.querySelector('.register .section3').style.display = 'none';
        const mobileNumber = document.querySelector('.register .section3 .form1 input').value;
        const countryCode = document.querySelector('.iti__selected-dial-code').textContent;
        const correctMobileNumber = mobileNumber.replace(countryCode, '');
        document.querySelector('.register .section2 form #phone1').value = correctMobileNumber;

        document.querySelector('.register .section2 form #phone1').readOnly = false;
    }
    // Make the input field editable
});

