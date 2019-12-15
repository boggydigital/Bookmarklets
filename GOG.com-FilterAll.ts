"use strict";

interface IItemizeAllDelegate<T> {
    itemizeAll(): T;
}

class ItemizeAllProductsDelegate implements IItemizeAllDelegate<NodeListOf<Element>> {
    private selector: string;
    constructor(selector: string) {
        this.selector = selector;
    }
    itemizeAll = (): NodeListOf<Element> => {
        return document.querySelectorAll(this.selector);
    }
}

interface IGetDataDelegate {
    getDataOrDefault(
        product: Element,
        selector: string,
        defaultValue: number,
        dataExtractor: (textContent: string) => number): number;
    getDiscountOrDefault(product: Element, selector: string): number;
    getPriceOrDefault(product: Element, selector: string): number;
}

abstract class GetProductDataOrDefaultDelegate
    implements IGetDataDelegate {
    getDataOrDefault(
        product: Element,
        selector: string,
        defaultValue: number): number {
        let childElement = product.querySelector(selector);
        if (!childElement) return defaultValue;
        return Math.abs(parseFloat(childElement.textContent));
    }
    getDiscountOrDefault(product: Element, selector: string): number {
        return this.getDataOrDefault(
            product,
            selector,
            0)
    }
    getPriceOrDefault(product: Element, selector: string): number {
        return this.getDataOrDefault(
            product,
            selector,
            99.99)
    }
}

interface IProductDataProvider {
    confirmInLibrary(product: Element): boolean;
    getDiscount(product: Element): number;
    getPrice(product: Element): number;
}

class GetStoreProductDataDelegate
    extends GetProductDataOrDefaultDelegate
    implements IProductDataProvider {
    confirmInLibrary(product: Element): boolean {
        return product.querySelector(".product-tile__labels--in-library") !== null;
    }
    getDiscount(product: Element): number {
        return this.getDiscountOrDefault(product, ".product-tile__discount");
    }
    getPrice(product: Element): number {
        return this.getPriceOrDefault(product, ".product-tile__price-discounted")
    }
}

class GetWishlistProductDataDelegate
    extends GetProductDataOrDefaultDelegate
    implements IProductDataProvider {
    confirmInLibrary(product: Element): boolean {
        return false;
    }
    getDiscount(product: Element): number {
        return this.getDiscountOrDefault(product, ".product-row__discount");
    }
    getPrice(product: Element): number {
        return this.getPriceOrDefault(product, ".product-row__price .product-state__price");
    }
}

class GetSaleProductDataDelegate
    extends GetProductDataOrDefaultDelegate
    implements IProductDataProvider {
    confirmInLibrary(product: Element): boolean {
        return product.classList.contains("is-owned");
    }
    getDiscount(product: Element): number {
        let basePrice = this.getPriceOrDefault(product, ".product-row-price--old ._price");
        let newPrice = this.getPrice(product);
        return Math.floor(100 * (basePrice - newPrice) / basePrice);
    }
    getPrice(product: Element): number {
        return this.getPriceOrDefault(product, ".product-row-price--new ._price");
    }
}

interface IRemoveDelegate<T> {
    remove(item: T): void;
}

class RemoveProductDelegate implements IRemoveDelegate<Element> {
    remove = (product: Element): void => {
        product.remove();
    }
}

interface IProductsFilter {
    filterInLibraryProducts(): void;
    filterLowerDiscountProducts(discountThreshold: number): void;
    filterHigherDiscountPriceProducts(discountedPriceThreshold: number): void;
    filter(inLibrary: boolean, discountThreshold: number, priceThreshold: number): void;
}

class ProductsFilter implements IProductsFilter {
    private itemizeAllStoreProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>>;
    private productDataProvider: IProductDataProvider;
    private productRemoveDelegate: IRemoveDelegate<Element>;
    constructor(
        itemizeAllStoreProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>>,
        productDataProvider: IProductDataProvider,
        productRemoveDelegate: IRemoveDelegate<Element>) {
        this.itemizeAllStoreProductsDelegate = itemizeAllStoreProductsDelegate;
        this.productDataProvider = productDataProvider;
        this.productRemoveDelegate = productRemoveDelegate;
    }
    private filterByCondition = (condition: (product: Element) => boolean): void => {
        for (let product of this.itemizeAllStoreProductsDelegate.itemizeAll())
            if (condition(product))
                this.productRemoveDelegate.remove(product);
    }
    filterInLibraryProducts = (): void => {
        this.filterByCondition(
            p => this.productDataProvider.confirmInLibrary(p))
    }
    filterLowerDiscountProducts = (discountThreshold: number): void => {
        this.filterByCondition(
            p => this.productDataProvider.getDiscount(p) < discountThreshold)
    }

    filterHigherDiscountPriceProducts = (priceThreshold: number): void => {
        this.filterByCondition(
            p => this.productDataProvider.getPrice(p) > priceThreshold)
    }

    filterLowerDiscountOrHigherDiscountPriceProducts = (discountThreshold: number, priceThreshold: number) => {
        this.filterByCondition(
            p => {
                let price = this.productDataProvider.getPrice(p);
                let discount = this.productDataProvider.getDiscount(p);
                // console.log(price);
                // console.log(discount);
                let filter = (discount < discountThreshold) && (price > priceThreshold);
                // console.log(`${discount}<${discountThreshold}&&${price}>${priceThreshold}=${filter}`)
                return filter;
            })
    }

    filter = (
        inLibrary: boolean,
        discountThreshold: number,
        priceThreshold: number): void => {
        if (inLibrary) this.filterInLibraryProducts();
        this.filterLowerDiscountOrHigherDiscountPriceProducts(discountThreshold, priceThreshold);
        // this.filterLowerDiscountProducts(discountThreshold);
        // this.filterHigherDiscountPriceProducts(priceThreshold);
    }
}

// Store product filter dependencies and instantiation
let itemizeAllStoreProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>> =
    new ItemizeAllProductsDelegate(".product-tile");
let getStoreProductDataDelegate: IProductDataProvider =
    new GetStoreProductDataDelegate();
let removeProductDelegate: IRemoveDelegate<Element> = new RemoveProductDelegate();
let storeProductsFilter = new ProductsFilter(
    itemizeAllStoreProductsDelegate,
    getStoreProductDataDelegate,
    removeProductDelegate);
// Wishlist product filter dependencies and instantiation
let itemizeAllWishlistProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>> =
    new ItemizeAllProductsDelegate(".product-row-wrapper");
let getWishlistProductDataDelegate: IProductDataProvider =
    new GetWishlistProductDataDelegate();
// we'll reuse existing removeProductDelegate
// let removeProductDelegate: IRemoveDelegate<Element> = new RemoveProductDelegate();
let wishlistProductsFilter = new ProductsFilter(
    itemizeAllWishlistProductsDelegate,
    getWishlistProductDataDelegate,
    removeProductDelegate);
// we'll reuse existing removeProductDelegate
// let removeProductDelegate: IRemoveDelegate<Element> = new RemoveProductDelegate();
let itemizeAllSaleProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>> =
    new ItemizeAllProductsDelegate(".product-row");
let getSaleProductDataDelegate: IProductDataProvider =
    new GetSaleProductDataDelegate();
let saleProductsFilter = new ProductsFilter(
    itemizeAllSaleProductsDelegate,
    getSaleProductDataDelegate,
    removeProductDelegate);
// apply all filters
storeProductsFilter.filter(true, 75, 7.99);
wishlistProductsFilter.filter(true, 25, 14.99);
saleProductsFilter.filter(true, 60, 9.99);