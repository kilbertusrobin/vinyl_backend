import { Body, Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent.dto';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-intent')
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(body.amount, body.currency);
  }

  @Post('checkout-session')
  async createCheckoutSession(@Body() body: CreateCheckoutSessionDto) {
    return this.stripeService.createCheckoutSession(
      body.amount,
      body.currency,
      body.successUrl,
      body.cancelUrl
    );
  }
}