document.addEventListener('DOMContentLoaded', function() {
    // Инициализация вкладок Materialize с использованием опции onShow
    var tabsElement = document.querySelector('.tabs');
    var tabsInstance = M.Tabs.init(tabsElement, {
        onShow: function(tab) {
            const category = tab.getAttribute('id');
            if (category === 'manual-request') {
                // Не загружаем данные автоматически для manual-request
                return;
            }
            loadData(category);
        }
    });

    // Инициализация селекта
    var selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);

    // Загружаем данные для активной вкладки по умолчанию
    const activeTab = document.querySelector('.tabs .tab a.active');
    if (activeTab) {
        const category = activeTab.getAttribute('href').substring(1);
        if (category !== 'manual-request') {
            loadData(category);
        }
    }

    // Обработчик кнопки отправки запроса
    const manualRequestButton = document.getElementById('manual-request-button');
    manualRequestButton.addEventListener('click', function() {
        const categorySelect = document.getElementById('category-select');
        const category = categorySelect.value;

        const searchInput = document.getElementById('search-input');
        const searchQuery = searchInput.value.trim();

        const limitInput = document.getElementById('limit-input');
        const limit = parseInt(limitInput.value);

        if (!category) {
            M.toast({html: 'Please select a category'});
            return;
        }

        sendManualRequest(category, searchQuery, limit);
    });
});

function loadData(category) {
    const contentDiv = document.getElementById(category);
    contentDiv.innerHTML = '<div class="progress"><div class="indeterminate"></div></div>';

    fetch(`https://swapi.dev/api/${category}/`)
        .then(response => response.json())
        .then(data => displayData(data.results, category))
        .catch(error => {
            contentDiv.innerHTML = '<p>Ошибка загрузки данных.</p>';
            console.error(error);
        });
}

function sendManualRequest(category, searchQuery, limit) {
    const manualContentDiv = document.getElementById('manual-content');
    manualContentDiv.innerHTML = '<div class="progress"><div class="indeterminate"></div></div>';

    let url = `https://swapi.dev/api/${category}/`;

    if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let results = data.results;
            if (limit && limit > 0) {
                results = results.slice(0, limit);
            }
            displayManualData(results, category);
        })
        .catch(error => {
            manualContentDiv.innerHTML = '<p>Ошибка загрузки данных.</p>';
            console.error(error);
        });
}

function displayData(items, category) {
    const contentDiv = document.getElementById(category);
    contentDiv.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');

        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const cardTitle = document.createElement('span');
        cardTitle.classList.add('card-title');

        // Устанавливаем заголовок карточки
        if (category === 'films') {
            cardTitle.textContent = item.title;
        } else {
            cardTitle.textContent = item.name;
        }

        cardContent.appendChild(cardTitle);

        // Создаем список свойств
        const list = document.createElement('ul');
        list.classList.add('collection');

        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                // Пропускаем поля 'created', 'edited', 'url'
                if (key === 'created' || key === 'edited' || key === 'url') {
                    continue;
                }

                let value = item[key];

                // Проверяем на пустое значение
                if (
                    value === null ||
                    value === undefined ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    continue; // Пропускаем поля с пустыми значениями
                }

                // Преобразуем массивы в строки
                if (Array.isArray(value)) {
                    // Проверяем, содержит ли массив ссылки
                    if (value.length > 0 && isURL(value[0])) {
                        continue; // Пропускаем поля, если в них есть ссылки
                    }
                    value = value.join(', ');
                } else if (typeof value === 'string') {
                    // Проверяем, является ли значение ссылкой
                    if (isURL(value)) {
                        continue; // Пропускаем поля, если в них есть ссылки
                    }
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }

                const listItem = document.createElement('li');
                listItem.classList.add('collection-item');

                // Создаем элемент для названия поля и значения без двоеточия
                const fieldContent = document.createElement('span');
                fieldContent.classList.add('field-content');
                fieldContent.innerHTML = `<span class="field-name">${key}</span> <span class="field-value">${value}</span>`;

                listItem.appendChild(fieldContent);
                list.appendChild(listItem);
            }
        }

        cardContent.appendChild(list);
        card.appendChild(cardContent);
        contentDiv.appendChild(card);
    });
}

