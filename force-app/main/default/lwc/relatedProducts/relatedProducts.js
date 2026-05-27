import { LightningElement, api, wire, track } from 'lwc';
import Toast from 'lightning/toast';
import { addItemToCart } from 'commerce/cartApi';
import { getProduct } from 'commerce/productApi';

import getRelatedProducts from '@salesforce/apex/RelatedProductsController.getRelatedProducts';
import getProductPromotions from '@salesforce/apex/RelatedProductsController.getProductPromotions';

import { createWishlistItemAddAction } from 'commerce/actionApi';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';
import { dispatchAction } from 'commerce/actionApi';

export default class RelatedProducts extends LightningElement {

    @api recordId;

    @track products = [];

    // ---------------- GET RELATED PRODUCTS ----------------
    @wire(getRelatedProducts, { productId: '$recordId' })
    async wiredRelated({ data, error }) {

        console.log('⚡ wiredRelated triggered');

        if (data) {

            console.log('Related Products from Apex:', data);

            try {

                const productIds = data.map(prod => prod.id);

                console.log('Product IDs:', productIds);

                // Get promotions
                const promotionMap = await getProductPromotions({
                    productIds: productIds
                });

                console.log('Promotion Map:', promotionMap);

                // Fetch images
                const productsWithImages = await Promise.all(

                    data.map(async (prod) => {

                        let imageUrl = null;

                        try {

                            console.log('Fetching product details for:', prod.id);

                            const productData = await getProduct({
                                productId: prod.id
                            });

                            console.log('Product API response:', productData);

                            // Image location 1
                            if (productData?.defaultImage?.url) {

                                imageUrl = window.location.origin + '/sfsites/c' + productData.defaultImage.url;

                                console.log('Image found (defaultImage):', imageUrl);

                            }

                            // Image location 2 fallback
                            else if (productData?.images?.length) {

                                imageUrl = window.location.origin + '/sfsites/c' + productData.images[0].url;


                                console.log('Image found (images array):', imageUrl);

                            }

                            else {

                                console.warn('No image found for product:', prod.id);

                            }

                        } catch (imgError) {

                            console.error('Image API Error for product:', prod.id, imgError);

                        }

                        return {
                            ...prod,
                            imageUrl: imageUrl,
                            badges: promotionMap[prod.id] || [],
                            isDisabled: false,
                            isLoading: false,
                            isWishlistLoading: false
                        };

                    })

                );

                console.log('Final Products With Images:', productsWithImages);

                this.products = productsWithImages;

            } catch (err) {

                console.error('Promotion/Image fetch error', err);

            }

        } else if (error) {

            console.error('Related Products Error:', error);

        }
    }

    // ---------------- ADD TO CART ----------------
    async handleAddToCart(event) {

        const productId = event.currentTarget.dataset.id;

        this.updateProductState(productId, {
            isDisabled: true,
            isLoading: true
        });

        try {

            await addItemToCart(productId, 1);

            Toast.show({
                label: 'Success',
                message: 'Product added to cart successfully',
                variant: 'success'
            }, this);

        } catch (error) {

            Toast.show({
                label: 'Error',
                message: 'Failed to add product to cart',
                variant: 'error'
            }, this);

        } finally {

            this.updateProductState(productId, {
                isDisabled: false,
                isLoading: false
            });

        }
    }

    // ---------------- ADD TO WISHLIST ----------------
    async handleAddToWishlist(event) {
        const productId = event.currentTarget.dataset.id;

        console.log('Fixed Product ID:', productId);

        this.updateProductState(productId, {
            isWishlistLoading: true,
            isDisabled: true
        });

        try {
            await dispatchAction(
                this,
                createWishlistItemAddAction(
                    productId
                )
            );

            Toast.show({
                label: 'Success',
                message: 'Product added to wishlist successfully',
                variant: 'success'
            }, this);

        } catch (error) {
            console.error('Wishlist add failed', error);

            Toast.show({
                label: 'Error',
                message: 'Failed to add to wishlist',
                variant: 'error'
            }, this);

        } finally {
            this.updateProductState(productId, {
                isWishlistLoading: false,
                isDisabled: false
            });
        }
    }

    // ---------------- STATE UPDATER ----------------
    updateProductState(productId, updates) {

        this.products = this.products.map(prod => {

            if (prod.id === productId) {
                return { ...prod, ...updates };
            }

            return prod;

        });

    }

}