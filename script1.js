const apiUrl = 'https://openlibrary.org/search.json';
const maxResults = 10;

let startIndex = 0;
let totalResults = 0;

// Function to fetch books
const fetchBooks = (query, startIndex = 0) => {
    const url = `${apiUrl}?q=${encodeURIComponent(query)}&limit=${maxResults}&offset=${startIndex}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;

            totalResults = data.numFound;
            const books = data.docs;

            const bookList = document.querySelector(".content");
            if (startIndex === 0) {
                bookList.innerHTML = ''; // Clear previous results
            }

            books.forEach(book => {
                const title = book.title;
                const authors = book.author_name ? book.author_name[0] : 'Unknown';
                const coverId = book.cover_i;
                const imageUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://via.placeholder.com/150';

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

    return bookDiv;
};

// Initial fetch of books
const initialQuery = 'youtube'; // Example initial query
fetchBooks(initialQuery);

const fetchMoreBooks = () => {
    if (startIndex + maxResults < totalResults) {
        startIndex += maxResults;
        fetchBooks(initialQuery, startIndex);
    }
};

const loadMoreButton = document.querySelector(".load_more")
loadMoreButton.addEventListener('click', fetchMoreBooks);

