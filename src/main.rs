use yew::prelude::*;

#[function_component(App)]
fn app() -> Html {
    html! {
        <>
            <img class="rounded-circle img-thumbnail" src="https://avatars.githubusercontent.com/u/8863817?v=4" alt="Arturas Aleksandraus"/>
            <footer class="row">
                <a class="col" href="https://github.com/Arty-Facts">
                    <img class="float-start w-25" src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="Arturas Aleksandraus "/>
                </a>
                <a class="col" href="https://www.linkedin.com/in/arturas-aleksandraus-7ab4a1192/">
                    <img class="float-start w-25" src="https://www.maryville.edu/wp-content/uploads/2015/11/Linkedin-logo-1-550x550-300x300.png" alt="Arturas Aleksandraus"/>
                </a>
                <a class="col" href="mailto:Arturas.Aleksandraus@ContextVision.se">
                <img class="float-start w-25" src="https://www.transparentpng.com/thumb/email-logo/blue-arrow-and-open-email-logo-hd-png-yfOWBP.png" alt="Arturas.Aleksandraus@ContextVision.se"/>
                </a>
            </footer>
        </>
    }
}

fn main() {
    yew::start_app::<App>();
}