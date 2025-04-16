// ====================================================================================================

// Utility Functions
const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    return response.json();
};

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

const hideLoadingOverlay = () => {
    document.getElementById("loading-overlay").style.display = "none";
};

// DOM Elements
const domElements = {
    productsContainer: document.querySelector('.products-container'),
    sortSelect: document.getElementById('sort'),
    filterGroups: document.querySelectorAll('.filter-group'),
    clearAllBtn: document.querySelector('.clear-all'),
    viewOptions: document.querySelectorAll('.view-options button'),
    paginationButtons: document.querySelectorAll('.pagination button'),
    pageNumbers: document.querySelectorAll('.page-numbers button'),
    categoryHeader: document.querySelector('.category-header h1'),
    categoryDescription: document.querySelector('.category-description'),
    breadcrumbs: document.querySelector('.breadcrumbs span'),
    searchInput: document.getElementById('searchQuery'),
    clearBtn: document.getElementById('clearSearch'),
    priceRange: document.getElementById('priceRange'),
    currentPriceDisplay: document.getElementById('current-price'),
    productsCount: document.getElementById('products-count')
};

// Application State
const appState = {
    debounceTimer: null,
    currentProducts: [],
    currentCategory: null,
    querryFilteredProducts: [],
    currentFilters: {
        price: [0, 10000],
        categories: [],
        rating: null
    },
    currentSort: 'popular',
    currentPage: 1,
    productsPerPage: 12,
    urlParams: new URLSearchParams(window.location.search)
};

// Initialization
const init = () => {
    updateUserInfo();
    const categoryParam = appState.urlParams.get('category');

    if (categoryParam) {
        loadCategory(categoryParam);
    } else {
        domElements.categoryHeader.style.display = 'none';
        loadAllCategories();
        loadAllProducts();
    }

    setupEventListeners();
};

function renderProductCount(count) {
    const productCount = domElements.productsCount
    const style = productCount.style
    if (count) {
        style.display = 'block';
        productCount.textContent = `${count} ${count === 1 ? 'Product' : 'Products'} Found`;
    }
    else {
        style.display = 'none'
        productCount.textContent = ``;
    }
}

const setupEventListeners = () => {
    domElements.sortSelect.addEventListener('change', (e) => {
        appState.currentSort = e.target.value;
        renderProducts();
    });

    domElements.filterGroups.forEach(group => {
        const header = group.querySelector('.filter-header');
        header.addEventListener('click', () => {
            group.querySelector('.filter-content').classList.toggle('active');
            const icon = header.querySelector('i');
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        });
    });

    domElements.priceRange.addEventListener('input', (e) => {
        appState.currentFilters.price[1] = Math.floor(parseInt(e.target.value) / 100) * 100;
        domElements.currentPriceDisplay.textContent = `- ${Math.floor(parseInt(e.target.value) / 100) * 100}`;
        renderProducts();
    });

    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const value = e.target.id;
            if (e.target.checked) {
                appState.currentFilters.categories.push(value);
            } else {
                appState.currentFilters.categories = appState.currentFilters.categories.filter(cat => cat !== value);
            }
            renderProducts();
        });
    });

    document.querySelectorAll('.filter-content input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                appState.currentFilters.rating = parseInt(e.target.id.replace('rating', ''));
            }
            renderProducts();
        });
    });

    domElements.clearAllBtn.addEventListener('click', resetFilters);

    domElements.viewOptions.forEach(button => {
        button.addEventListener('click', () => {
            domElements.viewOptions.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProducts();
        });
    });

    setupPaginationListeners();
    setupSearchListeners();
};

const setupPaginationListeners = () => {
    domElements.paginationButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('prev-page') && appState.currentPage > 1) {
                appState.currentPage--;
            } else if (button.classList.contains('next-page') &&
                appState.currentPage < Math.ceil(appState.currentProducts.length / appState.productsPerPage)) {
                appState.currentPage++;
            }
            renderProducts();
        });
    });

    domElements.pageNumbers.forEach(button => {
        if (!button.textContent.includes('...')) {
            button.addEventListener('click', () => {
                appState.currentPage = parseInt(button.textContent);
                renderProducts();
            });
        }
    });
};

