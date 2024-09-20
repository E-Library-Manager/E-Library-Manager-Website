window.onload = function() {
    loadBooks();
};


/* Function to show the modal
function showModal(type) {
    document.getElementById("modal").style.display = "block";
    document.getElementById("modal-title").innerText = type === 'login' ? 'Login' : 'Sign Up';

    // Show/hide fields based on the type
    if (type === 'signup') {
        document.getElementById("name-label").style.display = "block";
        document.getElementById("modal-name").style.display = "block";
        document.getElementById("modal-name").setAttribute('required', 'required');  // Require name for signup
    } else {
        document.getElementById("name-label").style.display = "none";
        document.getElementById("modal-name").style.display = "none";
        document.getElementById("modal-name").removeAttribute('required');  // Remove name requirement for login
    }
}
 */

// Function to close the modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Store the logged-in user's information
let loggedInUser = null;

// Function to handle form submission (Login/Signup)
document.getElementById('auth-form').addEventListener('submit', async function(event) {
    console.log('Form submitted');
    event.preventDefault();
    const type = document.getElementById("modal-title").innerText.toLowerCase();
    const username = document.getElementById('modal-username').value;
    const password = document.getElementById('modal-password').value;
    let name=null

    let response;
    if (type === 'sign up') {
        name = document.getElementById('modal-name')?.value;
        response = await fetch('/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, username, password })
        });
    } else {
        response = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
    }

    const result = await response.json();
   // console.log(result);
    if (result.success) {
        loggedInUser = { name: result.name , user_id: result.user_id };
       
       // Store user info in localStorage for persistence
       localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        document.getElementById('username').innerText = `Welcome, ${loggedInUser.name}`;
        document.getElementById('username').style.display = 'block';
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('signup-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';  // Show Log Out button

        closeModal();
        loadBooks();  // Reload books after login/signup
        
    } else {
        alert(result.message);
    }
});

// Function to handle log out
async function handleLogout() {
    await fetch('/logout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: loggedInUser.user_id })
    });

    // Clear the logged-in user data
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');

    document.getElementById('username').innerText = '';
    document.getElementById('username').style.display = 'none';
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('signup-btn').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';  // Hide Log Out button

    // Reload books to update the UI
    loadBooks();
}


// Attach event listener to Log Out button
document.getElementById('logout-btn').addEventListener('click', handleLogout);

// On page load, check if user info is already stored in localStorage
document.addEventListener('DOMContentLoaded', function() {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        loggedInUser = JSON.parse(storedUser);
        document.getElementById('username').innerText = `Welcome, ${loggedInUser.name}`;
        document.getElementById('username').style.display = 'block';
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('signup-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';  // Show Log Out button
        
        // Load books after restoring session
        loadBooks();
    }
});

function toggleModal(type) {
    const modalTitle = document.getElementById("modal-title");
    const nameLabel = document.getElementById("name-label");
    const nameInput = document.getElementById("modal-name");

    if (type === 'sign up') {
        modalTitle.innerText = 'Sign Up';
        nameLabel.style.display = 'block';  // Show the name field
        nameInput.style.display = 'block';
        nameInput.setAttribute('required', 'required');  // Make name required for sign-up
    } else {
        modalTitle.innerText = 'Login';
        nameLabel.style.display = 'none';  // Hide the name field
        nameInput.style.display = 'none';
        nameInput.removeAttribute('required');  // Remove the required attribute for login
        nameInput.value = '';  // Clear the name field value if switching to login
    }

    openModal();  // Open the modal after toggling
}

function openModal() {
    document.getElementById('modal').style.display = 'block';  // Display the modal
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';  // Hide the modal
}

const quotes = [
    "\"Books are a treasure trove of knowledge, wisdom, and inspiration.\" – Shahd Ibrahim",
    "\"When in doubt, go to the library.\" – J.K. Rowling",
    "\"A library is not a luxury but one of the necessities of life.\" – Henry Ward Beecher",
    // Add more quotes here
];

let currentIndex = 0;

function showQuote() {
    const quoteElement = document.getElementById("quote");
    quoteElement.innerText = quotes[currentIndex];

    // Reset position to off-screen right
    quoteElement.style.transform = 'translateX(100%)'; // Start from the right

    // Trigger reflow for animation
    setTimeout(() => {
        quoteElement.style.transform = 'translateX(0)'; // Move into view
    }, 50); // Short delay to trigger CSS transition

    // Move out to the left after 3 seconds
    setTimeout(() => {
        quoteElement.style.transform = 'translateX(-100%)'; // Move out to the left
    }, 3000); // Show quote for 3 seconds

    // Move to the next quote after it goes out
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % quotes.length; // Loop back
        showQuote(); // Call function again for next quote
    }, 4000); // Total time before next quote starts
}

// Start the quote rotation
document.addEventListener('DOMContentLoaded', function() {
    showQuote();
});


// Fetch and display books
async function loadBooks() {
    const response = await fetch('/books');
    const books = await response.json();

    const unborrowedList = document.getElementById('unborrowed-books');
    const yourBooksList = document.getElementById('your-books');
    const borrowedList = document.getElementById('borrowed-books');

    unborrowedList.innerHTML = '';
    yourBooksList.innerHTML = '';
    borrowedList.innerHTML = '';

    books.forEach(book => {
        const listItem = document.createElement('li');
        listItem.innerText = `${book.name} by ${book.author}`;
        if (!book.borrowed) {
            listItem.innerHTML += ` <button onclick="borrowBook(${book.id})">Borrow</button>`;
            unborrowedList.appendChild(listItem);
        } else if(loggedInUser && book.user_id===loggedInUser.user_id){
            listItem.innerHTML += ` <button onclick="returnBook(${book.id})">Return</button>`;
            yourBooksList.appendChild(listItem);
        }
        else{
            //listItem.innerHTML += ` <button disabled>Borrowed</button>`;
            borrowedList.appendChild(listItem);
        }
    });
}

// Function to borrow a book
async function borrowBook(bookId) {
    if (!loggedInUser) {
        alert("You need to be logged in to borrow a book.");
        return;
    }
    const response = await fetch('/borrow', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ book_id: bookId, user_id: loggedInUser.user_id })
    });
    const result = await response.json();
    alert(result.message);
    if (result.success){
         loadBooks();
    }
}

// Function to return a book
async function returnBook(bookId) {
    if (!loggedInUser) {
        alert("You need to be logged in to return a book.");
        return;
    }
    const response = await fetch('/return', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ book_id: bookId, user_id: loggedInUser.user_id })
    });
    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadBooks();
    }
}

// Load books on page load
//document.addEventListener('DOMContentLoaded', loadBooks);
