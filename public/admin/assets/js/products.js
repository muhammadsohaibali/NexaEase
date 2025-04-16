const sidebarToggle = document.createElement("div");
sidebarToggle.className = "sidebar-toggle";
sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".main-header").prepend(sidebarToggle);

sidebarToggle.addEventListener("click", function () {
    const container = document.querySelector(".dashboard-container");
    container.classList.toggle("sidebar-collapsed");
});


document.addEventListener('DOMContentLoaded', function () {
    toggleDivLoader('products-table', 'table', 'loading-overlay', true)

    const productsTableBody = document.querySelector('.products-table tbody');
    const searchInput = document.querySelector('.search-box input');
    const categoryFilter = document.querySelector('.filter-group:nth-child(1) select');
    const statusFilter = document.querySelector('.filter-group:nth-child(2) select');
    const sortFilter = document.querySelector('.filter-group:nth-child(3) select');
    const resetBtn = document.querySelector('.btn-text');
    const categorySelector = document.getElementById('categories-selector')
    const addProductBtn = document.querySelector('.btn-primary');

    const urlParams = new URLSearchParams(window.location.search);
    const productID = urlParams.get('querry');

    let urlproductID;
    if (productID) urlproductID = productID

    let allProducts = [];
    let filteredProducts = [];

    fetchProducts();
    fetchCategories();
    setupEventListeners();

    async function fetchProducts() {
        const CACHE_KEY = 'productsData';

        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { data } = JSON.parse(cachedData);
            allProducts = data;
            filteredProducts = [...allProducts];
            filterProducts();
            updateProductCount();
            fetchFreshProducts();
            return;
        }
        await fetchFreshProducts();
    }

    async function fetchFreshProducts() {
        const CACHE_KEY = 'productsData';

        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Network response was not ok');
            const freshProducts = await response.json();
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { data: oldProducts } = JSON.parse(cachedData);
                const isDifferent = JSON.stringify(oldProducts) !== JSON.stringify(freshProducts);

                if (isDifferent) {
                    notify(
                        'New products available! Click to refresh',
                        'info', () => location.reload()
                    );
                }
            }

            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: freshProducts
            }));

            if (!cachedData) {
                allProducts = freshProducts;
                filteredProducts = [...freshProducts];
                filterProducts();
                updateProductCount();
            }
        } catch (error) {
            console.error('Background products refresh failed:', error);
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Network response was not ok');
            const categories = await response.json()

            categories.forEach(category => categorySelector.innerHTML += `<option>${formatTitle(category)}</option>`)

        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    function formatTitle(str) {
        return str.replace(/-/g, ' ').split(' ').map(word => word.charAt(0)
            .toUpperCase() + word.slice(1).toLowerCase()).join(' ')
    }

    function renderProducts() {
        productsTableBody.innerHTML = '';

        if (filteredProducts.length === 0) {
            productsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-products">No products found matching your criteria</td>
                </tr>
            `;
            return;
        }

        filteredProducts.forEach((product, i) => {
            const row = document.createElement('tr');

            let statusClass, statusText;
            if (product.stock <= 0) {
                statusClass = 'out-of-stock';
                statusText = 'Out of Stock';
            } else if (product.stock <= 10) {
                statusClass = 'low-stock';
                statusText = 'Low Stock';
            } else {
                statusClass = 'available';
                statusText = 'Available';
            }

            const price = product.discounted_price
                ? `<span class="original-price">Rs ${product.discounted_price.toLocaleString()}</span>`
                : `Rs ${product.regular_price.toLocaleString()}`;

            row.innerHTML = `
                <td><div class="product-rank">${i + 1}</div></td>
                <td>
                    <div class="product-cell">
                        <img src="${product.imgs[0] || 'https://via.placeholder.com/60'}" alt="${product.product_name}" />
                        <div class="product-info">
                            <h4>${product.product_name}</h4>
                            <p>SKU: ${product.product_id}</p>
                        </div>
                    </div>
                </td>
                <td>${formatTitle(product.category)}</td>
                <td>${price}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <a style='color:blue; text-decoration:underline' href='/product/?id=${product.product_id}' target='_blank'>
                        View
                    </a>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit-btn" data-id="${product.product_id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" data-id="${product.product_id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            productsTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditProduct);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteProduct);
        });

        toggleDivLoader('products-table', 'table', 'loading-overlay', false)
    }

    function filterProducts() {
        let searchTerm = searchInput.value.toLowerCase().trim();
        const category = categoryFilter.value;
        const status = statusFilter.value;
        const sortBy = sortFilter.value;

        filteredProducts = allProducts.filter(product => {
            if (urlproductID) {
                searchTerm = urlproductID.toLowerCase()
                searchInput.value = urlproductID
                urlproductID = null
            }

            const matchesSearch = product.product_name.toLowerCase().includes(searchTerm) ||
                product.product_id.toLowerCase().includes(searchTerm);

            const matchesCategory = category === 'All Categories' ||
                formatTitle(product.category) === category;

            let matchesStatus = true;
            if (status !== 'All Status') {
                if (status === 'Out of Stock') {
                    matchesStatus = product.stock <= 0;
                } else if (status === 'Low Stock') {
                    matchesStatus = product.stock > 0 && product.stock <= 10;
                } else if (status === 'Available') {
                    matchesStatus = product.stock > 10;
                }
            }

            return matchesSearch && matchesCategory && matchesStatus;
        });

        switch (sortBy) {
            case 'Newest First':
                filteredProducts.sort((a, b) => b.added_timestamp - a.added_timestamp);
                break;
            case 'Oldest First':
                filteredProducts.sort((a, b) => a.added_timestamp - b.added_timestamp);
                break;
            case 'Price: Low to High':
                filteredProducts.sort((a, b) => (a.discounted_price || a.regular_price) - (b.discounted_price || b.regular_price));
                break;
            case 'Price: High to Low':
                filteredProducts.sort((a, b) => (b.discounted_price || b.regular_price) - (a.discounted_price || a.regular_price));
                break;
            // case 'Reviews':
            //     filteredProducts.sort((a, b) => (b.details.reviews?.length || 0) - (a.details.reviews?.length || 0));
            //     break;
            // case 'Rating':
            //     filteredProducts.sort((a, b) => (b.details.reviews?.length || 0) - (a.details.reviews?.length || 0));
            //     break;                
        }

        renderProducts();
        updateProductCount();
    }

    function updateProductCount() {
        const countElement = document.querySelector('.card-header h3');
        if (countElement) {
            countElement.textContent = `All Products (${filteredProducts.length})`;
        }
    }

    function handleEditProduct(e) {
        const productId = e.currentTarget.getAttribute('data-id');
        const product = allProducts.find(p => p.product_id === productId);

        console.log('Edit product:', product);
        alert(`Edit product ${productId} would open here`);
    }

    function handleDeleteProduct(e) {
        const productId = e.currentTarget.getAttribute('data-id');

        if (confirm(`Are you sure you want to delete product ${productId}?`)) {
            console.log('Delete product:', productId);

            allProducts = allProducts.filter(p => p.product_id !== productId);
            filterProducts();

            alert(`Product ${productId} deleted successfully`);
        }
    }

    function setupEventListeners() {
        searchInput.addEventListener('input', debounce(filterProducts, 300));

        categoryFilter.addEventListener('change', filterProducts);
        statusFilter.addEventListener('change', filterProducts);
        sortFilter.addEventListener('change', filterProducts);

        resetBtn.addEventListener('click', resetFilters);
        addProductBtn.addEventListener('click', handleAddProduct);
    }

    function resetFilters() {
        searchInput.value = '';
        categoryFilter.value = 'All Categories';
        statusFilter.value = 'All Status';
        sortFilter.value = 'Newest First';
        filterProducts();
    }

    function handleAddProduct() {
        console.log('Add new product');
        alert('Add product form would open here');
    }

    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
});