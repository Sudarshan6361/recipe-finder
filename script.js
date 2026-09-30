

const searchForm = document.getElementById("searchForm");

const searchInput = document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const recipeContainer =
    document.getElementById("recipeContainer");

const searchHistory =
    document.getElementById("searchHistory");

const favoritesBtn =
    document.getElementById("favoritesBtn");

const favoriteCount =
    document.getElementById("favoriteCount");

const clearBtn =
    document.getElementById("clearBtn");




const recipeModal =
    document.getElementById("recipeModal");

const closeModal =
    document.getElementById("closeModal");

const modalImage =
    document.getElementById("modalImage");

const modalTitle =
    document.getElementById("modalTitle");

const modalCategory =
    document.getElementById("modalCategory");

const modalArea =
    document.getElementById("modalArea");

const modalIngredients =
    document.getElementById("modalIngredients");

const modalInstructions =
    document.getElementById("modalInstructions");



let recipes = [];

let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

let history =
    JSON.parse(localStorage.getItem("searchHistory")) || [];



searchForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const searchTerm =
        searchInput.value.trim();

    const category =
        categoryFilter.value;


   

    if (searchTerm === "" && category === "all") {

        showMessage(
            "Please enter a recipe name or select a category."
        );

        return;
    }


 

    if (searchTerm !== "") {

        saveSearchHistory(searchTerm);

        searchRecipes(searchTerm);

    }


    else {

        searchByCategory(category);

    }

});



async function searchRecipes(query) {

    showMessage("Loading recipes...");

    try {

        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
        );


        const data =
            await response.json();


        recipes =
            data.meals || [];


        applyCategoryFilter();


    } catch (error) {

        showMessage(
            "Unable to load recipes. Please check your internet connection."
        );

    }

}




async function searchByCategory(category) {

    showMessage("Loading recipes...");

    try {

        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`
        );


        const data =
            await response.json();


        const meals =
            data.meals || [];


        if (meals.length === 0) {

            showMessage("No recipes found.");

            return;
        }


        recipes = [];


       

        for (const meal of meals.slice(0, 12)) {

            const detailResponse =
                await fetch(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );


            const detailData =
                await detailResponse.json();


            if (detailData.meals) {

                recipes.push(
                    detailData.meals[0]
                );

            }

        }


        renderRecipes(recipes);


    } catch (error) {

        showMessage(
            "Unable to load recipes."
        );

    }

}




categoryFilter.addEventListener(
    "change",
    function () {

        if (recipes.length > 0) {

            applyCategoryFilter();

        }

    }
);


function applyCategoryFilter() {

    const category =
        categoryFilter.value;


    let filteredRecipes =
        recipes;


    if (category !== "all") {

        filteredRecipes =
            recipes.filter(
                recipe =>
                    recipe.strCategory === category
            );

    }


    renderRecipes(filteredRecipes);

}



function renderRecipes(recipeList) {

    recipeContainer.innerHTML = "";


    if (recipeList.length === 0) {

        showMessage("No recipes found.");

        return;
    }


    recipeList.forEach(recipe => {

        const card =
            document.createElement("article");


        card.className =
            "recipe-card";


      

        const isFavorite =
            favorites.some(
                item =>
                    item.idMeal === recipe.idMeal
            );


        card.innerHTML = `

            <img
                src="${recipe.strMealThumb}"
                alt="${recipe.strMeal}"
            >

            <div class="recipe-content">

                <h3>
                    ${recipe.strMeal}
                </h3>

                <span class="category">
                    ${recipe.strCategory || "Recipe"}
                </span>

                <div class="card-buttons">

                    <button
                        class="view-btn"
                        onclick="showRecipe('${recipe.idMeal}')"
                    >
                        View Recipe
                    </button>

                    <button
                        class="favorite-card-btn ${
                            isFavorite ? "active" : ""
                        }"
                        onclick="toggleFavorite('${recipe.idMeal}')"
                    >
                        ${isFavorite ? "❤️" : "🤍"}
                    </button>

                </div>

            </div>

        `;


        recipeContainer.appendChild(card);

    });

}



async function showRecipe(id) {

    try {

        const response =
            await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
            );


        const data =
            await response.json();


        if (!data.meals) {

            alert("Recipe not found.");

            return;
        }


        const recipe =
            data.meals[0];


        

        modalImage.src =
            recipe.strMealThumb;

        modalImage.alt =
            recipe.strMeal;

        modalTitle.textContent =
            recipe.strMeal;

        modalCategory.textContent =
            recipe.strCategory || "Unknown";

        modalArea.textContent =
            recipe.strArea || "Unknown";



        modalIngredients.innerHTML = "";


    

        for (let i = 1; i <= 20; i++) {

            const ingredient =
                recipe[`strIngredient${i}`];

            const measure =
                recipe[`strMeasure${i}`];


            if (
                ingredient &&
                ingredient.trim() !== ""
            ) {

                const li =
                    document.createElement("li");


                li.textContent =
                    `${ingredient} - ${measure}`;


                modalIngredients.appendChild(li);

            }

        }


     

        modalInstructions.textContent =
            recipe.strInstructions;


       

        recipeModal.style.display =
            "flex";


    } catch (error) {

        alert(
            "Unable to load recipe details."
        );

    }

}




function toggleFavorite(id) {

    const existingIndex =
        favorites.findIndex(
            item =>
                item.idMeal === id
        );


 

    if (existingIndex !== -1) {

        favorites.splice(
            existingIndex,
            1
        );

    }


    else {

        const recipe =
            recipes.find(
                item =>
                    item.idMeal === id
            );


        if (recipe) {

            favorites.push(recipe);

        }

    }


    saveFavorites();

    updateFavoriteCount();

    renderRecipes(recipes);

}




function saveFavorites() {

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

}



function updateFavoriteCount() {

    favoriteCount.textContent =
        favorites.length;

}




favoritesBtn.addEventListener(
    "click",
    function () {

        if (favorites.length === 0) {

            showMessage(
                "You have no favorite recipes yet."
            );

            return;
        }


        renderRecipes(favorites);

    }
);




function saveSearchHistory(searchTerm) {



    history =
        history.filter(
            item =>
                item.toLowerCase() !==
                searchTerm.toLowerCase()
        );


   

    history.unshift(searchTerm);


  

    history =
        history.slice(0, 5);



    localStorage.setItem(
        "searchHistory",
        JSON.stringify(history)
    );


    renderHistory();

}



function renderHistory() {

    searchHistory.innerHTML = "";


    if (history.length === 0) {

        searchHistory.innerHTML = `
            <p class="empty-message">
                No search history yet.
            </p>
        `;

        return;
    }


    history.forEach(item => {

        const button =
            document.createElement("button");


        button.className =
            "history-item";


        button.textContent =
            item;



        button.addEventListener(
            "click",
            function () {

                searchInput.value =
                    item;

                searchRecipes(item);

            }
        );


        searchHistory.appendChild(button);

    });

}



clearBtn.addEventListener(
    "click",
    function () {

        recipes = [];

        recipeContainer.innerHTML = `
            <p class="empty-message">
                Search for a recipe to see results.
            </p>
        `;

    }
);




closeModal.addEventListener(
    "click",
    function () {

        recipeModal.style.display =
            "none";

    }
);




window.addEventListener(
    "click",
    function (event) {

        if (event.target === recipeModal) {

            recipeModal.style.display =
                "none";

        }

    }
);




function showMessage(message) {

    recipeContainer.innerHTML = `
        <p class="empty-message">
            ${message}
        </p>
    `;

}




renderHistory();

updateFavoriteCount();