function displayManualData(items, category) {
    const manualContentDiv = document.getElementById('manual-content');
    manualContentDiv.innerHTML = '';

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index; // Сохраняем индекс карточки

        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const cardTitle = document.createElement('span');
        cardTitle.classList.add('card-title');

        // Устанавливаем заголовок карточки
        if (category === 'films') {
            cardTitle.textContent = item.title;
        } else {
            cardTitle.textContent = item.name;
        }

        cardContent.appendChild(cardTitle);

        // Создаем список свойств
        const list = document.createElement('ul');
        list.classList.add('collection');

        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                // Пропускаем поля 'created', 'edited', 'url'
                if (key === 'created' || key === 'edited' || key === 'url') {
                    continue;
                }

                let value = item[key];

                // Проверяем на пустое значение
                if (
                    value === null ||
                    value === undefined ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    continue; // Пропускаем поля с пустыми значениями
                }

                // Преобразуем массивы в строки
                if (Array.isArray(value)) {
                    // Проверяем, содержит ли массив ссылки
                    if (value.length > 0 && isURL(value[0])) {
                        continue; // Пропускаем поля, если в них есть ссылки
                    }
                    value = value.join(', ');
                } else if (typeof value === 'string') {
                    // Проверяем, является ли значение ссылкой
                    if (isURL(value)) {
                        continue; // Пропускаем поля, если в них есть ссылки
                    }
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }

                const listItem = document.createElement('li');
                listItem.classList.add('collection-item');

                // Создаем элемент для названия поля и значения без двоеточия
                const fieldContent = document.createElement('span');
                fieldContent.classList.add('field-content');
                fieldContent.innerHTML = `<span class="field-name">${key}</span> <span class="field-value">${value}</span>`;

                listItem.appendChild(fieldContent);
                list.appendChild(listItem);
            }
        }

        cardContent.appendChild(list);
        card.appendChild(cardContent);

        // Добавляем кнопки "Hide", "Move Up", "Move Down"
        const cardAction = document.createElement('div');
        cardAction.classList.add('card-action');

        // Кнопка "Hide"
        const hideButton = document.createElement('a');
        hideButton.href = '#!';
        hideButton.textContent = 'Hide';
        hideButton.classList.add('btn-small', 'red', 'darken-1');
        hideButton.style.marginRight = '5px';
        hideButton.addEventListener('click', function() {
            card.remove();
        });

        // Кнопка "Move Up"
        const moveUpButton = document.createElement('a');
        moveUpButton.href = '#!';
        moveUpButton.textContent = 'Move Up';
        moveUpButton.classList.add('btn-small', 'blue', 'darken-1');
        moveUpButton.style.marginRight = '5px';
        moveUpButton.addEventListener('click', function() {
            const previousCard = card.previousElementSibling;
            if (previousCard) {
                manualContentDiv.insertBefore(card, previousCard);
            }
        });

        // Кнопка "Move Down"
        const moveDownButton = document.createElement('a');
        moveDownButton.href = '#!';
        moveDownButton.textContent = 'Move Down';
        moveDownButton.classList.add('btn-small', 'blue', 'darken-1');
        moveDownButton.addEventListener('click', function() {
            const nextCard = card.nextElementSibling;
            if (nextCard) {
                manualContentDiv.insertBefore(nextCard, card);
            }
        });

        cardAction.appendChild(hideButton);
        cardAction.appendChild(moveUpButton);
        cardAction.appendChild(moveDownButton);

        card.appendChild(cardAction);

        manualContentDiv.appendChild(card);
    });
}

// Функция для проверки, является ли строка URL
function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}
