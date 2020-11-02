function createReceiptData (menu, order) {
    const result = {};
    result.shopName = menu.shopName;
    result.address = menu.address;
    result.phone = menu.phone;
    result.customer = order.customer;
    result.taxRate = order.taxRate;
    result.items = order.items.map(enrichItem);
    result.itemDiscounts = itemDiscountsFor(order);
    const calculator = createTotalsCalculator(result, order);
    result.preTaxTotal = calculator.preTaxTotal;
    result.taxTotal = calculator.taxTotal;
    result.totalAmount = calculator.totalAmount;
    result.finalAmount = calculator.finalAmount;
    result.cash = calculator.cash;
    result.change = calculator.change;
    return result;

    function enrichItem (anItem) {
        const calculator = createItemCalculator(anItem, menu, order);
        const result = Object.assign({}, anItem);
        result.unitPrice = calculator.price;
        result.amount = calculator.amount;
        result.discPercent = calculator.discPercent;
        result.discAmount = calculator.discAmount;
        result.totalAmount = calculator.totalAmount;
        return result;
    }

    function createItemCalculator (anItem, aMenu, anOrder) {
        if (anOrder.itemDiscounts !== undefined) {
            return new DiscountCalculator(anItem, aMenu, anOrder);    
        }
        return new ItemCalculator(anItem, aMenu, anOrder);
    }

    function itemDiscountsFor (anOrder) {
        if (anOrder.itemDiscounts !== undefined) {
            return anOrder.itemDiscounts.map(addItemDiscountTotal);
        }
    }

    function addItemDiscountTotal (aDiscount) {
        const result = Object.assign({}, aDiscount);
        result.preAmount = order.items
            .filter(item => aDiscount.items.includes(item.id))
            .reduce((total, item) => (total + (item.quantity * menu.prices[item.id])), 0);
        return result;
    }

    function createTotalsCalculator (receiptData, anOrder) {
        if (anOrder.totalDiscount !== undefined) {
            return new TotalDiscountCalculator(receiptData, anOrder);
        }
        return new TotalsCalculator(receiptData, anOrder);
    }
}

class ItemCalculator {
    constructor(anItem, aMenu, anOrder) {
        this.item = anItem;
        this.menu = aMenu;
        this.order = anOrder;
    }

    get price() {
        return this.menu.prices[this.item.id];
    }

    get amount() {
        return this.item.quantity * this.price;
    }

    get discPercent() {
        return 0;
    }

    get discAmount() {
        return 0;
    }

    get totalAmount() {
        return this.amount;
    }
}

class DiscountCalculator extends ItemCalculator {

    get discPercent() {
        const disc = this.order.itemDiscounts
                .find(discount => discount.items.includes(this.item.id)); 
        return (disc !== undefined ? disc.percent : super.discPercent);
    }

    get discAmount() {
        return this.amount * this.discPercent / 100;
    }

    get totalAmount() {
        return this.amount - this.discAmount;
    }
}

class TotalsCalculator {
    constructor(receiptData, order) {
        this.receiptData = receiptData;
        this.order = order;
    }

    get preTaxTotal() {
        return this.receiptData.items.reduce((total, i) => total + i.totalAmount, 0);
    }

    get taxTotal() {
        return this.preTaxTotal * this.receiptData.taxRate / 100;
    }

    get totalAmount() {
        return this.preTaxTotal + this.taxTotal;
    }

    get cash() {
        return this.order.cash
    }

    get change() {
        return this.cash - this.finalAmount
    }

    get finalAmount() {
        return this.totalAmount;
    }
}

class TotalDiscountCalculator extends TotalsCalculator {

    get finalAmount() {
        if (this.totalAmount < this.order.totalDiscount.limit) return super.finalAmount;

        this.receiptData.totalDiscount = this.order.totalDiscount;
        this.receiptData.totalDiscount.amount = this.totalAmount;
        return this.totalAmount * (1 - (this.receiptData.totalDiscount.percent / 100)); 
    }
}

module.exports = createReceiptData;