use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    html! {
        <>
            <section>
                <h1>{"hej"}</h1>
                <img src="https://avatars.githubusercontent.com/u/8863817?v=4" alt="Arturas Aleksandraus"/>
            </section>

            <section>
                <a class="col" href="https://github.com/Arty-Facts">
                    <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="Arturas Aleksandraus "/>
                </a>
            </section>
            
            <section>
                <a class="col" href="https://www.linkedin.com/in/arturas-aleksandraus-7ab4a1192/">
                    <img src="https://www.maryville.edu/wp-content/uploads/2015/11/Linkedin-logo-1-550x550-300x300.png" alt="Arturas Aleksandraus"/>
                </a>
            </section>

            <section>
                <a class="col" href="mailto:Arturas.Aleksandraus@ContextVision.se">
                    <img src="https://www.transparentpng.com/thumb/email-logo/blue-arrow-and-open-email-logo-hd-png-yfOWBP.png" alt="Arturas.Aleksandraus@ContextVision.se"/>
                </a>
            </section>
        </>
    }
}

fn main() {
    yew::start_app::<App>();
}