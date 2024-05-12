import os

import webview


def run_gui(path=r'app', title='2048AIChallenge', width=850, height=750, confirm_close=False):
    webview.create_window(
        title=title,
        url=os.path.join(path, 'index.html'),
        width=width,
        height=height,
        confirm_close=confirm_close
    )
    webview.start()
