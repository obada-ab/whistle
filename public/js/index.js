const burger = document.querySelector(".burger");
const nav = document.querySelector("#nav-menu")

burger.addEventListener('click', function() {
    burger.classList.toggle('is-active');
    nav.classList.toggle('is-active');
});

const submitButtonIcon = document.querySelector('#submit-button-icon');
const form = document.querySelector(".card-form");
const textArea = document.querySelector("#card-textarea");

const button = document.querySelector('#image-button');
const imageInput = document.querySelector('#image-input');
const imagePreview = document.querySelector('#image-preview');
const cardsColumn = document.querySelector('#cards-column');
const feedButton = document.querySelector('#feed-button');
const feedColumn = document.querySelector('#cards-column');
const topButton = document.querySelector('#top-button');
const topColumn = document.querySelector('#top-column');
const profileButton = document.querySelector('#profile-button');
const profileColumn = document.querySelector('#profile-column');
const mainIcon = document.querySelector('#main-icon');

mainIcon.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.scrollIntoView({behavior: 'smooth', block: 'start'});
});

let page = 'feed';
let pageScrolls = {
    feed: 0,
    top: 0,
    profile: 0
}
let pageTargets = {
    feed: feedColumn,
    top: topColumn,
    profile: profileColumn
}
let pageButtons = {
    feed: feedButton,
    top: topButton,
    profile: profileButton
}
let done = {
    feed: false,
    top: false,
    profile: false,
}
let debounce = {
    feed: true,
    top: true,
    profile: true
}
let lastCard = {
    feed: '',
    top: '',
    profile: ''
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    submitButtonIcon.className = 'fas fa-spinner fa-pulse';

    const formData = new FormData(form);
    textArea.value = "";
    imageInput.value = "";

    fetch('/card/new', {
        method: "POST",
        body: formData,
    }).then(() => {
        location.reload();
    })
});

button.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', () => {
    imagePreview.src = URL.createObjectURL(imageInput.files[0]);
});

function onLike(element) {
    console.log(element.dataset.liked);
    fetch('/card/like', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({card_id: element.dataset.id})
    }).then(() => {
        let likes = parseInt(element.lastElementChild.innerHTML);
        console.log(likes);
        if (element.dataset.liked == "true") {
            element.dataset.liked = "false";
            element.classList.remove("active-element");
            likes--;
        } else {
            element.dataset.liked = "true";
            element.classList.add("active-element");
            likes++;
        }
        element.lastElementChild.innerHTML = likes.toString();
    })
}

window.addEventListener('scroll', function() {
    if (done[page]) {
        return;
    }
    loadMoreIfScrolled(page);
});

function loadMoreIfScrolled(page) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        if (debounce[page]) {
            debounce[page] = false;
            fetch('/card/' + page, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({card: lastCard[page]})
            }).then(res => res.json()).then(data => {
                pageTargets[page].insertAdjacentHTML('beforeend', data.content);
                lastCard[page] = data.card;
                if (lastCard[page] == '') {
                    done[page] = true;
                }
            });
            setTimeout(function() {debounce[page] = true;}, 50);
        }
    }
}

loadMoreIfScrolled('profile');
loadMoreIfScrolled('top');
loadMoreIfScrolled('feed');

feedButton.classList.add('active-element');

topButton.addEventListener('click', () => {
    pageChange('top');
});

feedButton.addEventListener('click', () => {
    pageChange('feed');
});

profileButton.addEventListener('click', () => {
    pageChange('profile');
});

function pageChange(targetPage) {
    if (page == targetPage) return;

    pageScrolls[page] = window.pageYOffset;
    page = targetPage;

    for (key in pageTargets) {
        if (key == page) {
            pageTargets[key].style.display = 'block';
        } else {
            pageTargets[key].style.display = 'none';
        }
    }

    for (key in pageButtons) {
        if (key == page) {
            pageButtons[key].classList.add('active-element');
        } else {
            pageButtons[key].classList.remove('active-element');
        }
    }

    window.scrollTo(0, pageScrolls[page]);
}