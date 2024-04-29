import { ReactElement } from "react";

const CFHome: React.FC = (): ReactElement => {

    return (
        <div style={{ "minHeight": "100vh", "width": "100vw", "background": "#161616", "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
            <div >
                <h1 className="catchfire" style={{ "fontSize": "162px", "display": "inline-block", "textAlign": "center", "paddingLeft": "40px" }}>CatchFire</h1>
                <p className="catchfire-links" style={{ "fontSize": "72px", "display": "inline-block", "textAlign": "center", "paddingLeft": "40px" }}><a href="https://catchfiresports.com/">Join the beta</a> and learn to bet better</p>
            </div>
        </div>
    )
}

export default CFHome;