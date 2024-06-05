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
        // Assuming bookProgressTabWrapper is a wrapper div that contains all book progress info
        const bookProgressTabWrapper = document.querySelector('.bookProgressTabWrapper');
        bookProgressTabWrapper.appendChild(bookProgressInfo);
    }

    // Function to initialize meatball icon click event
    function initializeMeatballIconClick() {
        const meatballIcons = document.querySelectorAll('.meatball-icon');
        const editPopupOverlay = document.getElementById('editPopupOverlay');
        const closeButton = editPopupOverlay.querySelector('.close-button');
        const saveChangesButton = document.getElementById('saveChangesBtn');
        const deleteProgressButton = document.getElementById('deleteProgressBtn'); // Added delete button reference


        meatballIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                editPopupOverlay.style.display = 'flex';
                const bookProgressInfo = icon.closest('.bookProgressInfo');
                const progressDone = bookProgressInfo.querySelector('.progress-done');
                const currentPagesRead = parseInt(bookProgressInfo.dataset.pagesRead);

                document.getElementById('editPagesRead').value = currentPagesRead;

                editPopupOverlay.currentBookProgressInfo = bookProgressInfo;

                const isDefaultBook = bookProgressInfo.classList.contains('default-book');

                const warningMessage = document.createElement('div');
                warningMessage.classList.add('warning-message');
                warningMessage.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Only edit or delete newly added books';
                editPopupOverlay.appendChild(warningMessage);

                function showWarning(event) {
                    warningMessage.style.display = 'block';
                    const buttonRect = event.target.getBoundingClientRect();
                    warningMessage.style.left = `${buttonRect.left + (buttonRect.width / 2) - 90}px`;
                    warningMessage.style.bottom = `${buttonRect.bottom - 235}px`;
                }

                function hideWarning() {
                    warningMessage.style.display = 'none';
                }

                if (isDefaultBook) {
                    saveChangesButton.addEventListener('mouseover', showWarning);
                    saveChangesButton.addEventListener('mouseout', hideWarning);
                    deleteProgressButton.addEventListener('mouseover', showWarning);
                    deleteProgressButton.addEventListener('mouseout', hideWarning);
                } else {
                    saveChangesButton.removeEventListener('mouseover', showWarning);
                    saveChangesButton.removeEventListener('mouseout', hideWarning);
                    deleteProgressButton.removeEventListener('mouseover', showWarning);
                    deleteProgressButton.removeEventListener('mouseout', hideWarning);
                }
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

                bookProgressInfo.dataset.pagesRead = totalPagesRead;

                updateBookProgressInLocalStorage(bookProgressInfo);

                editPopupOverlay.style.display = 'none';
            });
        }

        if (deleteProgressButton) {
            deleteProgressButton.addEventListener('click', () => {
                const bookProgressInfo = editPopupOverlay.currentBookProgressInfo;
                bookProgressInfo.remove();
                deleteBookProgressFromLocalStorage(bookProgressInfo);
                editPopupOverlay.style.display = 'none';
            });
        }

        function updateBookProgressInLocalStorage(bookProgressInfo) {
            const bookTitle = bookProgressInfo.querySelector('.bookTitle').textContent;
            const bookProgress = JSON.parse(localStorage.getItem('bookProgress')) || [];
            const updatedBookProgress = bookProgress.map(book => {
                if (book.bookTitle === bookTitle) {
                    book.pagesRead = parseInt(bookProgressInfo.dataset.pagesRead);
                }
                return book;
            });
            localStorage.setItem('bookProgress', JSON.stringify(updatedBookProgress));
        }

        function deleteBookProgressFromLocalStorage(bookProgressInfo) {
            const bookTitle = bookProgressInfo.querySelector('.bookTitle').textContent;
            const bookProgress = JSON.parse(localStorage.getItem('bookProgress')) || [];
            const updatedBookProgress = bookProgress.filter(book => book.bookTitle !== bookTitle);
            localStorage.setItem('bookProgress', JSON.stringify(updatedBookProgress));
        }
    }

    loadBookProgress();
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
                backgroundColor: ['rgba(89, 69, 255, 0.5)', 'rgba(46, 136, 255, 0.5)'],
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
                backgroundColor: ['rgba(255, 199, 94, 0.5)', 'rgba(255, 158, 94, 0.5)'],
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
document.addEventListener('DOMContentLoaded', function() {
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
                    "#7AAFFF",
                    "#FFB17A",
                    "#FFD47B",
                    "#8C7AFF",
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
                    legendHtml.push('<span class="chart-legend" style="background-color:' + item.backgroundColor[i] + '"></span>');
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
const toggleNotesBtn = document.querySelector('.toggleNotes');
const notesSection = document.querySelector('.notesSection');

// Retrieve notes from local storage if any
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Function to render notes
function renderNotes() {
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

// Function to toggle the visibility of the notes section
toggleNotesBtn.addEventListener('click', function() {
    if (notesSection.style.display === 'none') {
        notesSection.style.display = 'block';
        toggleNotesBtn.classList.remove('fa-angle-down');
        toggleNotesBtn.classList.add('fa-angle-up');
    } else {
        notesSection.style.display = 'none';
        toggleNotesBtn.classList.remove('fa-angle-up');
        toggleNotesBtn.classList.add('fa-angle-down');
    }
});


// USER GOAL SECTION
// USER GOAL SECTION
document.addEventListener("DOMContentLoaded", () => {
    const editGoalIcon = document.querySelector('.editGoalIcon');
    const editGoalPopupOverlay = document.getElementById('editGoalPopupOverlay');
    const closeEditGoalPopup = document.querySelector('.closeEditGoalPopup');
    const discardGoalChanges = document.getElementById('discardGoalChanges');
    const editGoalForm = document.getElementById('editGoalForm');

    // Open the popup
    editGoalIcon.addEventListener('click', () => {
        editGoalPopupOverlay.style.display = 'flex';
    });

    // Close the popup
    closeEditGoalPopup.addEventListener('click', () => {
        editGoalPopupOverlay.style.display = 'none';
    });

    // Discard changes
    discardGoalChanges.addEventListener('click', () => {
        editGoalPopupOverlay.style.display = 'none';
    });

    // Handle form submission
    editGoalForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const goalTitle = document.querySelector('.goalTitle');
        const goalProgress = document.querySelector('.goalProgress');
        const goalProgressBarDone = document.querySelector('.goalProgressBarDone');

        const newGoalName = document.getElementById('editGoalName').value;
        const newGoalTotal = parseInt(document.getElementById('editGoalTotal').value);
        const newGoalCompleted = parseInt(document.getElementById('editGoalCompleted').value);
        const newGoalProgress = (newGoalCompleted / newGoalTotal) * 100;

        // Update goal title and progress
        goalTitle.textContent = `Goal: ${newGoalName}`;
        goalProgress.textContent = `Progress: ${newGoalCompleted} out of ${newGoalTotal} books`;
        goalProgressBarDone.style.width = `${newGoalProgress}%`;
        goalProgressBarDone.textContent = `${Math.round(newGoalProgress)}%`;
        goalProgressBarDone.setAttribute('goal-done', newGoalProgress);

        // Save changes to local storage
        localStorage.setItem('userGoalName', newGoalName);
        localStorage.setItem('userGoalTotal', newGoalTotal);
        localStorage.setItem('userGoalCompleted', newGoalCompleted);

        editGoalPopupOverlay.style.display = 'none';
    });

    // Load goal details from local storage
    const savedGoalName = localStorage.getItem('userGoalName');
    const savedGoalTotal = parseInt(localStorage.getItem('userGoalTotal'));
    const savedGoalCompleted = parseInt(localStorage.getItem('userGoalCompleted'));

    if (savedGoalName && !isNaN(savedGoalTotal) && !isNaN(savedGoalCompleted)) {
        const goalTitle = document.querySelector('.goalTitle');
        const goalProgress = document.querySelector('.goalProgress');
        const goalProgressBarDone = document.querySelector('.goalProgressBarDone');

        goalTitle.textContent = `Goal: ${savedGoalName}`;
        goalProgress.textContent = `Progress: ${savedGoalCompleted} out of ${savedGoalTotal} books`;
        const savedGoalProgress = (savedGoalCompleted / savedGoalTotal) * 100;
        goalProgressBarDone.style.width = `${savedGoalProgress}%`;
        goalProgressBarDone.textContent = `${Math.round(savedGoalProgress)}%`;
        goalProgressBarDone.setAttribute('goal-done', savedGoalProgress);
    }

});

// FRIEND ACTIVITY
document.addEventListener("DOMContentLoaded", () => {
    const searchFriendIcon = document.querySelector('.searchFriendIcon');
    const dropdownMenu = document.querySelector('.dropdownMenu');
    const friendActivityList = document.querySelector('.friendActivity');

    searchFriendIcon.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '' ? 'block' : 'none';
    });

    document.addEventListener('click', (event) => {
        if (!dropdownMenu.contains(event.target) && !searchFriendIcon.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Load friends from local storage when the page loads
    const savedFriends = JSON.parse(localStorage.getItem('friends')) || [];
    savedFriends.forEach(friendData => {
        const newFriendElement = createFriendElement(friendData);
        friendActivityList.appendChild(newFriendElement);
    });

    const suggestedFriends = [
        { name: "Bambi", img: "https://preview.redd.it/xyyi3hqby5581.jpg?width=1080&crop=smart&auto=webp&s=c6e7c38a06c442a10de1f68e93a04a6750d97058", currentRead: "1984" },
        { name: "Milo", img: "https://external-preview.redd.it/kZdm7jcj4LgWS4H3BpoWcohu1ZJrPwPBk0T7s9Yew3M.jpg?auto=webp&s=825529a29ffc667d8f8c5cfa7a1d515b50c52e25", currentRead: "Jane Eyre" },
        { name: "Lexus", img: "https://preview.redd.it/reddit-meet-my-boy-hope-is-he-cute-v0-8hmjed7ux61a1.jpg?auto=webp&s=992a15701feb459e0309ab205cb7940660f85994", currentRead: "Dracula" }
    ];

    // Filter out already added friends from the suggestedFriends array
    suggestedFriends.forEach((friend, index) => {
        if (!savedFriends.some(savedFriend => savedFriend.name === friend.name)) {
            const friendElement = document.createElement('div');
            friendElement.classList.add('suggestedFriendTab');
            friendElement.innerHTML = `
                <img src="${friend.img}" alt="${friend.name}" class="suggestedFriendImage">
                <span class="suggestedFriendName">${friend.name}</span>
                <i class="fa-solid fa-user-plus addFriendIcon" data-index="${index}"></i>
            `;
            dropdownMenu.appendChild(friendElement);

            // Add event listener to the "Add Friend" button
            const addFriendButton = friendElement.querySelector('.addFriendIcon');
            addFriendButton.addEventListener('click', () => {
                const friendIndex = addFriendButton.dataset.index;
                const friendToAdd = suggestedFriends[friendIndex];
                const newFriendElement = createFriendElement(friendToAdd);

                // Append the new friend to the friend activity list
                friendActivityList.appendChild(newFriendElement);

                // Animate the removal of the suggested friend
                friendElement.classList.add('slide-out');

                // Remove the suggested friend from the DOM after the animation
                setTimeout(() => {
                    friendElement.remove();
                }, 300); // Adjust the timeout to match the duration of your animation

                // Save the new friend to local storage
                const friends = JSON.parse(localStorage.getItem('friends')) || [];
                friends.push(friendToAdd);
                localStorage.setItem('friends', JSON.stringify(friends));

                // Remove the added friend from the suggestedFriends array
                suggestedFriends.splice(friendIndex, 1);
            });
        }
    });

    // Function to create a new friend element with kudos icon
    function createFriendElement(friendData) {
        const newFriendElement = document.createElement('div');
        newFriendElement.classList.add('friend');
        newFriendElement.innerHTML = `
            <img src="${friendData.img}" alt="${friendData.name}" class="friend-image">
            <div class="friend-info">
                <p class="friend-name">${friendData.name}</p>
                <div class="current-read-container">
                    <div class="current-read-info">
                        <p class="current-read">Reading: ${friendData.currentRead}</p>
                    </div>
                    <div class="kudos-container">
                        <i class="fa-regular fa-heart kudos-icon" data-friend-name="${friendData.name}" data-kudos-sent="false"></i>
                        <div class="kudos-dropdown">
                            <p>Kudos to ${friendData.name}!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return newFriendElement;
    }

    // Function to toggle kudos and update local storage
    function toggleKudos(icon, friendName) {
        const kudosSent = icon.dataset.kudosSent === "true";
        icon.dataset.kudosSent = !kudosSent;
        icon.classList.toggle("fa-solid", !kudosSent);
        icon.classList.toggle("fa-regular", kudosSent);
        icon.style.color = kudosSent ? "#341D93" : "#DB206A";

        // Save the kudos state to local storage
        const kudosState = JSON.parse(localStorage.getItem('kudosState')) || {};
        kudosState[friendName] = !kudosSent;
        localStorage.setItem('kudosState', JSON.stringify(kudosState));
    }

    // Load kudos state from local storage and apply it to icons
    const kudosState = JSON.parse(localStorage.getItem('kudosState')) || {};
    document.querySelectorAll('.kudos-icon').forEach((icon) => {
        const friendName = icon.dataset.friendName;
        const kudosSent = kudosState[friendName] || false;
        icon.dataset.kudosSent = kudosSent;
        icon.classList.toggle("fa-solid", kudosSent);
        icon.classList.toggle("fa-regular", !kudosSent);
        icon.style.color = kudosSent ? "#DB206A" : "#341D93";

        // Add event listeners to kudos icons
        icon.addEventListener('click', () => {
            toggleKudos(icon, friendName);
        });

        icon.addEventListener('mouseover', () => {
            if (icon.dataset.kudosSent === "false") {
                icon.style.color = "#3656E3";
            }
        });

        icon.addEventListener('mouseout', () => {
            if (icon.dataset.kudosSent === "false") {
                icon.style.color = "#341D93";
            }
        });

        // Show kudos dropdown on hover
        const kudosDropdown = icon.nextElementSibling;
        icon.addEventListener('mouseover', () => {
            kudosDropdown.style.display = "block";
        });

        document.addEventListener('mouseover', (event) => {
            if (!kudosDropdown.contains(event.target) && !icon.contains(event.target)) {
                kudosDropdown.style.display = "none";
            }
        });
    });
});