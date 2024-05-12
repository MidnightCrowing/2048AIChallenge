import time
from typing import Union

from sb3_contrib import MaskablePPO

from src.game_env import WebGameEnv
from src.model_exceptions import DifficultIsNotSet

model: Union[MaskablePPO, None] = None
env = WebGameEnv()


class ModelsPath:
    easy = r'models/ppo_2048_easy.zip'
    medium = r'models/ppo_2048_medium.zip'
    hard = r'models/ppo_2048_hard.zip'


def load_model(model_path):
    return MaskablePPO.load(model_path)


def change_difficult(difficult):
    global model

    if difficult == 'easy':
        model = load_model(ModelsPath.easy)
    elif difficult == 'medium':
        model = load_model(ModelsPath.medium)
    else:
        model = load_model(ModelsPath.hard)

    # print('load model finish:', difficult)


def predict(board_info):
    if model is None:
        raise DifficultIsNotSet

    env.set_board(board_info)
    action, _ = model.predict(env.get_observation(), action_masks=env.get_action_mask())
    # action: 0 - up, 1 - down, 2 - left, 3 - right

    time.sleep(0.1)

    return str(action)
