"use strict";

interface IItemizeAllDelegate<T> {
    itemizeAll(): T;
}

class ItemizeAllStoreProductsDelegate implements IItemizeAllDelegate<NodeListOf<Element>> {
    itemizeAll = (): NodeListOf<Element> => {
        return document.querySelectorAll(".product-tile");
    }
}

interface IStoreProductDataProvider {
    confirmInLibrary(product: Element): boolean;
    getDiscount(product: Element): number;
    getDiscountedPrice(product: Element): number;
}

class StoreProductDataProvider implements IStoreProductDataProvider {
    confirmInLibrary(product: Element): boolean {
        return product.querySelector(".product-tile__labels--in-library") !== null;
    }
    getDataOrDefault(
        product: Element,
        selector: string,
        defaultValue: number,
        dataExtractor: (textContent: string) => number): number {
        let childElement = product.querySelector(selector);
        if (!childElement) return defaultValue;
        return dataExtractor(childElement.textContent);
    }
    getDiscount(product: Element): number {
        return this.getDataOrDefault(
            product,
            ".product-tile__discount",
            0,
            tc => Math.abs(parseFloat(tc)))
    }
    getDiscountedPrice(product: Element): number {
        return this.getDataOrDefault(
            product,
            ".product-tile__price-discounted",
            99.99,
            tc => parseFloat(tc))
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

interface IStoreProductsConditionalRemover {
    removeInLibraryProducts(): void;
    removeLowerDiscountProducts(discountThreshold: number): void;
    removeHigherDiscountPriceProducts(discountedPriceThreshold: number): void;
}

class StoreProductsConditionalRemover implements IStoreProductsConditionalRemover {
    private itemizeAllStoreProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>>;
    private productDataProvider: IStoreProductDataProvider;
    private productRemoveDelegate: IRemoveDelegate<Element>;
    constructor(
        itemizeAllStoreProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>>,
        productDataProvider: IStoreProductDataProvider,
        productRemoveDelegate: IRemoveDelegate<Element>) {
        this.itemizeAllStoreProductsDelegate = itemizeAllStoreProductsDelegate;
        this.productDataProvider = productDataProvider;
        this.productRemoveDelegate = productRemoveDelegate;
    }
    private conditionallyRemove = (condition: (product: Element) => boolean): void => {
        for (let product of this.itemizeAllStoreProductsDelegate.itemizeAll())
            if (condition(product))
                this.productRemoveDelegate.remove(product);
    }
    removeInLibraryProducts = (): void => {
        this.conditionallyRemove(
            p => this.productDataProvider.confirmInLibrary(p))
    }
    removeLowerDiscountProducts = (discountThreshold: number): void => {
        this.conditionallyRemove(
            p => this.productDataProvider.getDiscount(p) < discountThreshold)
    }

    removeHigherDiscountPriceProducts = (priceThreshold: number): void => {
        this.conditionallyRemove(
            p => this.productDataProvider.getDiscountedPrice(p) > priceThreshold)
    }
}

let itemizeAllStoreProductsDelegate: IItemizeAllDelegate<NodeListOf<Element>> = new ItemizeAllStoreProductsDelegate();
let productDataProvider = new StoreProductDataProvider();
let removeProductDelegate: IRemoveDelegate<Element> = new RemoveProductDelegate();
let storeProductsConditionalRemover = new StoreProductsConditionalRemover(
    itemizeAllStoreProductsDelegate,
    productDataProvider,
    removeProductDelegate);
storeProductsConditionalRemover.removeInLibraryProducts();
storeProductsConditionalRemover.removeLowerDiscountProducts(50);
storeProductsConditionalRemover.removeHigherDiscountPriceProducts(19.99);