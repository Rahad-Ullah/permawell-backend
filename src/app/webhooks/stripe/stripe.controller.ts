import { Request, Response } from 'express';
import { stripe } from '../../../config/stripe';
import config from '../../../config';
import { stripeEventHandler } from './stripe.handler';
import { Stripe } from 'stripe/cjs/stripe.core';

export const stripeWebhookController = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      config.stripe.webhook_secret!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await stripeEventHandler(event);
  } catch (err) {
    console.error('Stripe webhook processing failed:', err);
  }

  res.status(200).json({ received: true });
};
