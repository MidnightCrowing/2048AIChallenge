from src.gui import run_gui
from src.websocket_server import run_server

if __name__ == '__main__':
    run_server(host='0.0.0.0', port=8413)
    run_gui()
