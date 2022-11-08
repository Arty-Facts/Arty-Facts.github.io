from lib.componets import *
from lib.utils import save_html

links = [
    ("https://github.com/Arty-Facts", "https://cdn-icons-png.flaticon.com/512/25/25231.png"),
    ("https://www.linkedin.com/in/arturas-aleksandraus-7ab4a1192/", "https://www.maryville.edu/wp-content/uploads/2015/11/Linkedin-logo-1-550x550-300x300.png"),
    ("mailto:Arturas.Aleksandraus@ContextVision.se", "https://www.transparentpng.com/thumb/email-logo/blue-arrow-and-open-email-logo-hd-png-yfOWBP.png"),

]

site = Html(
    Head(
        Title("Arty Facts"),
        CSS_File("style.css"), 
        JS_File("app.js"), 
        lang="en",
    ), 
    Body(
        *[Section(
            A(
                Img(src=img), 
                href=link
            ), 
            cls="hidden") for link, img in links], 
        Section(
            MD("content/home.md", cls="mdPage"),
            cls="hidden"
            )
    ),
)

site.build("build")