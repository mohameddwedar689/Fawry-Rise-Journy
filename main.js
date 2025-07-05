/* Product Class */
class Product {
    constructor(name, price, quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    isExpired() {
        return false;
    }

    requiresShipping() {
        return false;
    }

    getWeight() {
        return 0;
    }

    getName() {
        return this.name;
    }

    reduceQuantity(amount) {
        this.quantity -= amount;
    }
}

/* Expirable Products Class */
class ExpirableProduct extends Product {
    constructor(name, price, quantity, expired) {
        super(name, price, quantity);
        this.expired = expired;
    }

    isExpired() {
        return this.expired;
    }
}

/* Shippable Products Class */
class ShippableProduct extends Product {
    constructor(name, price, quantity, weight) {
        super(name, price, quantity);
        this.weight = weight;
    }

    requiresShipping() {
        return true;
    }

    getWeight() {
        return this.weight;
    }
}


/* Shippable + Expirable Products Class */
class ShippableExpirableProduct extends ShippableProduct {
    constructor(name, price, quantity, weight, expired) {
        super(name, price, quantity, weight);
        this.expired = expired;
    }

    isExpired() {
        return this.expired;
    }
}

/* Cart and CartItem Classes */
/* Cart Items Class */
class CartItem {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    getSubtotal() {
        return this.product.price * this.quantity;
    }

    getName() {
        return this.product.getName();
    }

    getWeight() {
        return this.product.getWeight() * this.quantity;
    }

    requiresShipping() {
        return this.product.requiresShipping();
    }

    isExpired() {
        return this.product.isExpired();
    }
}

/* Cart Class */
class Cart {
    constructor() {
        this.items = [];
    }

    add(product, quantity) {
        if (quantity > product.quantity) {
            throw new Error(`Only ${product.quantity} units of ${product.name} available.`);
        }
        this.items.push(new CartItem(product, quantity));
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
    }

    getShippableItems() {
        return this.items.filter(item => item.requiresShipping());
    }
}

/* Shipping Service Class */
class ShippingService {
    static ship(items) {
        console.log('\n** Shipment notice **');
        let totalWeight = 0;
        for (const item of items) {
            console.log(`${item.quantity}x ${item.getName()} \t ${item.getWeight()}g`);
            totalWeight += item.getWeight();
        }
        console.log(`Total package weight ${(totalWeight / 1000).toFixed(1)}kg`);
    }
}

/* Customer Class */
class Customer {
    constructor(name, balance) {
        this.name = name;
        this.balance = balance;
    }

    pay(amount) {
        if (amount > this.balance) {
            throw new Error("Insufficient balance.");
        }
        this.balance -= amount;
    }

    getBalance() {
        return this.balance;
    }
}

// Checkout Logic
function checkout(customer, cart) {
    if (cart.isEmpty()) {
        throw new Error("Cart is empty.");
    }

    // Check for expired or out-of-stock products
    for (const item of cart.items) {
        if (item.isExpired()) {
            throw new Error(`Product ${item.getProductName()} is expired.`);
        }
        if (item.quantity > item.product.quantity) {
            throw new Error(`Product ${item.getProductName()} is out of stock.`);
        }
    }

    const subtotal = cart.getSubtotal();
    const shippableItems = cart.getShippableItems();

    
    const shippingFee = shippableItems.length > 0 ? 30 : 0;
    const total = subtotal + shippingFee;

    // Check if customer can pay
    customer.pay(total);

    // Reduce product quantities
    cart.items.forEach(item => {
        item.product.reduceQuantity(item.quantity);
    });

    // Ship if needed
    if (shippableItems.length > 0) {
        ShippingService.ship(cart.items.filter(i => i.requiresShipping()));
    }

    // Print receipt
    console.log('\n** Checkout receipt **');
    cart.items.forEach(item => {
        console.log(`${item.quantity}x ${item.getName()} \t ${item.getSubtotal()}`);
    });
    console.log('----------------------');
    console.log(`Subtotal \t ${subtotal}`);
    console.log(`Shipping \t ${shippingFee}`);
    console.log(`Amount \t\t ${total}`);
    console.log(`Balance \t ${customer.getBalance()}`);
}


// =========================== Test Cases ===========================

// Create products
const cheese = new ShippableExpirableProduct('Cheese', 100, 5, 200, false);
const biscuits = new ExpirableProduct('Biscuits', 50, 10, false);
const tv = new ShippableProduct('TV', 500, 2, 5000);
const scratchCard = new Product('Scratch Card', 10, 100);

// Create a customer
const customer = new Customer('Mohamed Dwedar', 1000);


// Create a cart and add items
const cart = new Cart();
cart.add(cheese, 2); // 2 * 100 = 200
cart.add(biscuits, 1); // 1 * 50 = 50
cart.add(scratchCard, 1) // 1 * 10 = 10

checkout(customer, cart); // Total = 200 + 50 + 10 + 30 (shipping) = 290