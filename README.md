# Bookmarklets
Collection of bookmarklets:

## GOG.com-Bookmarklets.ts

### Setup 

* Compile with TypeScript compiler: [tsc](http://www.typescriptlang.org) GOG.com-Bookmarklets.ts -t es6
* Optionally minify with [Closure Compiler](https://closure-compiler.appspot.com/home)
* Create new bookmark/edit existing bookmark and use the following address "javascript:{PASTE COMPILED CONTENT HERE}"

### Usage

Should work in every modern browser, including mobile. Activate the bookmark while on GOG.com store page and products you wouldn't care about would be removed from the page

### Modification

Changing the discount threshold:
* The last three lines in .ts file control what gets removed
* Discount threshold is set here: storeProductsConditionalRemover.removeLowerDiscountProducts(50);
* The check will remove anything lower than the value set. In the example above item with 40% discount will be removed, with 50% will not.

Changing the price threshold:
* Same as above, price threshold is set here: storeProductsConditionalRemover.removeHigherDiscountPriceProducts(19.99);
