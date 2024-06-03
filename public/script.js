document.addEventListener("DOMContentLoaded", () => {
    // Initialize goal progress bar
    const goalProgressBarDone = document.querySelector('.goalProgressBar .goalProgressBarDone');
    const goalProgressBarWidth = goalProgressBarDone.getAttribute('goal-done');
    goalProgressBarDone.style.width = goalProgressBarWidth + '%';
    goalProgressBarDone.style.opacity = 1;

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
        const totalPages = parseInt(document.getElementById("totalPages").value); // Added this line to get total pages
        const pagesRead = 0; // Initial pages read

        // Save book progress to localStorage, including totalPages and pagesRead
        saveBookProgress({ bookTitle, bookAuthor, bookDescription, bookCover, totalPages, pagesRead });

        // Add book progress to UI, including totalPages and pagesRead
        addBookToUI({ bookTitle, bookAuthor, bookDescription, bookCover, totalPages, pagesRead });

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
        bookProgressInfo.dataset.totalPages = book.totalPages; // Store totalPages in dataset
        bookProgressInfo.dataset.pagesRead = book.pagesRead; // Store pagesRead in dataset
        const progress = (book.pagesRead / book.totalPages) * 100; // Calculate progress
        bookProgressInfo.innerHTML = `
            <div class="detailsWrapper">
                <img src="${book.bookCover}" alt="Book Cover" class="bookCover">
                <div class="bookDetails">
                    <p class="bookTitle">${book.bookTitle}</p>
                    <p class="bookAuthor">by ${book.bookAuthor}</p>
                    <p class="bookDescription">${book.bookDescription}</p>
                    <div class="progress">
                        <div class="progress-done" data-done="${progress}" style="width: ${progress}%; opacity: 1;">${Math.round(progress)}%</div>
                    </div>
                </div>
                <i class="fa-solid fa-ellipsis meatball-icon"></i>
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
                const currentPagesRead = parseInt(bookProgressInfo.dataset.pagesRead);

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
                const bookProgressInfo = editPopupOverlay.currentBookProgressInfo;
                const totalBookPages = parseInt(bookProgressInfo.dataset.totalPages);
                const pagesReadToday = parseInt(document.getElementById('editPagesRead').value);
                const previousPagesRead = parseInt(bookProgressInfo.dataset.pagesRead);
                const totalPagesRead = previousPagesRead + pagesReadToday; // Accumulate the pages read
                const bookProgressPercentage = (totalPagesRead / totalBookPages) * 100;

                const progressBar = bookProgressInfo.querySelector('.progress-done');
                progressBar.style.width = `${bookProgressPercentage}%`;
                progressBar.textContent = `${Math.round(bookProgressPercentage)}%`;
                progressBar.setAttribute('data-done', bookProgressPercentage);
                progressBar.style.opacity = 1;

                // Update localStorage
                updateBookProgress(bookProgressInfo.querySelector('.bookTitle').innerText, totalPagesRead);

                // Update the dataset attribute
                bookProgressInfo.dataset.pagesRead = totalPagesRead;

                editPopupOverlay.style.display = 'none';
            });
        }

        if (deleteProgressButton) {
            deleteProgressButton.addEventListener('click', () => {
                const bookProgressInfo = editPopupOverlay.currentBookProgressInfo;
                if (bookProgressInfo) {
                    bookProgressInfo.remove();
                    // Remove the book from localStorage
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

    // Function to update book progress in localStorage
    function updateBookProgress(bookTitle, newPagesRead) {
        let bookProgress = JSON.parse(localStorage.getItem('bookProgress')) || [];
        bookProgress = bookProgress.map(book => {
            if (book.bookTitle === bookTitle) {
                book.pagesRead = newPagesRead;
                book.progress = (newPagesRead / book.totalPages) * 100;
            }
            return book;
        });
        localStorage.setItem('bookProgress', JSON.stringify(bookProgress));
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

// DEFAULT PROGRESS BAR
document.addEventListener("DOMContentLoaded", () => {
  // Initialize default progress bars
  const defaultProgressBars = document.querySelectorAll('.defaultprogress-done');
  defaultProgressBars.forEach(progressBar => {
    const defaultProgressWidth = progressBar.getAttribute('defaultdata-done');
    progressBar.style.width = defaultProgressWidth + '%';
    progressBar.style.opacity = 1;
  });

  // Load and set saved progress from localStorage
  const savedProgress = JSON.parse(localStorage.getItem('savedProgress'));
  if (savedProgress) {
    const changeableProgressBars = document.querySelectorAll('.progress-done');
    changeableProgressBars.forEach(progressBar => {
      const bookTitle = progressBar.closest('.bookProgressInfo').querySelector('.bookTitle').innerText;
      if (savedProgress[bookTitle]) {
        const savedWidth = savedProgress[bookTitle];
        progressBar.style.width = savedWidth + '%';
        progressBar.textContent = Math.round(savedWidth) + '%';
        progressBar.setAttribute('data-done', savedWidth);
        progressBar.style.opacity = 1;
      }
    });
  }
});

// Function to save progress to localStorage
function saveProgress(bookTitle, progress) {
  let savedProgress = JSON.parse(localStorage.getItem('savedProgress')) || {};
  savedProgress[bookTitle] = progress;
  localStorage.setItem('savedProgress', JSON.stringify(savedProgress));
}

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
    new Chart(ctxBooks, {
        type: 'bar',
        data: {
            labels: ['Last Month', 'This Month'],
            datasets: [{
                label: 'Books Completed',
                data: [lastMonthBook, thisMonthBook],
                backgroundColor: ['rgba(76, 175, 80, 0.2)', 'rgba(255, 152, 0, 0.2)'],
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    // Chart.js initialization for pages read comparison
    const ctxPages = document.getElementById('comparisonPageDayChart').getContext('2d');
    new Chart(ctxPages, {
        type: 'bar',
        data: {
            labels: ['Yesterday', 'Today'],
            datasets: [{
                label: 'Pages Read',
                data: [pagesReadYesterday, pagesReadToday],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
});

// GENRE INSIGHT GRAPH

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('favoriteGenreChart').getContext('2d');

    const chartData = [
        { genre: "Classic", booksRead: 39 },
        { genre: "Mystery", booksRead: 18 },
        { genre: "Romance", booksRead: 9 },
        { genre: "Biography", booksRead: 5 },
    ];

    let genreLabels = [],
        booksReadData = [],
        sum = 0;

    for (let i = 0; i < chartData.length; i++) {
        genreLabels.push(chartData[i].genre);
        booksReadData.push(chartData[i].booksRead);
        sum += chartData[i].booksRead;
    }


    const textInside = sum.toString();

    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: genreLabels,
            datasets: [{
                label: 'Books Read',
                data: booksReadData,
                backgroundColor: [
                    "#a2d6c4",
                    "#36A2EB",
                    "#3e8787",
                    "#579aac",
                ]
            }]
        },
        options: {
            elements: {
                center: {
                    text: textInside
                }
            },
            responsive: true,
            legend: false,
            legendCallback: function(chart) {
                let legendHtml = [];
                legendHtml.push('<ul>');
                let item = chart.data.datasets[0];
                for (let i = 0; i < item.data.length; i++) {
                    legendHtml.push('<li>');
                    legendHtml.push('<span class="chart-legend" style="background-color:' + item.backgroundColor[i] +'"></span>');
                    legendHtml.push('<span class="chart-legend-label-text">' + chart.data.labels[i] + '</span>');
                    legendHtml.push('</li>');
                }
                legendHtml.push('</ul>');
                return legendHtml.join("");
            },
            tooltips: {
                enabled: true,
                mode: 'label',
                callbacks: {
                    label: function(tooltipItem, data) {
                        let indice = tooltipItem.index;
                        return 'You read ' + data.datasets[0].data[indice] + ' ' + data.labels[indice] + ' books this month';
                    }
                }
            }
        }
    });

    document.getElementById('genreLegend').innerHTML = myChart.generateLegend();
});

function updateGoalProgress(progressPercentage) {
  const circle = document.querySelector('.goal-progress-ring-circle');
  const text = document.querySelector('.goal-progress-text');

  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - progressPercentage / 100 * circumference;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;

  text.textContent = `${progressPercentage}%`;
}
 

// Get the input field, submit button, note display area, and note error element
const userInput = document.getElementById('userNote');
const submitBtn = document.querySelector('.submitNoteButton');
const noteDisplay = document.querySelector('.noteDisplay');
const noteError = document.getElementById('noteError');

// Retrieve notes from local storage if any
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Function to render notes
function renderNotes() {
  const noteDisplay = document.querySelector('.noteDisplay');
  noteDisplay.innerHTML = '';
  notes.forEach((note, index) => {
    const div = document.createElement('div');
    div.classList.add('note');
    div.textContent = note;

    // Add the trash icon directly within each note container
    div.innerHTML += '<i class="deleteIcon fas fa-trash fa-lg" onclick="deleteNote(' + index + ')"></i>';

    noteDisplay.appendChild(div);
  });
}

// Function to save notes to local storage
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Display existing notes when the page loads
renderNotes();

// Function to delete a note
function deleteNote(index) {
  const noteDisplay = document.querySelector('.noteDisplay');
  const noteToRemove = noteDisplay.children[index];
  noteToRemove.classList.add('deletedNote'); // Add a class for CSS animation
  setTimeout(() => {
    notes.splice(index, 1); // Remove the note from the array
    saveNotes(); // Save the updated notes to local storage
    renderNotes(); // Render the updated notes
  }, 300); // Wait for animation to finish before deleting note
}

// Add event listener to the submit button
submitBtn.addEventListener('click', function(event) {
  event.preventDefault(); // Prevent the default form submission

  // Check if the input field is empty or doesn't meet the word limit
  const words = userInput.value.trim().split(/\s+/).length;
  if (userInput.value.trim().length === 0 || words < 15) {
    noteError.style.display = 'block';
    return; // Exit the function if validation fails
  }

  // Add the new note to the notes array
  notes.push(userInput.value.trim());
  saveNotes();
  renderNotes();
  userInput.value = ''; // Clear input field
  noteError.style.display = 'none'; // Hide the error message
});
