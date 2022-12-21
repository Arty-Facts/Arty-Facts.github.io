from lib.utils import ( dict_to_css, 
                        save, 
                        save_html,
                        keyword_translation, 
                        build_attributes, 
                        copy,
                        read_md
                      )
class Text:
    def __init__(self, data:str):
        self.data = data

    def build(self, build_dir):
        return self.data                 
class Node:
    def __init__(self, *components, **kvarg):
        self.components = components
        self.kvarg = keyword_translation(kvarg)


    def build(self, build_dir):
        return  ( f"<{self.__class__.__name__.lower()} {build_attributes(self.kvarg)}>"
                + "".join([component.build(build_dir) for component in self.components])
                + f"</{self.__class__.__name__.lower()}>")


class Html(Node): 
    def __init__(self, *components, name="index.html", **kvarg):
        self.name = name
        super().__init__(*components, **kvarg)

    def build(self, build_dir:str):
        save_html("<!DOCTYPE html>"+super().build(build_dir), build_dir, self.name)

class Head(Node): pass
class Body(Node): pass
class A(Node): pass
class Img(Node): pass
class Section(Node): pass
class Ul(Node): pass
class Li(Node): pass
class Nav(Node): pass
class Title(Node): pass
class Div(Node): pass

class CSS_File:
    def __init__(self, path: str):
        self.path = path

    def build(self, build_dir):
        copy(self.path, build_dir)
        return f"<link  rel='stylesheet' href='{self.path}'>"


class CSS:
    def __init__(self, data: dict, name: str):
        self.data = data
        self.name = name

    def build(self, build_dir):
        save(dict_to_css(self.data), build_dir, self.name)
        return f"<link  rel='stylesheet' href='{self.name}'>"

class JS_File:
    def __init__(self, path: str):
        self.path: str = path

    def build(self, build_dir):
        copy(self.path, build_dir)
        return f"<script defer src={self.path}></script>"

class JS:
    def __init__(self, data:str, path:str):
        self.data = data
        self.path = path

    def build(self, build_dir):
        save(self.data, build_dir, self.name)
        return f"<script defer src={self.name}'></script>"

class MD(Node):
    def __init__(self, path:str, **kvarg):
        self.path = path
        self.kvarg = keyword_translation(kvarg)

    def build(self, build_dir):
        data = read_md(self.path)
        return f'<div markdown="1">{data}</div>'

