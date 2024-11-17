import { ReactElement } from "react";

import Link from "next/link";

const Square: React.FC<{ text: string }> = ({ text }): ReactElement => {

    const scroll = text + " " + text + " " + text + " " + text + " " + text + " " + text;

    return (
        <div className="square-container">
            <div className="square-mask">
                <div className="square">
                    <div className="scroll-container">
                        <span className="sqscroller scroll-text">{scroll}</span>
                    </div>
                    <div className="scroll-container">
                        <span className="sqscroller scroll-text">{scroll}</span>
                    </div>
                    <div className="scroll-container">
                        <span className="sqscroller swdir scroll-text">{scroll}</span>
                    </div>
                    <div className="scroll-container">
                        <span className="sqscroller scroll-text">{scroll}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Hub: React.FC = (): ReactElement => {

    return (
        <div className="hub">
            <Square text="dante dyches-chandler" />
            <div className="hub-links-container">
                <h1>dantedc.dev</h1>
                <div className="hub-links">
                    <Link className="hub-link" href="portfolio">/portfolio</Link>
                    <a className="hub-link" href="https://www.reachtestprep.org" target="_blank" rel="noopener noreferrer">/reach</a>
                    <a className="hub-link" href="https://www.catchfiresports.com" target="_blank" rel="noopener noreferrer">/catchfire</a>
                    <Link className="hub-link" href="links">/links</Link>

                </div>
            </div>
        </div>
    )
}

export default Hub;