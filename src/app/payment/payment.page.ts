import { Component, OnInit } from '@angular/core';

import { first, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { loadStripe, Appearance, StripeElements } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  emailAddress: string;
  elements: StripeElements;
  stripe: any;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.initial1ze();
  }

  async initial1ze() {
    this.stripe = await loadStripe(environment.stripe.publisher_key);

    const response = await this.http
      .post<any>(environment.api + 'create-payment-intent', {})
      .pipe(first());
    const { clientSecret } = await firstValueFrom(response);

    const appearance: Appearance = {
      theme: 'stripe',
    };
    this.elements = this.stripe.elements({ appearance, clientSecret });

    const linkAuthenticationElement =
      this.elements.create('linkAuthentication');
    linkAuthenticationElement.mount('#link-authentication-element');

    linkAuthenticationElement.on('change', (event) => {
      this.emailAddress = event.value.email;
    });

    const paymentElement = this.elements.create('payment', {
      layout: 'tabs',
    });
    paymentElement.mount('#payment-element');

    // Create the Address Element in billing mode
    const billingAddressElement = this.elements.create('address', {
      mode: 'billing',
    });

    billingAddressElement.mount('#billing-address-element');
  }

  async submitPayment() {
    console.log('Here');
    const elements = this.elements;
    const { error } = await this.stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        // return_url: 'http://localhost:4242/checkout.html',
        return_url: 'http://localhost:8100/checkout',
        receipt_email: this.emailAddress,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      this.showMessage(error.message);
    } else {
      this.showMessage('An unexpected error occurred.');
    }
  }

  showMessage(messageText) {
    const messageContainer = document.querySelector('#payment-message');

    messageContainer.classList.remove('hidden');
    messageContainer.textContent = messageText;

    setTimeout(function () {
      messageContainer.classList.add('hidden');
      messageContainer.textContent = '';
    }, 4000);
  }
}
