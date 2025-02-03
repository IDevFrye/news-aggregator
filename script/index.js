import { API_KEY, API_URL_HEADLINES, API_URL_SEARCH } from "./config.js";

const fetchNews = async (url) => {
  try {
    const response = await fetch(url, {
      headers: { "X-Api-Key": API_KEY },
    });
    if (!response.ok) throw new Error("Ошибка загрузки данных");
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const renderNews = (news, container, title = "", id) => {
  if (!news.length) {
    container.innerHTML = `
    ${title ? `
    <div class="title-wrapper">
      <div class="container">
        <h2 class="title">${title}</h2>
      </div>
    </div>` : ""}
    <section class="news">
      <h2 class="visually-hidden">Список новостей</h2>
      <div class="container">
        <ul class="news-list" id="${id}">
          <p>Новостей нет</p>
        </ul>
      </div>
    </section>`;
    return;
  } else {
    container.innerHTML = `
    ${title ? `
    <div class="title-wrapper">
      <div class="container">
        <h2 class="title">${title}</h2>
      </div>
    </div>` : ""}
    <section class="news">
      <h2 class="visually-hidden">Список новостей</h2>
      <div class="container">
        <ul class="news-list" id="${id}">
          ${news
            .map(
              ({ urlToImage, title, url, description, publishedAt, author }) => `
                <li class="news-item">
                  <img src="./img/unsplash.png" data-src="${urlToImage || './img/unsplash.png'}" alt="${title}" class="news-image lazy-load">
                  <h3 class="news-title">
                    <a href="${url}" target="_blank" class="news-link">${title}</a>
                  </h3>
                  <p class="news-description">${description || "Нет описания"}</p>
                  <div class="news-footer">
                    <time class="news-datetime" datetime="${publishedAt}">
                      <span class="news-date">${new Date(publishedAt).toLocaleDateString()}</span> ${new Date(publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                    <p class="news-author">${author || "Неизвестный"}</p>
                  </div>
                </li>`
            )
            .join("")}
        </ul>
      </div>
    </section>`;
    lazyLoadImages();
  }
};

const lazyLoadImages = () => {
  const images = document.querySelectorAll(".lazy-load");
  images.forEach(img => {
    const src = img.getAttribute("data-src");
    if (!src) return;
    
    const tempImg = new Image();
    tempImg.src = src;
    tempImg.onload = () => {
      img.src = src;
    };
  });
};

const loadHeadlines = async (country = "ru") => {
  const freshNewsContainer = document.getElementById("fresh-results");
  freshNewsContainer.innerHTML = "<img src='./img/preload.png' class='preloader' alt='Загрузка...'>";
  const news = await fetchNews(`${API_URL_HEADLINES}${country}&pageSize=8`);
  renderNews(news, freshNewsContainer, "Свежие новости", "fresh-news");
};

const handleSearch = async (event) => {
  event.preventDefault();

  const searchInput = document.querySelector(".search-input");
  const countrySelect = document.querySelector(".js-choice");
  const searchResultsContainer = document.getElementById("search-results");
  const freshNewsContainer = document.getElementById("fresh-results");

  const query = searchInput.value.trim();
  const country = countrySelect.value || "us";

  if (!query) {
    alert("Введите запрос для поиска!");
    return;
  }

  searchResultsContainer.innerHTML = "<img src='./img/preload.png' class='preloader' alt='Загрузка...'>";

  try {
    const [searchResults, headlines] = await Promise.all([
      fetchNews(`${API_URL_SEARCH}${encodeURIComponent(query)}&pageSize=8`),
      fetchNews(`${API_URL_HEADLINES}${country}&pageSize=4`),
    ]);

    searchResultsContainer.innerHTML = "";
    renderNews(searchResults, searchResultsContainer, `Результаты поиска по запросу: ${query}`, "search-news");
    renderNews(headlines, freshNewsContainer, "Дополнительные свежие новости", "extra-news");
  } catch (error) {
    searchResultsContainer.innerHTML = "<p>Ошибка загрузки данных</p>";
  }
};

export const init = () => {
  const form = document.querySelector(".form-search");
  const countrySelect = document.querySelector(".js-choice");

  form.addEventListener("submit", handleSearch);
  countrySelect.addEventListener("change", () => loadHeadlines(countrySelect.value));
  
  loadHeadlines(countrySelect.value || "us");
};
