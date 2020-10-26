const createReceiptData = require('./createReceiptData');

exports.receipt = function (menu, order, cash) {
    return renderPlainText (createReceiptData (menu, order, cash));
}

function renderPlainText (data) {
    let result = `${data.shopName}\n${data.address}\n${phoneNumFormat(data.phone)}\n`;
    result += `${data.customer}\n`;
    for (let item of data.items) {
        result += `${item.id}\t` +
            `${item.quantity} x ${usd(item.unitPrice)} = ` +
            `${usd(item.amount)}\n`;
    }
    if (data.itemDiscounts !== undefined) {
        for (let discount of data.itemDiscounts) {
            result += `Disc:\t\t${discount.percent}% from ${usd(discount.preDiscAmount)}\n`;
        }
    }
    result += `Tax\t${usd(data.taxTotal)}\n`;
    result += `Total Amount:\t${usd(data.totalAmount)}\n`;
    if (data.totalDisc !== undefined) {
        result += `${data.totalDisc.percent}% discount applies ` +
            `as total is over ${usd(data.totalDisc.limit)}\n`;
        result += `Final Amount:\t\t${usd(data.finalAmount)}\n`
    }
    result += `Cash:\t${usd(data.cash)}\n`;
    result += `Change:\t${usd(data.change)}\n`;
    return result;
}

exports.htmlReceipt = function (menu, order, cash) {
    return renderHtml (createReceiptData(menu, order, cash));
}

function renderHtml (data) {
    let result = `<h1>${data.shopName}</h1>\n`
    result += `<h3>${data.address}</h3>\n<h3>${phoneNumFormat(data.phone)}</h3>\n`;
    result += `<h2>${data.customer}</h2>\n`;
    result += '<table>\n';
    result += '<tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>';
    for (let item of data.items) {
        result += `<tr><td>${item.id}</td><td>${item.quantity}</td><td>` +
            `${usd(item.unitPrice)}</td><td>${usd(item.amount)}</td></tr>\n`;
    }
    result += '</table>\n';
    if (data.itemDiscounts !== undefined) {
        for (let discount of data.itemDiscounts) {
            result += `<p>Disc:\t\t${discount.percent}% from ${usd(discount.preDiscAmount)}</p>\n`;
        }
    }
    result += `<p>Tax:\t\t<em>${usd(data.taxTotal)}</em></p>\n`
    result += `<p>Total Amount:\t\t<em>${usd(data.totalAmount)}</em></p>\n`;
    if (data.totalDisc !== undefined) {
        result += `<p><em>${data.totalDisc.percent}% discount applies ` +
            `as total is over ${usd(data.totalDisc.limit)}</em></p>\n`;
        result += `<p>Final Amount:\t\t<em>${usd(data.finalAmount)}</em></p>\n`
    }
    result += `<p>Cash:\t\t<em>${usd(data.cash)}</em></p>\n`;
    result += `<p>Change:\t<em>${usd(data.change)}</em></p>\n`;
    return result;
}

function phoneNumFormat (aPhoneNum) {
    return `+${aPhoneNum[0]} ` +
    `(${aPhoneNum.slice(1, 4)}) ` +
    `${aPhoneNum.slice(4, 7)}` +
    `-${aPhoneNum.slice(7)}`
}

function usd (anAmount) {
    return `$${Number.parseFloat(anAmount).toFixed(2)}`;
}