const setupSearchListeners = () => {
    domElements.searchInput.addEventListener('input', (e) => { debouncedSearch(e.target.value) });

    domElements.clearBtn.addEventListener('click', () => {
        domElements.searchInput.value = '';
        domElements.searchInput.focus();
        domElements.clearBtn.style.opacity = '0';
        appState.querryFilteredProducts = [];
        renderProducts();
    });
};

const resetFilters = () => {
    domElements.priceRange.value = 10000;
    appState.currentFilters.price = [0, 10000];

    document.querySelectorAll('.filter-content input').forEach(input => { input.checked = false; });

    appState.currentFilters = { price: [0, 10000], categories: [], rating: null };

    domElements.searchInput.value = '';
    domElements.clearBtn.style.opacity = '0';
    appState.querryFilteredProducts = [];

    renderProducts();
};

const loadCategory = async (categoryName) => {
    try {
        const formatTitle = str => str.replace(/-/g, ' ').split(' ').map(word => word.charAt(0)
            .toUpperCase() + word.slice(1).toLowerCase()).join(' ');

        domElements.categoryHeader.textContent = formatTitle(categoryName);
        domElements.breadcrumbs.textContent = formatTitle(categoryName);
        domElements.categoryDescription.textContent =
            `Explore our curated selection of premium ${formatTitle(categoryName)} to elevate your lifestyle.`;

        document.getElementById('filter-group-categories').style.display = 'none';

        const response = await fetch(`/api/category/${categoryName}`);
        if (!response.ok) throw new Error('Failed to fetch category');

        const data = await response.json();
        appState.currentProducts = data || [];
        appState.currentCategory = categoryName;

        updateFiltersForCategory(data.filters);
        renderProducts();
    } catch (error) {
        console.error('Error loading category:', error);
        domElements.productsContainer.innerHTML =
            `<p class="error">Error loading products. Please try again later.</p>`;
    }
};

const loadAllCategories = async () => {
    try {
        const response = await fetch('/api/categories/');
        if (!response.ok) throw new Error('Failed to fetch categories');

        const categories = await response.json();
        const categoriesContainer = document.querySelector('.filter-group:nth-child(3) .filter-content');
        categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            checkboxItem.innerHTML = `
                <input type="checkbox" id="${category}">
                <label for="${category}">${category}</label>
            `;
            categoriesContainer.appendChild(checkboxItem);

            checkboxItem.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    appState.currentFilters.categories.push(category);
                } else {
                    appState.currentFilters.categories = appState.currentFilters.categories.filter(cat => cat !== category);
                }
                renderProducts();
            });
        });

    } catch (error) {
        console.error('Error loading categories:', error);
    }
};

const loadAllProducts = async () => {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');

        const products = await response.json();
        appState.currentProducts = products;
        appState.currentCategory = null;
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        domElements.productsContainer.innerHTML =
            `<p class="error">Error loading products. Please try again later.</p>`;
    }
};

const updateFiltersForCategory = (filters) => {
    appState.currentFilters = {
        price: [0, 10000],
        categories: [appState.currentCategory],
        rating: null
    };

    domElements.priceRange.value = 10000;
    document.querySelectorAll('.filter-content input').forEach(input => {
        input.checked = false;
    });

    const categoryCheckbox = document.getElementById(appState.currentCategory);
    if (categoryCheckbox) {
        categoryCheckbox.checked = true;
    }
};

const debounceSearch = (func, delay = 300) => {
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(appState.debounceTimer);
        appState.debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
};

