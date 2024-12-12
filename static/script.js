async function fetchCategories() {
    try {
        const response = await fetch('/categories');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categories = await response.json();
        const categoryManager = document.getElementById('categoryManager');

        categoryManager.innerHTML = '';
        const catList = document.createElement('ul');
        catList.className = 'list-group mb-5';
        categoryManager.appendChild(catList);

        categories.forEach(category => {
            const categoryElement = document.createElement('li');
            categoryElement.className = 'list-group-item'
            categoryElement.textContent = category.name;
            catList.appendChild(categoryElement);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function fetchUsers() {
    try {
        const response = await fetch('/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        const categoryManager = document.getElementById('userManager');

        categoryManager.innerHTML = '';
        const userTable = document.createElement('table');
        userTable.className = 'table';
        categoryManager.appendChild(userTable);
        const tableHead = document.createElement('thead');
        const tableBody = document.createElement('tbody');
        tableHead.innerHTML = `
        <tr>
            <th scope="col">Id</th>
            <th scope="col">Imię</th>
            <th scope="col">Nazwisko</th>
            <th scope="col">Rok urodzenia</th>
            <th scope="col"></th>
        </tr>`;
        userTable.appendChild(tableHead);
        userTable.appendChild(tableBody);

        users.forEach(user => {
            const userElement = document.createElement('tr');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <td>${user.id}</td> 
                <td>${user.name}</td>
                <td>${user.surname}</td>
                <td>${user.born}</td>
                <td><button class="btn btn-secondary" onclick="fetchUserProducts('${user.id}')">Pokaż kupione przedmioty</button></td>
            `;
            tableBody.appendChild(userElement);
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

async function fetchUserProducts(uuid) {
    try {
        console.log(uuid)
        const response = await fetch(`/users/${uuid}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        const productManager = document.getElementById('userProducts');

        productManager.innerHTML = '';
        const productTable = document.createElement('table');
        productTable.className = 'table';
        productManager.appendChild(productTable);
        const tableHead = document.createElement('thead');
        const tableBody = document.createElement('tbody');
        tableHead.innerHTML = `
        <tr>
            <th scope="col">Id</th>
            <th scope="col">Nazwa</th>
            <th scope="col">Cena</th>
        </tr>`;
        productTable.appendChild(tableHead);
        productTable.appendChild(tableBody);

        users.forEach(product => {
            const productElement = document.createElement('tr');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <td>${product.id}</td> 
                <td>${product.name}</td>
                <td>${product.price}</td>
            `;
            tableBody.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function fetchProducts() {
    try {
        const response = await fetch('/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        const productManager = document.getElementById('productsManager');

        productManager.innerHTML = '';
        const productTable = document.createElement('table');
        productTable.className = 'table';
        productManager.appendChild(productTable);
        const tableHead = document.createElement('thead');
        const tableBody = document.createElement('tbody');
        tableHead.innerHTML = `
        <tr>
            <th scope="col">Id</th>
            <th scope="col">Nazwa</th>
            <th scope="col">Cena</th>
            <th scope="col">Kategoria</th>
            <th scope="col"></th>
            <th scope="col"></th>
        </tr>`;
        productTable.appendChild(tableHead);
        productTable.appendChild(tableBody);

        users.forEach(product => {
            const userElement = document.createElement('tr');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <td>${product.id}</td> 
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.category}</td>
                <td><button class="btn btn-secondary" onclick="fetchReviews('${product.id}')">Pokaż opinie</button></td>
                <td><button class="btn btn-secondary" onclick="addReviewWindow('${product.id}')">Dodaj opinię</button></td>
            `;
            tableBody.appendChild(userElement);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function addReviewWindow(uuid) {
    const reviewsManager = document.getElementById('productReviews');

    reviewsManager.innerHTML = '';
    
    reviewsManager.innerHTML = `<div class="input-group mb-3">
                        <input type="text" id="userReviewId" class="form-control" placeholder="Id">
                        <input type="number" min="1" max="5" id="reviewRating" class="form-control" placeholder="Ocena">
                        <input type="text" id="reviewComment" class="form-control" placeholder="Komentarz">
                        <button class="btn btn-secondary btn-lg" onclick="addReview('${uuid}')">Dodaj opinię</button>
                    </div>`;
}

async function addReview(uuid) {
    console.log("add review");
    const userId = document.getElementById('userReviewId').value.trim();
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;

    if (!userId || !rating || !comment) {
        alert('Proszę uzupełnić wszystkie pola.');
        return;
    }

    try {
        const response = await fetch(`/products/${uuid}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId, rating: rating, comment: comment }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const reviewStatus = document.getElementById('reviewStatus');

        reviewStatus.textContent = `Sukces!`;
        reviewStatus.style.color = 'green';

        document.getElementById('userReviewId').value = '';
        document.getElementById('reviewRating').value = '';
        document.getElementById('reviewComment').value = '';
    } catch (error) {
        console.error('Error adding user:', error);

        const userStatus = document.getElementById('reviewStatus');
        userStatus.textContent = 'Błąd, spróbuj ponownie.';
        userStatus.style.color = 'red';
    }
}
async function fetchReviews(uuid) {
    try {
        console.log(uuid)
        const response = await fetch(`/products/${uuid}/reviews`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        const reviewsManager = document.getElementById('productReviews');

        reviewsManager.innerHTML = '';
        const reviewTable = document.createElement('table');
        reviewTable.className = 'table';
        reviewsManager.appendChild(reviewTable);
        const tableHead = document.createElement('thead');
        const tableBody = document.createElement('tbody');
        tableHead.innerHTML = `
        <tr>
            <th scope="col">Imię</th>
            <th scope="col">Ocena</th>
            <th scope="col">Komentarz</th>
        </tr>`;
        reviewTable.appendChild(tableHead);
        reviewTable.appendChild(tableBody);

        users.forEach(review => {
            const productElement = document.createElement('tr');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <td>${review.user}</td> 
                <td>${review.rating}</td>
                <td>${review.comment}</td>
            `;
            tableBody.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

async function addCategory() {
    const inputField = document.getElementById('newCategoryInput');
    const trimmedInput = inputField.value.trim();
    const categoryName = trimmedInput.replace(/^./, char => char.toUpperCase());

    if (!categoryName) {
        alert('Please enter a category name.');
        return;
    }

    try {
        const response = await fetch('/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: categoryName }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newCategory = await response.json();
        alert(`Category "${newCategory.name}" has been added.`);
        
        inputField.value = '';

        fetchCategories();
    } catch (error) {
        console.error('Error adding category:', error);
    }
}

async function addUser() {
    const name = document.getElementById('userName').value.trim();
    const surname = document.getElementById('userSurname').value.trim();
    const born = document.getElementById('userBorn').value;

    if (!name || !surname || !born) {
        alert('Proszę uzupełnić wszystkie pola.');
        return;
    }

    try {
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, surname, born }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const userStatus = document.getElementById('userStatus');

        userStatus.textContent = `Sukces! ID: ${result.id}`;
        userStatus.style.color = 'green';

        document.getElementById('userName').value = '';
        document.getElementById('userSurname').value = '';
        document.getElementById('userBorn').value = '';
    } catch (error) {
        console.error('Error adding user:', error);

        const userStatus = document.getElementById('userStatus');
        userStatus.textContent = 'Błąd, spróbuj ponownie.';
        userStatus.style.color = 'red';
    }
}

async function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value.trim();

    if (!name || isNaN(price) || !category) {
        alert('Proszę uzupełnić wszystkie pola.');
        return;
    }

    try {
        const response = await fetch('/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, price, category }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const productStatus = document.getElementById('productStatus');

        productStatus.textContent = `Sukces! ID: ${result.id}`;
        productStatus.style.color = 'green';

        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productCategory').value = '';
    } catch (error) {
        console.error('Error adding product:', error);

        const productStatus = document.getElementById('productStatus');
        productStatus.textContent = 'Błąd, spróbuj ponownie.';
        productStatus.style.color = 'red';
    }
}

async function fetchRecommendations() {
    const userId = document.getElementById('recommendationId').value.trim();
    if (!userId) {
        alert('Proszę uzupełnić wszystkie pola.');
        return;
    }
    try {
        const response = await fetch(`/users/${userId}/recommendations`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const recoms = await response.json();
        console.log(recoms);
        const recommendations = document.getElementById('recommendations');

        recommendations.innerHTML = '';
        const productTable = document.createElement('table');
        productTable.className = 'table';
        recommendations.appendChild(productTable);
        const tableHead = document.createElement('thead');
        const tableBody = document.createElement('tbody');
        tableHead.innerHTML = `
        <tr>
            <th scope="col">Id</th>
            <th scope="col">Nazwa</th>
            <th scope="col">Cena</th>
            <th scope="col">Wynik</th>
        </tr>`;
        productTable.appendChild(tableHead);
        productTable.appendChild(tableBody);

        recoms.forEach(recomendation => {
            const userElement = document.createElement('tr');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <td>${recomendation.id}</td> 
                <td>${recomendation.name}</td>
                <td>${recomendation.price}</td>
                <td>${recomendation.score}</td>
            `;
            tableBody.appendChild(userElement);
        });
    } catch (error) {
        console.error('Error fetching recomendations:', error);
    }
}

async function buyProduct() {
    const user_id = document.getElementById('buyerId').value.trim();
    const product_id = document.getElementById('productToBuyId').value.trim();

    if (!user_id || !product_id) {
        alert('Proszę uzupełnić wszystkie pola.');
        return;
    }
    try {
        const response = await fetch('/products/buy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_id, product_id }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const shoppingStatus = document.getElementById('shoppingStatus');

        shoppingStatus.textContent = `Sukces! ID: ${result.id}`;
        shoppingStatus.style.color = 'green';

        document.getElementById('buyerId').value = '';
        document.getElementById('productToBuyId').value = '';
    } catch (error) {
        console.error('Error adding product:', error);

        const shoppingStatus = document.getElementById('shoppingStatus');
        shoppingStatus.textContent = 'Błąd, spróbuj ponownie.';
        shoppingStatus.style.color = 'red';
    }
}

async function fetchPopularProducts() {
    try {
        const response = await fetch('/products/popular');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        const container = document.getElementById('MostPopularProducts');

        container.innerHTML = '';
        container.className = 'table'
        const tableHead = document.createElement('thead');
        const tableBody = document.createElement('tbody');
        tableHead.innerHTML = `
        <tr>
            <th scope="col">Nazwa Produktu</th>
            <th scope="col">Liczba zakupień</th>
        </tr>`
        container.appendChild(tableHead);
        container.appendChild(tableBody);
        products.forEach(product => {
            const productElement = document.createElement('tr');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <td>${product.name}</td> <td>${product.popularity}</td>
            `;
            tableBody.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching popular products:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchPopularProducts);