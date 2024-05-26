document.addEventListener("DOMContentLoaded", () => {
    const goalProgressBarDone = document.querySelector('.goalProgressBar .goalProgressBarDone');
    const goalProgressBarWidth = goalProgressBarDone.getAttribute('goal-done');
    goalProgressBarDone.style.width = goalProgressBarWidth + '%';
    goalProgressBarDone.style.opacity = 1;
});


document.addEventListener("DOMContentLoaded", () => {
    const addBookButton = document.querySelector(".add-book-button");
    const popupOverlay = document.getElementById("popupOverlay");
    const closeButton = document.querySelector(".close-button");
    const addBookForm = document.getElementById("addBookForm");
    const currentReadInfo = document.querySelector(".currentReadInfo");

    addBookButton.addEventListener("click", () => {
        popupOverlay.style.display = "flex";
    });

    closeButton.addEventListener("click", () => {
        popupOverlay.style.display = "none";
    });

    popupOverlay.addEventListener("click", (event) => {
        if (event.target === popupOverlay) {
            popupOverlay.style.display = "none";
        }
    });

    addBookForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const bookTitle = document.getElementById("bookTitle").value;
        const bookAuthor = document.getElementById("bookAuthor").value;
        const bookDescription = document.getElementById("bookDescription").value;
        const bookCover = document.getElementById("bookCover").value;
        const bookProgress = 0; // Initial progress

        // Save book progress to localStorage
        saveBookProgress({ bookTitle, bookAuthor, bookDescription, bookCover, progress: bookProgress });

        // Add book progress to UI
        addBookToUI({ bookTitle, bookAuthor, bookDescription, bookCover, progress: bookProgress });

        popupOverlay.style.display = "none";
        addBookForm.reset();

        // Reinitialize meatball icon click event
        initializeMeatballIconClick();
    });

    // Function to load saved book progress from localStorage
    function loadBookProgress() {
        const bookProgress = JSON.parse(localStorage.getItem('bookProgress')) || [];
        bookProgress.forEach(book => {
            addBookToUI(book);
        });
    }

    // Function to save book progress to localStorage
    function saveBookProgress(book) {
        let bookProgress = JSON.parse(localStorage.getItem('bookProgress')) || [];
        bookProgress.push(book);
        localStorage.setItem('bookProgress', JSON.stringify(bookProgress));
    }

    // Function to add book progress to UI
    function addBookToUI(book) {
        const bookProgressInfo = document.createElement("div");
        bookProgressInfo.classList.add("bookProgressInfo");
        bookProgressInfo.innerHTML = `
            <div class="detailsWrapper">
                <img src="${book.bookCover}" alt="Book Cover" class="bookCover">
                <div class="bookDetails">
                    <h2 class="bookTitle">${book.bookTitle}</h2>
                    <p class="bookAuthor">by ${book.bookAuthor}</p>
                    <p class="bookDescription">${book.bookDescription}</p>
                </div>
                <i class="fa-solid fa-ellipsis meatball-icon"></i>
            </div>
            <div class="progress">
                <div class="progress-done" data-done="${book.progress}">${book.progress}%</div>
            </div>
        `;
        currentReadInfo.appendChild(bookProgressInfo);
    }

    // Function to initialize meatball icon click event
    function initializeMeatballIconClick() {
        const meatballIcons = document.querySelectorAll('.meatball-icon');
        const editPopupOverlay = document.getElementById('editPopupOverlay');
        const closeButton = editPopupOverlay.querySelector('.close-button');
        const saveChangesButton = document.getElementById('saveChangesBtn');
        const deleteProgressButton = document.getElementById('deleteProgressBtn'); // Added delete button reference
        const editReadingProgressForm = document.getElementById('editReadingProgressForm');

        meatballIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                editPopupOverlay.style.display = 'flex';
                const bookProgressInfo = icon.closest('.bookProgressInfo');
                const progressDone = bookProgressInfo.querySelector('.progress-done');
                const currentPagesRead = Math.round(progressDone.getAttribute('data-done') * 300 / 100);

                document.getElementById('editPagesRead').value = currentPagesRead;

                editPopupOverlay.currentBookProgressInfo = bookProgressInfo;
            });
        });

        if (closeButton) {
            closeButton.addEventListener('click', () => {
                editPopupOverlay.style.display = 'none';
            });
        }

        if (saveChangesButton) {
            saveChangesButton.addEventListener('click', (e) => {
                e.preventDefault();
                const totalBookPages = 300;
                const totalPagesRead = document.getElementById('editPagesRead').value;
                const bookProgressPercentage = (totalPagesRead / totalBookPages) * 100;

                const progressBar = editPopupOverlay.currentBookProgressInfo.querySelector('.progress-done');
                progressBar.style.width = `${bookProgressPercentage}%`;
                progressBar.textContent = `${Math.round(bookProgressPercentage)}%`;
                progressBar.setAttribute('data-done', bookProgressPercentage);
                progressBar.style.opacity = 1;

                editPopupOverlay.style.display = 'none';
            });
        }

        if (deleteProgressButton) {
            deleteProgressButton.addEventListener('click', () => {
                const bookProgressInfo = editPopupOverlay.currentBookProgressInfo;
                if (bookProgressInfo) {
                    bookProgressInfo.remove();
                    // Optionally, you can also remove the book from localStorage here
                    removeBookProgress(bookProgressInfo.querySelector('.bookTitle').innerText);
                }
                editPopupOverlay.style.display = 'none';
            });
        }

        if (editPopupOverlay) {
            editPopupOverlay.addEventListener('click', (e) => {
                if (e.target === editPopupOverlay) {
                    editPopupOverlay.style.display = 'none';
                }
            });
        }

        if (editReadingProgressForm) {
            editReadingProgressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                editPopupOverlay.style.display = 'none';
            });
        }
    }

    // Function to remove book progress from localStorage
    function removeBookProgress(bookTitle) {
        let bookProgress = JSON.parse(localStorage.getItem('bookProgress')) || [];
        bookProgress = bookProgress.filter(book => book.bookTitle !== bookTitle);
        localStorage.setItem('bookProgress', JSON.stringify(bookProgress));
    }

    // Load saved book progress from localStorage
    loadBookProgress();

    // Initialize meatball icon click event
    initializeMeatballIconClick();
});

