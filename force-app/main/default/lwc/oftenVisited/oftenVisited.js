import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getViewedProducts from '@salesforce/apex/RecentlyViewedController.getViewedProducts';
import { getProduct } from 'commerce/productApi';

export default class OftenVisited extends NavigationMixin(LightningElement) {

    @track products = [];
    @track showComponent = false;
    @track isCarousel = false;

    connectedCallback() {
        this.loadProducts();
    }

    async loadProducts() {
        try {

            const ids = await getViewedProducts();

            console.log('DB Product IDs:', ids);

            if (!ids || ids.length < 2) {
                this.showComponent = false;
                return;
            }

            const productsWithDetails = await Promise.all(

                ids.map(async (id) => {

                    let imageUrl = '';
                    let name = '';
                    let price = '';

                    try {

                        const productData = await getProduct({ productId: id });
                        console.log('productdata:',productData);

                        name = productData?.fields.Name;
                        price = productData?.prices?.listPrice || '';

                        if (productData?.defaultImage?.url) {
                            imageUrl = window.location.origin + '/sfsites/c' + productData.defaultImage.url;
                        } else if (productData?.images?.length) {
                            imageUrl = window.location.origin + '/sfsites/c' + productData.images[0].url;
                        }

                    } catch (err) {
                        console.error('Error fetching product:', id, err);
                    }

                    return {
                        id,
                        name,
                        price,
                        imageUrl
                    };
                })
            );

            this.products = productsWithDetails;
            this.showComponent = true;
            this.isCarousel = this.products.length > 4;

        } catch (e) {
            console.error('Load error:', e);
        }
    }

    handleClick(event) {
        const productId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/product/${productId}`
            }
        });
    }
}