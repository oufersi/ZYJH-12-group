import EventEmitter from 'events';
import SocketIO from 'socket.io';

export class SocketServer extends EventEmitter {
  io: any;
  constructor(app: any, option?: any) {
    super()
    const opts = typeof option === 'object' ? option : {};
    this.io = SocketIO(app, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      ...opts
    });

    this.io.sockets.on('connection', socket => {
      this.emit('connection', socket)
    })
  }

  /* 广播事件 */
  emitMessage(event: string, data?: any) {
    this.io?.sockets.emit(event, data);
  }

  /* 向指定房间广播事件 */
  emitRoomMessage(room: string, event: string, data?: any) {
    this.io?.sockets.to(room).emit(event, data);
  }
}
