// Product and Shipping Constants
const SINGLE_PRODUCT_PRICE = 20.00;
const SHIPPING_COSTS = {
  standard: 5.00,
  rural: 5.00
};

// Get DOM elements
const paymentSelect = document.getElementById('payment-method');
const paypalContainer = document.getElementById('paypal-button-container');
const stripeContainer = document.getElementById('stripe-card-container');
const poliContainer = document.getElementById('poli-button-container');
const orderForm = document.getElementById('order-form');
const orderSuccessMessage = document.getElementById('order-success');
const orderErrorMessage = document.getElementById('order-error');

const quantityInput = document.getElementById('quantity');
const shippingTypeSelect = document.getElementById('shipping-type');
const productPriceDisplay = document.getElementById('product-price');
const shippingCostDisplay = document.getElementById('shipping-cost');
const totalPriceDisplay = document.getElementById('total-price');

let stripe, cardElement;

// Initialize Stripe
function initStripe() {
  // Replace with your actual Stripe publishable key
  stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
  const elements = stripe.elements();
  cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#333',
        fontFamily: 'Poppins, sans-serif',
        '::placeholder': {
          color: '#aaa',
        },
      },
    },
  });
  cardElement.mount('#card-element');
}

// Calculate prices
function updatePrices() {
  const quantity = Math.max(1, parseInt(quantityInput.value) || 1);
  const subtotalPrice = SINGLE_PRODUCT_PRICE * quantity;
  const selectedShippingType = shippingTypeSelect.value;
  const currentShippingCost = SHIPPING_COSTS[selectedShippingType];
  const currentTotalPrice = subtotalPrice + currentShippingCost;

  productPriceDisplay.textContent = `$${subtotalPrice.toFixed(2)}`;
  shippingCostDisplay.textContent = `$${currentShippingCost.toFixed(2)}`;
  totalPriceDisplay.textContent = `$${currentTotalPrice.toFixed(2)}`;

  return currentTotalPrice;
}

// Get order data
function getOrderData() {
  return {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    quantity: parseInt(quantityInput.value),
    address: document.getElementById('address').value,
    shippingType: shippingTypeSelect.value,
    total: updatePrices()
  };
}

// Show success message
function showSuccess() {
  orderSuccessMessage.style.display = 'block';
  orderErrorMessage.style.display = 'none';
  setTimeout(() => {
    orderSuccessMessage.style.display = 'none';
    orderForm.reset();
    paymentSelect.dispatchEvent(new Event('change'));
    updatePrices();
  }, 3500);
}

// Show error message
function showError(message) {
  orderErrorMessage.textContent = message;
  orderErrorMessage.style.display = 'block';
  orderSuccessMessage.style.display = 'none';
  setTimeout(() => {
    orderErrorMessage.style.display = 'none';
  }, 5000);
}

// Initialize PayPal
function initPayPal() {
  paypalContainer.innerHTML = '';
  
  paypal.Buttons({
    createOrder: function(data, actions) {
      if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
      }
      
      const orderData = getOrderData();
      return actions.order.create({
        purchase_units: [{
          description: `Umbrella Baby x${orderData.quantity}`,
          amount: {
            value: orderData.total.toFixed(2)
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        console.log('Payment completed:', details);
        
        // Here you would send the order to your server
        // Example:
        // fetch('/api/orders', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...getOrderData(),
        //     paymentId: details.id,
        //     paymentStatus: details.status
        //   })
        // });
        
        showSuccess();
      });
    },
    onError: function(err) {
      console.error('PayPal error:', err);
      showError('Payment failed. Please try again.');
    }
  }).render('#paypal-button-container');
}

// Handle Stripe payment
async function handleStripePayment() {
  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    return;
  }

  const orderData = getOrderData();
  const stripeButton = document.getElementById('stripe-pay-button');
  stripeButton.disabled = true;
  stripeButton.textContent = 'Processing...';

  try {
    // In production, you would:
    // 1. Create a payment intent on your server
    // 2. Get the client secret
    // 3. Confirm the payment with Stripe
    
    // Example production code:
    // const response = await fetch('/api/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData)
    // });
    // const { clientSecret } = await response.json();
    // 
    // const result = await stripe.confirmCardPayment(clientSecret, {
    //   payment_method: {
    //     card: cardElement,
    //     billing_details: {
    //       name: orderData.name,
    //       email: orderData.email
    //     }
    //   }
    // });
    // 
    // if (result.error) {
    //   throw new Error(result.error.message);
    // }
    
    // For demo purposes, simulate success
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showSuccess();
  } catch (error) {
    console.error('Stripe error:', error);
    showError('Payment failed. Please check your card details.');
  } finally {
    stripeButton.disabled = false;
    stripeButton.textContent = 'Pay with Card';
  }
}

// Handle POLi payment
async function handlePoliPayment() {
  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    return;
  }

  const orderData = getOrderData();
  const poliButton = document.getElementById('poli-pay-button');
  poliButton.disabled = true;
  poliButton.textContent = 'Redirecting...';

  try {
    // In production, you would:
    // 1. Create a POLi transaction on your server
    // 2. Get the redirect URL
    // 3. Redirect the user to POLi
    
    // Example production code:
    // const response = await fetch('/api/create-poli-transaction', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData)
    // });
    // const { redirectUrl } = await response.json();
    // window.location.href = redirectUrl;
    
    // For demo purposes, simulate success
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showSuccess();
  } catch (error) {
    console.error('POLi error:', error);
    showError('Payment failed. Please try again.');
  } finally {
    poliButton.disabled = false;
    poliButton.textContent = 'Pay with POLi';
  }
}

// Show/hide payment method containers
paymentSelect.addEventListener('change', function() {
  paypalContainer.style.display = this.value === 'paypal' ? '' : 'none';
  stripeContainer.style.display = this.value === 'credit-card' ? '' : 'none';
  poliContainer.style.display = this.value === 'poli' ? '' : 'none';

  if (this.value === 'paypal') {
    initPayPal();
  }
});

// Event listeners
shippingTypeSelect.addEventListener('change', updatePrices);
quantityInput.addEventListener('input', updatePrices);
document.getElementById('stripe-pay-button').addEventListener('click', handleStripePayment);
document.getElementById('poli-pay-button').addEventListener('click', handlePoliPayment);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initStripe();
  updatePrices();
  paymentSelect.dispatchEvent(new Event('change'));
});