"use strict";

interface IItemizeAllDelegate<T> {
    itemizeAll(): T;
}

class ItemizeAllStoreProductsDelegate implements IItemizeAllDelegate<NodeListOf<Element>> {
    itemizeAll = (): NodeListOf<Element> => {
        return document.querySelectorAll(".product-tile");
    }
}

class ItemizeAllWishlistProductsDelegate implements IItemizeAllDelegate<NodeListOf<Element>> {
    itemizeAll = (): NodeListOf<Element> => {
        return document.querySelectorAll(".product-row-wrapper");
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

    filter = (
        inLibrary: boolean,
        discountThreshold: number,
        priceThreshold: number): void => {
        if (inLibrary) this.filterInLibraryProducts();
        this.filterLowerDiscountProducts(discountThreshold);
        this.filterHigherDiscountPriceProducts(priceThreshold);
    }
}

// Store product filter dependencies and instantiation
let itemizeAllStoreProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>> =
    new ItemizeAllStoreProductsDelegate();
let getStoreProductDataDelegate = new GetStoreProductDataDelegate();
let removeProductDelegate: IRemoveDelegate<Element> = new RemoveProductDelegate();
let storeProductsFilter = new ProductsFilter(
    itemizeAllStoreProductsDelegate,
    getStoreProductDataDelegate,
    removeProductDelegate);
// Wishlist product filter dependencies and instantiation
let itemizeAllWishlistProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>> =
    new ItemizeAllWishlistProductsDelegate();
let getWishlistProductDataDelegate = new GetWishlistProductDataDelegate();
// we'll reuse existing removeProductDelegate
// let removeProductDelegate: IRemoveDelegate<Element> = new RemoveProductDelegate();
let wishlistProductsFilter = new ProductsFilter(
    itemizeAllWishlistProductsDelegate,
    getWishlistProductDataDelegate,
    removeProductDelegate);

storeProductsFilter.filter(true, 50, 19.99);
wishlistProductsFilter.filter(true, 20, 14.99);