import logging
from threading import Thread
from time import sleep

from flask import Flask
from flask_socketio import SocketIO

from src.model_exceptions import DifficultIsNotSet
from src.model_predict import change_difficult
from src.model_predict import predict as model_predict

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")


# @socketio.on('connect')
# def handle_connect():
#     print('Client connected')
#
#
# @socketio.on('disconnect')
# def handle_disconnect():
#     print('Client disconnected')


@socketio.on('board_info')
def handle_message(board_info):
    try:
        action = model_predict(board_info)
    except DifficultIsNotSet:
        send_data(SendDate.GetDifficult)
        sleep(0.2)
        send_data(SendDate.GetBoard)
    else:
        send_data(SendDate.Move, action)


@socketio.on('game_difficult_change')
def handle_message(difficult):
    change_difficult(difficult)


class SendDate:
    Reset = 'reset'
    Check = 'check'
    Move = 'move'
    GetDifficult = 'get_difficult'
    GetBoard = 'get_board'


def send_data(event='message', data=None):
    if event == SendDate.Reset:
        socketio.emit('reset')
    elif event == SendDate.Check:
        socketio.emit('check')
    elif event == SendDate.Move:
        socketio.emit('move', data)
    elif event == SendDate.GetDifficult:
        socketio.emit('get_difficult')
    elif event == SendDate.GetBoard:
        socketio.emit('get_board')
    else:
        socketio.emit(event, data)


def run_server(host='0.0.0.0', port=98413):
    thread = Thread(
        target=socketio.run,
        kwargs={'app': app, 'host': host, 'port': port, 'debug': False, 'allow_unsafe_werkzeug': True}
    )
    thread.daemon = True
    thread.start()
