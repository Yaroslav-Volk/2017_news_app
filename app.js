// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();
//Напишнм модуль для взаиможействия с сервисом  новостей
const newsService = (function () {
  const apiKey = "da5c2533441649b2ad1a25d304041ce8";
  const apiUrl = "https://newsapi.org/v2"; // смотрим путь в образце запроса на сайте
  // на выходе получаем объект, с методами. реализующие два основных функционала
  // получеие top-headlines и everything
  return {
    topHeadlines(country = "ua", cb) {
      // идеем в документацию, смотрим как получить новости по стране
      //https://newsapi.org/v2/
      // top - headlines ?
      // country = us &
      // apiKey = da5c2533441649b2ad1a25d304041ce8
      //сл-но делаем запрос в виде:
      //http.get(apiUrl + "/top-headlines?country=" + country + "&apiKey=" + apiKey,);
      http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      // анологично для запросов по введенной строке
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];
//  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit(); //инициализация библиотеки материализе
  loadNews();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

// загрузка новстей при оновлнии страницы
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

function onGetResponse(err, res) {
  //  console.log(res);
  // получаем массив объектов вида
  //   0:
  // author: "Ірина Полицька"
  // content: "2020 Apple iPhone SE. , , ""."
  // description: "Навесні 2020 року Apple випустила нове покоління свого доступного смартфона  iPhone SE. Пристрій отримав чималий попит, тож не дивно, що виробник працює над новим поколінням "бюджетника"."
  // publishedAt: "2021-01-21T10:09:00Z"
  // source: {id: null, name: "24tv.ua"}
  // title: "iPhone SE Plus: в мережі з'явилася ймовірна дата виходу та ціна смартфона - 24 Канал"
  // url: "https://tech.24tv.ua/iphone-se-plus-merezhi-zyavilasya-ymovirna-novini-mobilnih-telefoniv_n1518822"
  // urlToImage: "https://24tv.ua/resources/photos/news/202101/1518822.jpg?1611224551000"
  removePreLoader();
  if (err) {
    showAlert(err, "error-msg");
    return;
  }
  if (!res.articles.length) {
    showAlert("Данные по запросу не найдены", "error-msg");
    return;
  }
  renderNews(res.articles);
}

function renderNews(news) {
  const newsContainer = document.querySelector(".row.grid-container");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";
  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });
  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

function newsTemplate({ urlToImage, title, url, description }) {
  return `
  <div class="col s12">
  <div class="card">
    <div class="card-image">
      <img src="${urlToImage}">
      <span class="card-title">${title || ""} </span>
    </div>
  <div class="card-content">
    <p>${description || ""}</p>
  </div>
    <div class="card-action">
      <a href="${url}">Read more</a>
    </div>
  </div>
  </div>
  `;
}

function clearContainer(container) {
  // можно просто очистить container.innerHtml=""
  // или вот так
  // новая логика для меня
  // берем последний элемент
  let child = container.lastElementChild;
  // пока child!=null выполняем цикл
  while (child) {
    container.removeChild(child); // удаляем текщий child
    child = container.lastElementChild; // ищем новый послений элемент, запоминаем его
    // или получаем null, если все элементы удалены
  }
}

function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
  <div class="progress">
      <div class="indeterminate"></div>
  </div>
    `
  );
}

function removePreLoader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
