const apiKey = 'AIzaSyAWORW19--OP1mN7uYb1z1ItfI-u2xDgYU';
const apiUrl = 'https://www.googleapis.com/books/v1/volumes';
const maxResults = 10;
const throttleDelay = 1000; // 1 second delay
let categoryBarOpened, currentCategory = "all";

let startIndex = 0;
let totalResults = 0;
let isThrottled = false;

// Function to fetch books
const fetchBooks = (query, startIndex = 0, category = "all") => {
    if (isThrottled) {
        console.log('Throttling requests, please wait...');
        return;
    }

    let url = `${apiUrl}?q=${encodeURIComponent(query)}`;

    if (category && category !== 'all') {
        url += `+subject:${encodeURIComponent(category)}`;
    }

    url += `&startIndex=${startIndex}&maxResults=${maxResults}&key=AIzaSyAWORW19--OP1mN7uYb1z1ItfI-u2xDgYU`;
    fetch(url)
        .then(response => {
            if (response.status === 429) {
                console.error('Too Many Requests, throttling...');
                isThrottled = true;
                setTimeout(() => isThrottled = false, throttleDelay); // Throttle requests
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;

            totalResults = data.totalItems;
            const books = data.items;

            const bookList = document.querySelector(".content")
            if (startIndex === 0) {

                bookList.innerHTML = ''; // Clear previous results
            }

            books.forEach(book => {
                const title = book.volumeInfo.title;
                const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown';
                const imageUrl = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150';

                const bookElement = createBookElement(title, authors, imageUrl);
                bookList.appendChild(bookElement);
            });

        })
        .catch(error => console.error('Error fetching books:', error));
};

// Example function to create book element (as shown previously)
const createBookElement = (title, author, imageUrl) => {
    const bookDiv = document.createElement('div');
    bookDiv.classList.add('book');

    const wishlistButton = document.createElement('button');
    wishlistButton.classList.add('wishlist_btn');
    bookDiv.appendChild(wishlistButton)

    const borrowBtn = document.createElement('button');
    borrowBtn.classList.add('borrow_btn');
    bookDiv.appendChild(borrowBtn)


    const borrowImg = document.createElement('img');
    borrowImg.src = 'svgs/borrow.png';
    borrowImg.alt = 'borrow';
    borrowBtn.appendChild(borrowImg);

    const wishlistImg = document.createElement('img');
    wishlistImg.src = 'svgs/whishlist.svg';
    wishlistImg.alt = 'Wishlist';
    wishlistButton.appendChild(wishlistImg);

    const addedBtn = document.createElement('img');
    addedBtn.src = 'svgs/added.svg';
    addedBtn.alt = 'Wishlist';
    addedBtn.style.display = "none"
    wishlistButton.appendChild(addedBtn);

    const bookImgDiv = document.createElement('div');
    bookImgDiv.classList.add('book_img');
    const bookImg = document.createElement('img');
    bookImg.src = imageUrl;
    bookImg.alt = title;
    bookImgDiv.appendChild(bookImg);

    const bookTextDiv = document.createElement('div');
    bookTextDiv.classList.add('book_text');
    const bookTitle = document.createElement('h1');
    bookTitle.textContent = title;
    const bookAuthor = document.createElement('p');
    bookAuthor.textContent = author;
    bookTextDiv.appendChild(bookTitle);
    bookTextDiv.appendChild(bookAuthor);

    bookDiv.appendChild(bookImgDiv);
    bookDiv.appendChild(bookTextDiv);

    let inWishList;
    function addtoWhishList() {

        document.querySelector(".whishlist_content").append(bookDiv)
        wishlistButton.removeEventListener("click", addtoWhishList)
        wishlistButton.addEventListener("click", removefromWhishList)
        wishlistImg.style.display = "none"
        addedBtn.style.display = "block"
        inWishList = true
        showMsg("Successfully added")



    }
    function removefromWhishList() {

        document.querySelector(".content").append(bookDiv)
        wishlistButton.removeEventListener("click", removefromWhishList)
        wishlistButton.addEventListener("click", addtoWhishList)
        wishlistImg.style.display = "block"
        addedBtn.style.display = "none"
        inWishList = false
        showMsg("Successfully removed")



    }

    wishlistButton.addEventListener("click", addtoWhishList)


    let status = "Not Returned";
    let currect_book;
    function addtoBorrowed() {
        let date = new Date()
        let current_date = `${date.getDate()} - ${date.getMonth() + 1} - ${date.getFullYear()}`
        let return_date = `${date.getDate() + 7} - ${date.getMonth() + 1} - ${date.getFullYear()}`
        document.querySelector(".borrowed_content").append(bookDiv)
        borrowBtn.removeEventListener("click", addtoBorrowed)
        borrowBtn.addEventListener("click", removeFromBorrowed)
        currect_book = addToHistory(title, author, imageUrl, current_date, return_date, status)
        document.querySelector('.borrowingHistory_content').prepend(currect_book)
        wishlistButton.style.display = "none"
        showMsg("Successfully Borrowed")


    }
    function removeFromBorrowed() {
        document.querySelector(".content").append(bookDiv)
        wishlistButton.style.display = "flex"
        borrowBtn.removeEventListener("click", removeFromBorrowed)
        borrowBtn.addEventListener("click", addtoBorrowed)
        currect_book.children[1].children[1].children[2].innerText = "Returned"
        currect_book.children[1].children[1].children[2].style.backgroundColor = "green"
        if (inWishList == true) {
            document.querySelector(".whishlist_content").append(bookDiv)

        }
        showMsg("Successfully Returned")

    }
    borrowBtn.addEventListener("click", addtoBorrowed)
    return bookDiv;
};

function addToHistory(title, author, imageUrl, borrowDate, returnDate, status) {
    const bookDetailsDiv = document.createElement('div');
    bookDetailsDiv.classList.add('book_details');

    // Book Image
    const bookImageDiv = document.createElement('div');
    bookImageDiv.classList.add('book_image');
    bookDetailsDiv.appendChild(bookImageDiv);

    const bookImg = document.createElement('img');
    bookImg.src = imageUrl;
    bookImg.alt = title;
    bookImageDiv.appendChild(bookImg);

    const detailsAndStatus = document.createElement("div")
    detailsAndStatus.classList.add("detailsAndStatus")
    bookDetailsDiv.appendChild(detailsAndStatus)

    // Book Details Text
    const bookDetailsTextDiv = document.createElement('div');
    bookDetailsTextDiv.classList.add('book_details_text');
    const bookTitle = document.createElement('h1');
    bookTitle.textContent = title;
    const bookAuthor = document.createElement('p');
    bookAuthor.textContent = author;
    bookDetailsTextDiv.appendChild(bookTitle);
    bookDetailsTextDiv.appendChild(bookAuthor);

    // Status Details
    const statusDetailsDiv = document.createElement('div');
    statusDetailsDiv.classList.add('status_details');
    const borrowDateP = document.createElement('p');
    borrowDateP.textContent = `Borrow Date: ${borrowDate}`;
    const returnDateP = document.createElement('p');
    returnDateP.textContent = `Return Date: ${returnDate}`;
    const statusButton = document.createElement('button');
    statusButton.id = 'status';
    statusButton.textContent = status;
    statusDetailsDiv.appendChild(borrowDateP);
    statusDetailsDiv.appendChild(returnDateP);
    statusDetailsDiv.appendChild(statusButton);

    // Append all parts to the main book details div
    detailsAndStatus.appendChild(bookDetailsTextDiv);
    detailsAndStatus.appendChild(statusDetailsDiv);

    return bookDetailsDiv;
};

function showMsg(msg) {
    var elem = document.querySelector(".current_msg")
    elem.innerText = msg
    let id = null
    var opa = 0;
    clearInterval(id);
    id = setInterval(frame, 10);
    function frame() {
        if (opa == 100) {
            clearInterval(id);
            setInterval(() => { elem.style.opacity = 0 }, 2000)
        } else {
            opa++;
            elem.style.opacity = opa;
        }
    }
}


// Initial fetch of books
let initialQuery = 'famouse books';
fetchBooks(initialQuery);

document.querySelector("#searchButton").addEventListener("click", () => {
    if (document.getElementById("searchInput").value) {
        initialQuery = document.getElementById("searchInput").value
        fetchBooks(initialQuery, 0, currentCategory);
    }

    if (screen.width <= 450) {
        document.querySelector(".serach_bar").style.display = "none"

    }

})



document.querySelector("#secondary_searchButton").addEventListener("click", () => {
    document.querySelector(".serach_bar").style.display = "flex"

})


function hideAllContent() {
    document.querySelector(".whishlist_content").style.display = "none"
    document.querySelector(".borrowed_content").style.display = "none"
    document.querySelector(".borrowingHistory_content").style.display = "none"
    document.querySelector(".content").style.display = "none"
    document.querySelector(".load_more").style.display = "none"
    document.querySelector(".sub_header").style.display = "none"
    document.querySelector(".category_bar").style.display = "none"

}

function closingSideBar() {
    let id = null
    var elem = document.querySelector(".side_bar")
    var pos = 0;
    clearInterval(id);
    id = setInterval(frame, 10);
    function frame() {
        if (pos == -80) {
            clearInterval(id);
        } else {
            pos--;
            pos--;
            pos--;
            pos--;
            elem.style.left = pos + 'vw';
        }
    }
}
function openCategoryBar() {
    categoryBarOpened = true
    let id = null
    var elem = document.querySelector(".category_bar")
    var pos = -250;
    clearInterval(id);
    id = setInterval(frame, 20);
    function frame() {
        if (pos == 0) {
            clearInterval(id);
        } else {
            pos++;
            pos++;
            pos++;
            pos++;
            pos++;
            elem.style.right = pos + 'px';
        }
    }
}
function closeCategoryBar() {
    categoryBarOpened = false
    let id = null
    var elem = document.querySelector(".category_bar")
    var pos = 0;
    clearInterval(id);
    id = setInterval(frame, 20);
    function frame() {
        if (pos == -250) {
            clearInterval(id);
        }
        else {
            pos--;
            pos--;
            pos--;
            pos--;
            pos--;


            elem.style.right = pos + 'px';
        }

    }
}



document.querySelector("#closing_logo").addEventListener("click", () => {
    closingSideBar()
})
document.querySelector("#opening_logo").addEventListener("click", () => {
    let id1 = null
    document.querySelector(".side_bar").style.display = "flex"
    var elem = document.querySelector(".side_bar")
    var pos = -80;
    clearInterval(id1);
    id1 = setInterval(frame, 10);
    function frame() {
        if (pos == 0) {
            clearInterval(id1);
        } else {
            pos++;
            pos++;
            pos++;
            pos++;
            elem.style.left = pos + 'vw';
        }
    }
})

document.querySelector("#WishList").addEventListener("click", () => {
    hideAllContent()
    closingSideBar()
    document.querySelector(".whishlist_content").style.display = "flex"
})
document.querySelector("#Library").addEventListener("click", () => {
    hideAllContent()
    closingSideBar()
    document.querySelector(".content").style.display = "flex"
    document.querySelector(".load_more").style.display = "block"
    document.querySelector(".sub_header").style.display = "flex"
    document.querySelector(".category_bar").style.display = "block"




})
document.querySelector("#Borrowed").addEventListener("click", () => {
    closingSideBar()
    hideAllContent()
    document.querySelector(".borrowed_content").style.display = "flex"
})
document.querySelector("#borrowing_history").addEventListener("click", () => {
    closingSideBar()
    hideAllContent()
    document.querySelector(".borrowingHistory_content").style.display = "flex"
})

document.querySelectorAll(".category_btn").forEach((category) => {
    category.addEventListener("click", () => {
        if (initialQuery == "famouse books") {
            initialQuery = ""
        }
        currentCategory = category.id
        console.log(currentCategory);
        fetchBooks(initialQuery, 0, currentCategory)

    })

})
document.querySelector("#filter-btn").addEventListener("click", () => {
    if (categoryBarOpened) {
        closeCategoryBar()
    }
    else if (!categoryBarOpened) {
        openCategoryBar()

    }
})


document.querySelector(".clearFilters").addEventListener("click", () => {

    initialQuery = "famouse books"
    currentCategory = "all"
    fetchBooks(initialQuery, 0, currentCategory)
})





// Function to fetch next set of books
const fetchMoreBooks = () => {
    if (startIndex + maxResults < totalResults) {
        startIndex += maxResults;
        fetchBooks(initialQuery, startIndex, currentCategory);
    }
};

let loadButton = document.querySelector(".load_more")
loadButton.addEventListener('click', fetchMoreBooks);

