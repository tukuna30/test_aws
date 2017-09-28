(function (window, trythings, module) {
    trythings[module] = function() {
        console.log('executing script for books template');
        let bookCategories = ["Fiction", "Biography", "Autobiography", "Self help", "Sci Fi"];

        bookCategories.forEach(function(item, i) {
            let listItem = document.createElement('li'), stateElement = document.createElement('state'), itemName = item.split(' ').join('_').toLowerCase();
            stateElement.setAttribute("url", "/books/"+ itemName);
            stateElement.setAttribute('stateUrl', "books/:categoryId");
            stateElement.setAttribute("name", itemName);
            stateElement.setAttribute("templateUrl", "assets/views/books/" + itemName + ".html");
            stateElement.append(document.createTextNode(item));
            listItem.append(stateElement)
            document.getElementById('books').append(listItem);
        });
    }
})(window, window.trythings || {}, "books");