import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { console } from 'inspector';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('ORDER_SERVICE') private orderService: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('order_created')
  handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    console.log('Order received for processing:', data);
    const isInstock = true;
    if (isInstock) {
      console.log('Inventory available. Processing order.');
      channel.ack(originalMessage);
      // Completed   Order
      this.orderService.emit('order_completed', data);
    } else {
      console.log('Inventory not available.');
      channel.ack(originalMessage);
      //Canceled Order
      this.orderService.emit('order_canceled', data);
    }
  }
}
