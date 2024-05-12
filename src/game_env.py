import math
from typing import Literal

import gym
import numpy as np
from gym import spaces


class WebGameEnv(gym.Env):

    def __init__(self):
        super().__init__()
        self._reward = 0
        self._grid_size = 4
        self._board = None

        # 定义动作空间
        self.action_space = gym.spaces.Discrete(4)  # 根据需要设置动作空间的大小

        # 定义观察空间
        low = np.zeros((4, 4), dtype=int)  # 棋盘中每个单元格的最小值
        high = np.ones((4, 4), dtype=int) * 2048  # 棋盘中每个单元格的最大值
        self.observation_space = spaces.Box(low=low, high=high, dtype=int)

    def set_board(self, board_info):
        self._board = board_info

    def render(self, mode="human"):
        pass

    def step(self, action):
        """
        执行智能体采取的动作，并返回环境的反馈信息。
        """
        pass

    def get_action_mask(self):
        # noinspection PyTypeChecker
        return np.array([[self._check_action_validity(a) for a in range(self.action_space.n)]])

    # 检查动作是否合理
    def _check_action_validity(self, action: Literal[0, 1, 2, 3]):
        if action == 0:  # UP
            new_board = [list(row) for row in zip(*self._board)]
            new_board = [self._move_line(row) for row in new_board]
            new_board = [list(row) for row in zip(*new_board)]
        elif action == 1:  # DOWN
            new_board = [list(row) for row in zip(*self._board[::-1])]
            new_board = [self._move_line(row) for row in new_board]
            new_board = [list(row) for row in zip(*new_board)][::-1]
        elif action == 2:  # LEFT
            new_board = [self._move_line(row) for row in self._board]
        elif action == 3:  # RIGHT
            new_board = [self._move_line(row[::-1])[::-1] for row in self._board]
        else:
            raise Exception("Invalid direction")

        check_continue = self._board != new_board

        return check_continue

    def _move_line(self, line):
        new_line = [0] * len(line)
        index = 0
        for num in line:
            if num != 0:
                if new_line[index] == 0:
                    new_line[index] = num
                elif new_line[index] == num:
                    new_line[index] *= 2
                    self._reward += new_line[index]  # 计分
                    index += 1
                else:
                    index += 1
                    new_line[index] = num
        return new_line

    def get_observation(self):
        obs = np.zeros((84, 84, 3), dtype=np.uint8)

        def turn(n):
            if n == 0:
                return [0, 0, 0]
            else:
                intensity = int(math.log(n, 2) / 11 * 255)
                return [intensity, intensity, intensity]

        for y in range(self._grid_size):
            for x in range(self._grid_size):
                obs[x * 21:x * 21 + 21, y * 21:y * 21 + 21, :] = turn(self._board[y][x])

        return obs