const performSearch = (query) => {
    if (query.trim().length > 0) {
        domElements.clearBtn.style.opacity = '1';
        appState.querryFilteredProducts = appState.currentProducts
            .filter(product =>
                product.product_name.toLowerCase().includes(query.trim().toLowerCase())
            );
        renderProducts();
    } else {
        domElements.clearBtn.style.opacity = '0';
        appState.querryFilteredProducts = [];
        renderProducts();
    }
};

const debouncedSearch = debounceSearch(performSearch);

const filterProducts = () => {
    let filteredProducts = appState.querryFilteredProducts.length
        ? [...appState.querryFilteredProducts] : [...appState.currentProducts]

    const queryParam = appState.urlParams.get('querry');

    if (queryParam && queryParam.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            product.product_name.toLowerCase().includes(queryParam.toLowerCase())
        );
    }

    if (appState.currentFilters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            appState.currentFilters.categories.includes(product.category)
        );
    }

    filteredProducts = filteredProducts.filter(product => {
        const price = product.discounted_price ?? product.regular_price;
        return price >= appState.currentFilters.price[0] &&
            price <= appState.currentFilters.price[1];
    });

    if (appState.currentFilters.rating !== null) {
        filteredProducts = filteredProducts.filter(product =>
            product.rating >= appState.currentFilters.rating
        );
    }

    switch (appState.currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => {
                const priceA = a.discounted_price ?? a.regular_price;
                const priceB = b.discounted_price ?? b.regular_price;
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => {
                const priceA = a.discounted_price ?? a.regular_price;
                const priceB = b.discounted_price ?? b.regular_price;
                return priceB - priceA;
            });
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) =>
                new Date(b.added_timestamp) - new Date(a.added_timestamp));
            break;
    }

    if (filteredProducts.length !== appState.currentProducts.length)
        renderProductCount(filteredProducts.length)
    else
        renderProductCount(null)

    return filteredProducts;
};

const renderProducts = () => {
    const filteredProducts = filterProducts();
    const startIdx = (appState.currentPage - 1) * appState.productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIdx, startIdx + appState.productsPerPage);

    domElements.productsContainer.innerHTML = '';

    if (filteredProducts.length === 0) {
        const searchQuery = domElements.searchInput.value.trim() || appState.urlParams.get('querry');
        if (searchQuery) {
            domElements.productsContainer.innerHTML =
                `<p class="no-products">No products found for "${searchQuery}". Try different keywords.</p>`;
        } else {
            domElements.productsContainer.innerHTML =
                `<p class="no-products">No products match your filters. Try adjusting your criteria.</p>`;
        }
        hideLoadingOverlay();
        return;
    }

    paginatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        domElements.productsContainer.appendChild(productCard);
    });

    updatePagination(filteredProducts.length);
    hideLoadingOverlay();
};

const createProductCard = (product) => {
    const { product_id, imgs, product_name, discounted_price, details } = product;

    const productCard = document.createElement("div");
    productCard.className = "modern-product-container";
    productCard.id = product_id;
    productCard.onclick = () => location.assign(`/product/?id=${product_id}`);

    const productImageDiv = document.createElement("div");
    productImageDiv.className = "modern-product-image";

    const productImg = document.createElement("img");
    productImg.src = imgs[0];
    productImg.alt = product_name;
    productImg.style.objectFit = "cover";

    const cartBtn = createCartButton(product_id);

    productImageDiv.append(productImg, cartBtn);

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "modern-details-div";

    const upperBorder = document.createElement("div");
    upperBorder.className = "modern-upper-border";

    const productName = document.createElement("div");
    productName.className = "modern-product-name";
    productName.textContent = product_name;

    const productRating = document.createElement("div");
    productRating.innerHTML = createRatingHTML(details.reviews);

    const productPrice = document.createElement("div");
    productPrice.className = "modern-product-price";
    productPrice.textContent = `Rs ${discounted_price}`;

    detailsDiv.append(
        upperBorder.cloneNode(),
        productRating,
        upperBorder.cloneNode(),
        productName,
        upperBorder.cloneNode(),
        productPrice
    );

    const lowerBorder = document.createElement("div");
    lowerBorder.className = "modern-lower-border";

    productCard.append(productImageDiv, detailsDiv, lowerBorder);
    return productCard;
};

