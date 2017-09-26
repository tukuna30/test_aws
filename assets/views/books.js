(function (window, trythings, module) {
    trythings[module] = function() {
        console.log('executing script for books template');
        let bookCategories = ["Fiction", "Non fiction", "Biography", "Autography", "Self help", "Romance", "Guides", "Sci Fi", "Love Stories"];

        bookCategories.forEach(function(item, i) {
            let listItem = document.createElement('li'), stateElement = document.createElement('state');
            stateElement.setAttribute("url", "/books/"+ item.split(' ').join('_'));
            stateElement.setAttribute('stateUrl', "books/:categoryId");
            stateElement.setAttribute("name", "booksCategory");
            stateElement.setAttribute("templateUrl", "assets/views/books/" + item + ".html");
            stateElement.append(document.createTextNode(item));
            listItem.append(stateElement)
            document.getElementById('books').append(listItem);
        });
    }
})(window, window.trythings || {}, "books");