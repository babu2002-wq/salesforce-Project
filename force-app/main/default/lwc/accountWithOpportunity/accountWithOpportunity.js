import { LightningElement, wire,track } from 'lwc';
import getAccountHierarchy from '@salesforce/apex/OpportunityLineItemController.getAccountHierarchy';


export default class AccountWithOpportunity extends LightningElement {
    @track accounts = [];
    @track lineItems = null;
    @track totalQuantity = 0;
    @track totalRevenue = 0;

    columns = [
        { label: 'Product', fieldName: 'productName' },
        { label: 'Quantity', fieldName: 'quantity', type: 'number' },
        { label: 'Total Price', fieldName: 'totalPrice', type: 'currency' }
    ];

    @wire(getAccountHierarchy)
    wiredData({ data }) {
        if (data) {
            this.accounts = data.map(acc => ({ ...acc, showOpps: false }));
        }
    }

    handleAccountClick(event) {
        const accId = event.currentTarget.dataset.id;
        this.accounts = this.accounts.map(acc =>
            ({ ...acc, showOpps: acc.accountId === accId ? !acc.showOpps : acc.showOpps })
        );

        // Reset table when switching account
        this.lineItems = null;
        this.totalQuantity = 0;
        this.totalRevenue = 0;
    }

    handleOppClick(event) {
        const oppId = event.currentTarget.dataset.id;
        const opp = this.accounts
            .flatMap(acc => acc.opportunities)
            .find(o => o.oppId === oppId);

        this.lineItems = opp.lineItems;

        // CALCULATE GRAND TOTALS
        this.calculateTotals(opp.lineItems);
    }

    calculateTotals(items) {
        let qty = 0, rev = 0;
        items.forEach(item => {
            qty += item.quantity;
            rev += item.totalPrice;
        });
        this.totalQuantity = qty;
        this.totalRevenue = rev;
    }
}