const createCartButton = (productId) => {
    const cartBtn = document.createElement("button");
    cartBtn.className = "modern-cart-btn";

    const iconContainer = document.createElement("span");
    iconContainer.className = "modern-icon-container";

    const cartIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    cartIcon.setAttribute("height", "1em");
    cartIcon.setAttribute("viewBox", "0 0 576 512");
    cartIcon.setAttribute("fill", "rgb(17, 17, 17)");
    cartIcon.className = "modern-cart-icon";

    const cartPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cartPath.setAttribute("d", "M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z");
    cartIcon.appendChild(cartPath);
    iconContainer.appendChild(cartIcon);

    const cartText = document.createElement("p");
    cartText.className = "modern-cart-text";

    cartBtn.append(iconContainer, cartText);

    cartBtn.addEventListener("click", (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        addToCart(productId);
    });

    return cartBtn;
};

const createRatingHTML = (reviews) => {
    const avg = !reviews?.length ? 0 :
        Math.round(reviews.reduce((t, r) => t + (r.rating || 0), 0) / reviews.length * 10) / 10;

    return `
        <div class="product-rating" aria-label="Rating: ${avg} out of 5">
          <div class="stars" role="img">
            ${'<span class="star filled">★</span>'.repeat(Math.floor(avg))}
            ${avg % 1 >= 0.5 ? '<span class="star half-filled">★</span>' : ''}
            ${'<span class="star">★</span>'.repeat(5 - Math.floor(avg) - (avg % 1 >= 0.5 ? 1 : 0))}
            <span class="rating-count">(${reviews?.length || 0} ${reviews?.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>`;
};

const updateUserInfo = async () => {
    try {
        const userInfo = await fetchData("/api/me/info");
        document.getElementById("cart-quantity").textContent = Object.keys(userInfo.cart).length;
    } catch (error) {
        console.warn("User is not Authenticated");
    }
};

const addToCart = async (productId) => {
    try {
        const res = await fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId }),
        });

        const data = await res.json();

        if (res.status === 401 && data.redirect)
            return (window.location.href = `/${data.redirect}`);

        notify(data.message, data.type, 3, () => location.assign('/cart'));
        updateUserInfo();
    } catch (err) {
        console.error("Add to Cart Failed:", err);
    }
};

const updatePagination = (totalProducts) => {
    const totalPages = Math.ceil(totalProducts / appState.productsPerPage);
    const paginationContainer = document.querySelector('.pagination');

    paginationContainer.querySelector('.prev-page').disabled = appState.currentPage === 1;
    paginationContainer.querySelector('.next-page').disabled = appState.currentPage === totalPages;

    const pageNumbersContainer = document.querySelector('.page-numbers');
    pageNumbersContainer.innerHTML = '';

    addPageNumber(1, pageNumbersContainer);

    if (appState.currentPage > 3) {
        addEllipsis(pageNumbersContainer);
    }

    const startPage = Math.max(2, appState.currentPage - 1);
    const endPage = Math.min(totalPages - 1, appState.currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i, pageNumbersContainer);
    }

    if (appState.currentPage < totalPages - 2) {
        addEllipsis(pageNumbersContainer);
    }

    if (totalPages > 1) {
        addPageNumber(totalPages, pageNumbersContainer);
    }
};

const addPageNumber = (page, container) => {
    const button = document.createElement('button');
    button.textContent = page;

    if (page === appState.currentPage) {
        button.classList.add('active');
    }

    button.addEventListener('click', () => {
        appState.currentPage = page;
        renderProducts();
    });

    container.appendChild(button);
};

const addEllipsis = (container) => {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    container.appendChild(ellipsis);
};

// Initializing
document.addEventListener('DOMContentLoaded', init);