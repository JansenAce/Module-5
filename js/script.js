(function (global) {
  var dc = {};

  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";

  var menuItemsUrl =
    "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Convenience function for inserting innerHTML for 'select'
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Show loading icon inside element identified by 'selector'.
  var showLoading = function (selector) {
    var html = "<div class='text-center'>Loading...</div>";
    insertHtml(selector, html);
  };

  // Replace all occurrences of {{propName}} in 'string' with propValue
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    return string.split(propToReplace).join(propValue);
  };

  // Remove the class 'active' from home and add to the menu item selected
  var switchMenuToActive = function (selector) {
    // Remove 'active' from all menu items
    var classes = document.querySelectorAll(".nav .active");
    if (classes.length > 0) {
      classes[0].className = classes[0].className.replace(new RegExp("active"), "");
    }

    // Add 'active' to the current menu item
    var elem = document.querySelector(selector);
    if (elem) {
      var classList = elem.className;
      if (classList.indexOf("active") === -1) {
        elem.className = classList + " active";
      }
    }
  };

  // Load the menu categories view
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowCategoriesHTML
    );
  };

  // Load the menu items for a given category short name
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML
    );
  };

  // Build HTML for categories and insert into page
  function buildAndShowCategoriesHTML(categories) {
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtmlData) {
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtmlData) {
            var finalHtml = categoriesTitleHtmlData;
            finalHtml += "<section class='row'>";

            for (var i = 0; i < categories.length; i++) {
              var html = categoryHtmlData;
              var name = "" + categories[i].name;
              var short_name = categories[i].short_name;
              html = insertProperty(html, "name", name);
              html = insertProperty(html, "short_name", short_name);
              finalHtml += html;
            }

            finalHtml += "</section>";
            insertHtml("#main-content", finalHtml);
          },
          false
        );
      },
      false
    );
  }

  // Build HTML for menu items and insert into page
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtmlData) {
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtmlData) {
            var menuItems = categoryMenuItems.menu_items;
            var title = categoryMenuItems.category.name;
            var short_name = categoryMenuItems.category.short_name;

            var finalHtml = insertProperty(menuItemsTitleHtmlData, "name", title);
            finalHtml = insertProperty(finalHtml, "short_name", short_name);

            finalHtml += "<section class='row'>";
            for (var i = 0; i < menuItems.length; i++) {
              var html = menuItemHtmlData;

              html = insertProperty(html, "short_name", menuItems[i].short_name);
              html = insertProperty(html, "catShortName", short_name);
              html = insertProperty(html, "name", menuItems[i].name);
              html = insertProperty(html, "description", menuItems[i].description);

              // price_small and price_large are optional
              var price = menuItems[i].price_small ? menuItems[i].price_small : menuItems[i].price_large;
              if (price) {
                html = insertProperty(html, "price", "$" + price.toFixed(2));
              } else {
                html = insertProperty(html, "price", "");
              }

              finalHtml += html;
            }

            finalHtml += "</section>";
            insertHtml("#main-content", finalHtml);
          },
          false
        );
      },
      false
    );
  }

  // Load home view. This is where we implement the random Specials behavior.
  dc.loadHome = function () {
    showLoading("#main-content");

    // STEP 0: Fetch categories so we can pick a random short_name
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      function (categories) {
        // STEP 1: pick a random category short_name
        var randomCategoryShortName = "L"; // fallback
        if (Array.isArray(categories) && categories.length > 0) {
          var randomIndex = Math.floor(Math.random() * categories.length);
          randomCategoryShortName = categories[randomIndex].short_name;
        }

        // STEP 2: Load the home snippet
        $ajaxUtils.sendGetRequest(
          homeHtmlUrl,
          function (homeHtml) {
            // STEP 3: Insert the randomCategoryShortName into the home snippet.
            // The home-snippet.html expects the inserted value to be a JavaScript string literal.
            // So when replacing {{randomCategoryShortName}} we include single quotes.
            var randomShortWithQuotes = "'" + randomCategoryShortName + "'";
            var finalHtml = insertProperty(
              homeHtml,
              "randomCategoryShortName",
              randomShortWithQuotes
            );

            // STEP 4: Insert the final HTML into the page
            insertHtml("#main-content", finalHtml);
          },
          false
        );
      },
      true
    );
  };

  // Expose to the global namespace
  global.$dc = dc;
})(window);
