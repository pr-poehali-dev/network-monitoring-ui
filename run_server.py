#!/usr/bin/env python3
"""
Скрипт для запуска WebSocket сервера с SSL (опционально)
"""

import ssl
import asyncio
import argparse
from websocket_server import WebSocketServer


def create_ssl_context(cert_file: str, key_file: str) -> ssl.SSLContext:
    """Создает SSL контекст для WSS"""
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(cert_file, key_file)
    return ssl_context


async def main():
    parser = argparse.ArgumentParser(description='WebSocket сервер для тестирования')
    parser.add_argument('--host', default='0.0.0.0', help='Хост для привязки (по умолчанию: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=10009, help='Порт для привязки (по умолчанию: 10009)')
    parser.add_argument('--ssl-cert', help='Путь к SSL сертификату (для WSS)')
    parser.add_argument('--ssl-key', help='Путь к SSL ключу (для WSS)')
    
    args = parser.parse_args()
    
    server_instance = WebSocketServer(args.host, args.port)
    
    if args.ssl_cert and args.ssl_key:
        print(f"Запуск WSS сервера на {args.host}:{args.port}")
        ssl_context = create_ssl_context(args.ssl_cert, args.ssl_key)
        server = await server_instance.start_server_with_ssl(ssl_context)
    else:
        print(f"Запуск WS сервера на {args.host}:{args.port}")
        server = await server_instance.start_server()
    
    try:
        await server.wait_closed()
    except KeyboardInterrupt:
        print("\nОстанавливаем сервер...")
    finally:
        server.close()
        await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())