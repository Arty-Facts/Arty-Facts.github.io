from lib.utils import ( dict_to_css, 
                        save, 
                        save_html,
                        keyword_translation, 
                        build_attributes, 
                        copy,
                      )

class Leaf:
    def __init__(self, data:str, **kvarg):
        self.data = data
        self.kvarg = keyword_translation(kvarg)

    def build(self, build_dir):
        return "".join((f"<{self.__class__.__name__.lower()} {build_attributes(self.kvarg)}>",
                        self.data,
                        f"</{self.__class__.__name__.lower()}>"))

class Node:
    def __init__(self, *components, **kvarg):
        self.components = components
        self.kvarg = keyword_translation(kvarg)


    def build(self, build_dir):
        return "".join((f"<{self.__class__.__name__.lower()} {build_attributes(self.kvarg)}>",
                       "".join([component.build(build_dir) for component in self.components]),
                       f"</{self.__class__.__name__.lower()}>"))


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

class Title(Leaf): pass

class CSS_File(Leaf):
    def __init__(self, path: str):
        self.path = path

    def build(self, build_dir):
        copy(self.path, build_dir)
        return f"<link  rel='stylesheet' href='{self.path}'>"


class CSS(Leaf):
    def __init__(self, data: dict, name: str):
        self.data = data
        self.name = name

    def build(self, build_dir):
        save(dict_to_css(self.data), build_dir, self.name)
        return f"<link  rel='stylesheet' href='{self.name}'>"

class JS_File(Leaf):
    def __init__(self, path: str):
        self.path: str = path

    def build(self, build_dir):
        copy(self.path, build_dir)
        return f"<script defer src={self.path}></script>"

class JS(Leaf):
    def __init__(self, data:str, path:str):
        self.data = data
        self.path = path

    def build(self, build_dir):
        save(self.data, build_dir, self.name)
        return f"<script defer src={self.name}'></script>"
