document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage if not present
    if (!localStorage.getItem('items')) {
        localStorage.setItem('items', JSON.stringify([]));
    }

    // Function to add item to storage
    document.getElementById('addItemForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const item = document.getElementById('item').value;
        const rate = parseInt(document.getElementById('rate').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        const items = JSON.parse(localStorage.getItem('items'));
        items.push({ item, rate, quantity, initialQuantity: quantity }); // Save initial quantity
        localStorage.setItem('items', JSON.stringify(items));

        document.getElementById('result').innerText = 'Item added successfully!';
        document.getElementById('addItemForm').reset();
        displayItems(); // Show updated items list
        displayStockSummary(); // Show available stock
    });

    // Function to print bill
    document.getElementById('printBillForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const billItem = document.getElementById('billItem').value;
        const billQuantity = parseInt(document.getElementById('billQuantity').value);

        const items = JSON.parse(localStorage.getItem('items'));
        let totalAmount = 0;
        let itemFound = false;

        // Process bill
        for (let i = 0; i < items.length; i++) {
            if (items[i].item === billItem) {
                itemFound = true;
                if (billQuantity <= items[i].quantity) {
                    const amount = items[i].rate * billQuantity;
                    totalAmount += amount;
                    items[i].quantity -= billQuantity;
                } else {
                    document.getElementById('result').innerText = `Sorry, ${billItem} ended!`;
                    return;
                }
            }
        }

        if (itemFound) {
            localStorage.setItem('items', JSON.stringify(items));
            displayItems(); // Show updated items list
            document.getElementById('result').innerHTML += `<p>Total Amount: ${totalAmount}</p>`;
            displayStockSummary(); // Show updated stock
        } else {
            document.getElementById('result').innerText = 'Item not available!';
        }

        document.getElementById('printBillForm').reset();
    });

    // Function to display all items in the local storage
    function displayItems() {
        const items = JSON.parse(localStorage.getItem('items'));
        let tableHtml = '<table><tr><th>Item</th><th>Rate</th><th>Quantity</th></tr>';

        items.forEach(item => {
            tableHtml += `<tr><td>${item.item}</td><td>${item.rate}</td><td>${item.quantity}</td></tr>`;
        });

        tableHtml += '</table>';
        document.getElementById('result').innerHTML = tableHtml;
    }

    // Function to display the summary of all purchases
    document.getElementById('printHardBillButton').addEventListener('click', function() {
        const items = JSON.parse(localStorage.getItem('items'));
        let totalAmount = 0;
        let summaryHtml = '<h2>Purchase Summary</h2>';
        summaryHtml += '<table><tr><th>Item</th><th>Rate</th><th>Quantity</th><th>Total Amount</th></tr>';

        items.forEach(item => {
            const quantityBought = item.initialQuantity - item.quantity;
            const amount = item.rate * quantityBought; // Total amount spent on each item
            totalAmount += amount;
            summaryHtml += `<tr><td>${item.item}</td><td>${item.rate}</td><td>${quantityBought}</td><td>${amount}</td></tr>`;
        });

        summaryHtml += `<tr><td colspan="3"><strong>Total</strong></td><td><strong>${totalAmount}</strong></td></tr>`;
        summaryHtml += '</table>';
        document.getElementById('result').innerHTML = summaryHtml;
    });

    // Function to clear all data and refresh the page
    document.getElementById('clearDataButton').addEventListener('click', function() {
        localStorage.removeItem('items');
        document.getElementById('result').innerHTML = '<p>All data cleared! The page will now refresh.</p>';
        setTimeout(function() {
            location.reload(); // Refresh the page
        }, 2000); // Delay to show the cleared message
    });

    // Function to generate and download PDF
    document.getElementById('downloadPdfButton').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const items = JSON.parse(localStorage.getItem('items'));

        let y = 10;
        doc.setFontSize(16);
        doc.text('Super Market Billing System', 10, y);
        y += 10;
        doc.setFontSize(14);
        doc.text('Purchase Summary', 10, y);
        y += 10;
        doc.setFontSize(12);

        doc.text('Item', 10, y);
        doc.text('Rate', 50, y);
        doc.text('Quantity', 90, y);
        doc.text('Total Amount', 130, y);
        y += 10;

        let totalAmount = 0;
        items.forEach(item => {
            const quantityBought = item.initialQuantity - item.quantity;
            const amount = item.rate * quantityBought;
            totalAmount += amount;
            doc.text(item.item, 10, y);
            doc.text(item.rate.toString(), 50, y);
            doc.text(quantityBought.toString(), 90, y);
            doc.text(amount.toString(), 130, y);
            y += 10;
        });

        doc.text('Total Amount: ' + totalAmount, 10, y);

        doc.save('bill.pdf');
    });

    // Function to display available stock summary
    function displayStockSummary() {
        const items = JSON.parse(localStorage.getItem('items'));
        let stockHtml = '<h2>Available Stock</h2>';
        stockHtml += '<table><tr><th>Item</th><th>Rate</th><th>Quantity</th></tr>';

        items.forEach(item => {
            stockHtml += `<tr><td>${item.item}</td><td>${item.rate}</td><td>${item.quantity}</td></tr>`;
        });

        stockHtml += '</table>';
        document.getElementById('stockSummary').innerHTML = stockHtml;
    }

    displayStockSummary(); // Initial call to show stock
});
