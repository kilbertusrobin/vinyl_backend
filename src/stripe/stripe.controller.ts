import { Body, Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-intent')
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(body.amount, body.currency);
  }
}