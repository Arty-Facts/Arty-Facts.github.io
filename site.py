from lib.componets import *
from lib.utils import save_html

links = [
    ("https://github.com/Arty-Facts",
     "https://cdn-icons-png.flaticon.com/512/25/25231.png"),
    ("https://www.linkedin.com/in/arturas-aleksandraus-7ab4a1192/",
     "https://www.maryville.edu/wp-content/uploads/2015/11/Linkedin-logo-1-550x550-300x300.png"),
    ("mailto:Arturas.Aleksandraus@ContextVision.se",
     "https://www.transparentpng.com/thumb/email-logo/blue-arrow-and-open-email-logo-hd-png-yfOWBP.png"),

]

site = Html(
    Head(
        Title(Text("Arty Facts")),
        CSS_File("style.css"),
        JS_File("app.js"),
        lang="en",
    ),
    Body(
        Nav(
            Li(A(Text("Home"), href="home", cls="active")),
            Li(A(Text("News"), href="news")),
            Li(A(Text("Contanst"), href="contanst")),
            Li(A(Text("About"), href="about")),
            cls="menu",
        ),
        Div(
            Nav(
                Li(A(Text("Gans"), cls="active"), cls="menu-transition"),
                Li(A(Text("Defusion")), cls="menu-transition"),
                Li(A(Text("Tools")), cls="menu-transition"),
                Li(A(Text("Summury")), cls="menu-transition"),
                cls="side-menu",
            ),
            Div(
                Section(
                    MD("content/home.md", cls="mdPage"),
                    cls="hidden"),
                *[Section(
                    A(
                        Img(src=img),
                        href=link
                    ),
                    cls="hidden") for link, img in links
                ],
                cls="content" , 
            ),
            cls="workspace" , 
        )
    ),
)

site.build("build")
