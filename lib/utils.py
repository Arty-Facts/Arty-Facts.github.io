from bs4 import BeautifulSoup
from pathlib import Path
import shutil

def dict_to_css(data):
    css = []
    for name, style in sorted(data.items()):
        css.append(f"{name}{{")
        for att, value in sorted(style.items()):
            css.append(f"\t{att} = {value};")

        css.append("}")
    return "\n".join(css)

def save(data:str, root:str, name:str):
    root = Path(root)
    if not root.is_dir():
        root.mkdir(parents=True, exist_ok=True)
    file = root / name
    with open(file, "w") as f:
        f.write(data)

def keyword_translation(data:dict):
    if "cls" in data:
        data["class"] = data["cls"]
        data.pop("cls")
    return data

def save_html(data:str, root:str, name:str):
    soup = BeautifulSoup(data, features="html.parser")
    save(soup.prettify(), root, name)

def build_attributes(data:dict):
    if data == None:
        return ""
    return ''.join((f"{item}='{value}'" for item, value in data.items()))

def copy(src, dst):
    shutil.copy(src, dst)