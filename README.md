# Bookmarklets
Collection of bookmarklets:

## GOG.com-FilterAll.ts

### Usage

Should work in every modern browser, including mobile. Grab the latest release from [Releases](https://github.com/boggydigital/Bookmarklets/releases) page, then:

* Create a new bookmark in your browser or change existing, name as you see fit
* For the address paste the content of release\GOG.com-FilterAll.js
* Save and use (activate the bookmark) on some GOG.com Store, Wishlist page

### Building 

* Compile with TypeScript compiler: [tsc](http://www.typescriptlang.org) GOG.com-FilterAll.ts -t es6
* Optionally minify with [Closure Compiler](https://closure-compiler.appspot.com/home)
* Create new bookmark/edit existing bookmark and use the following address "javascript:{PASTE COMPILED CONTENT HERE}"

### Modification

Changing the discount and price threshold:
* The last two lines in .ts file control what gets removed for store products and wishlist products
* (store|wishlist)ProductsFilter.filter(true, 50, 19.99)
    * true - remove in library products
    * 50 - discount threshold, products discounted less than that will be filtered
    * 19.99 - price threshold, product priced more than that will be filtered
