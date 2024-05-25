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

      const bookProgressInfo = document.createElement("div");
      bookProgressInfo.classList.add("bookProgressInfo");

      bookProgressInfo.innerHTML = `
    <div class="detailsWrapper">
      <img src="${bookCover}" alt="Book Cover" class="bookCover">
      <div class="bookDetails">
        <h2 class="bookTitle">${bookTitle}</h2>
        <p class="bookAuthor">by ${bookAuthor}</p>
        <p class="bookDescription">${bookDescription}</p>
      </div>
      <i class="fa-solid fa-ellipsis meatball-icon"></i>
    </div>
    <div class="progress">
      <div class="progress-done" data-done="0">0%</div>
    </div>
  `;

      currentReadInfo.appendChild(bookProgressInfo);

      // Re-initialize meatball icon click event
      initializeMeatballIconClick();

      popupOverlay.style.display = "none";
      addBookForm.reset();
  });

  // Function to initialize meatball icon click event
  function initializeMeatballIconClick() {
      const meatballIcons = document.querySelectorAll('.meatball-icon');
      const editPopupOverlay = document.getElementById('editPopupOverlay');
      const closeButton = editPopupOverlay.querySelector('.close-button');
      const saveChangesButton = document.getElementById('saveChangesBtn');
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
