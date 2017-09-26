(function (window, trythings, module) {
    trythings[module] = function() {
        console.log('executing script for books template');
        let bookCategories = ["Fiction", "Non fiction", "Biography", "Autobiography", "Self help", "Romance", "Guides", "Sci Fi", "Love Stories"];

        bookCategories.forEach(function(item, i) {
            let listItem = document.createElement('li'), stateElement = document.createElement('state'), itemName = item.split(' ').join('_').toLowerCase();
            stateElement.setAttribute("url", "/books/"+ itemName);
            stateElement.setAttribute('stateUrl', "books/:categoryId");
            stateElement.setAttribute("name", "booksCategory");
            stateElement.setAttribute("templateUrl", "assets/views/books/" + itemName + ".html");
            stateElement.append(document.createTextNode(item));
            listItem.append(stateElement)
            document.getElementById('books').append(listItem);
        });
    }
})(window, window.trythings || {}, "books");