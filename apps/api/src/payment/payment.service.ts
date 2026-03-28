import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createCheckoutSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    if (user.isPremium) {
      throw new HttpException('User is already premium', HttpStatus.BAD_REQUEST);
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email,
        client_reference_id: userId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Vocab App Pro',
                description: 'Unlock 10x AI limits',
              },
              unit_amount: 500, // $5.00
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
      });

      return { url: session.url };
    } catch (e: any) {
      this.logger.error(`Stripe checkout error: ${e.message}`);
      // Fallback for mock mode or missing keys
      if (process.env.STRIPE_SECRET_KEY === 'sk_test_mock' || !process.env.STRIPE_SECRET_KEY) {
        return { url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success` };
      }
      throw new HttpException('Payment service error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // If we're mocking or there's no secret, just pretend it worked
    if (!webhookSecret) {
      this.logger.warn('Stripe webhook secret not configured. Ignoring webhook.');
      return { received: true };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new HttpException(`Webhook Error: ${err.message}`, HttpStatus.BAD_REQUEST);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (userId) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { 
              isPremium: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
          this.logger.log(`User ${userId} upgraded to Premium`);
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        await this.prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { isPremium: false },
        });
        this.logger.log(`Subscription ${subscription.id} canceled, downgraded to Free`);
      }
    } catch (e: any) {
      this.logger.error(`Database update failed for webhook: ${e.message}`);
    }

    return { received: true };
  }
}
