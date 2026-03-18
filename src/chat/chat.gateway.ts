import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    path: '/socket.io/',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinProject')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    void client.join(projectId);
    console.log(`User ${client.id} joined project room: ${projectId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { projectId: string; userId: string; content: string },
  ) {
    try {
      const dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ auth0Id: data.userId }, { id: data.userId }],
        },
      });

      if (!dbUser) {
        console.error(
          `User with ID: ${data.userId} not found in the User table`,
        );
        return;
      }

      const newMessage = await this.prisma.chatMessage.create({
        data: {
          content: data.content,
          projectId: data.projectId,
          userId: dbUser.id,
        },
        include: {
          user: true,
        },
      });

      this.server.to(data.projectId).emit('receiveMessage', newMessage);
    } catch (error: any) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log(String(error));
      }
    }
  }
}
