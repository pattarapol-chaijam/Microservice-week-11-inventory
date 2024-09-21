import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { console } from 'inspector';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('order_created')
  handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log(`Pattern: ${context.getPattern()}`);
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    console.log('Order received for processing:', data);
    const isInstock = true;
    if (isInstock) {
      console.log('Inventory available. Processing order.');
      channel.ack(originalMessage);
    } else {
      console.log('Inventory not available.');
      channel.nack(originalMessage);
    }
  }
}
