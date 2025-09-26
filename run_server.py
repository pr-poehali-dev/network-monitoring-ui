#!/usr/bin/env python3
"""
Скрипт для запуска WebSocket сервера с SSL
"""

import asyncio
import argparse
from websocket_server import WebSocketServer


async def main():
    parser = argparse.ArgumentParser(description='WebSocket сервер для тестирования')
    parser.add_argument('--host', default='0.0.0.0', help='Хост для привязки (по умолчанию: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=10009, help='Порт для привязки (по умолчанию: 10009)')
    parser.add_argument('--no-ssl', action='store_true', help='Отключить SSL (использовать WS вместо WSS)')
    
    args = parser.parse_args()
    
    server_instance = WebSocketServer(args.host, args.port)
    
    # По умолчанию используем SSL, отключаем только если указан флаг --no-ssl
    use_ssl = not args.no_ssl
    
    protocol = "WSS" if use_ssl else "WS"
    print(f"Запуск {protocol} сервера на {args.host}:{args.port}")
    
    if use_ssl:
        print("Используются SSL сертификаты: cert.pem и cert.key")
    
    server = await server_instance.start_server(use_ssl=use_ssl)
    
    try:
        await server.wait_closed()
    except KeyboardInterrupt:
        print("\nОстанавливаем сервер...")
    finally:
        server.close()
        await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())