// BAR CHART //
document.addEventListener('DOMContentLoaded', function() {
    // Data from the data model
    const lastMonthBook = 10;
    const thisMonthBook = 20;
    const pagesReadYesterday = 50;
    const pagesReadToday = 60;

    // Populate the book comparison data in HTML
    document.querySelector('.lastMonthBook').textContent = lastMonthBook;
    document.querySelector('.thisMonthBook').textContent = thisMonthBook;

    // Populate the pages read data in HTML
    document.querySelector('.pagesReadYesterday').textContent = pagesReadYesterday;
    document.querySelector('.pagesReadToday').textContent = pagesReadToday;

    // Chart.js initialization for books comparison
    const ctxBooks = document.getElementById('comparisonBarChart').getContext('2d');
    const myBooksChart = new Chart(ctxBooks, {
        type: 'bar',
        data: {
            labels: ['Last Month', 'This Month'],
            datasets: [{
                label: 'Books Completed',
                data: [lastMonthBook, thisMonthBook],
                backgroundColor: ['rgba(76, 175, 80, 0.2)', 'rgba(255, 152, 0, 0.2)'],
                borderColor: ['rgba(56, 142, 60, 1)', 'rgba(245, 124, 0, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Chart.js initialization for pages read comparison
    const ctxPages = document.getElementById('comparisonPageDayChart').getContext('2d');
    const myPagesChart = new Chart(ctxPages, {
        type: 'bar',
        data: {
            labels: ['Yesterday', 'Today'],
            datasets: [{
                label: 'Pages Read',
                data: [pagesReadYesterday, pagesReadToday],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

// GENRE INSIGHT GRAPH

// Assuming you have already fetched the genreInsight data from your model
const genreData = {
  allTimeFavGenre: "Fantasy",
  pieChartGenre: { fantasy: 30, mystery: 20, scienceFiction: 50 },
  pieChartLegend: ["Fantasy", "Mystery", "Science Fiction"]
};

// Create the dataset for the polar area chart
const data = {
  labels: genreData.pieChartLegend,
  datasets: [{
    data: Object.values(genreData.pieChartGenre),
    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
  }]
};

// Chart configuration
const config = {
  type: 'polarArea',
  data: data,
  options: {
    plugins: {
      legend: {
        position: 'right'
      }
    }
  }
};

// Get the canvas element
const genreCanvas = document.getElementById('genreChart');
// Create the chart
const genreChart = new Chart(genreCanvas, config);





