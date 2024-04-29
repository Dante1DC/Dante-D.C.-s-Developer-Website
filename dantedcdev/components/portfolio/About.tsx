import { ReactElement } from "react";

const Info: React.FC<{title: string, description: string}> = ({ title, description }): ReactElement => {

    return (
        <div className="info">
            <h3 style={{ "fontSize": "16px", "fontWeight": "bold", "minWidth": "160px" }}>{title}</h3>
            <span style={{ "color": "#a9a9a9", "fontSize": "16px" }}>{description}</span>
        </div>
    )
}

const About: React.FC = (): ReactElement => {
    return (
        <div id="test" className="about">
            <p className="about-paragraph">I&apos;m a sophomore Data Science and Philosophy major at the Raikes School in Nebraska. Ever since I started coding on calculators in middle school, I fell in love with the world of programming. I love machine learning, cybersecurity, and systems engineering, and I&apos;m looking for roles in any of those fields with an emphasis on learning new skills.</p>
            <div className="quick-facts">
                <Info title="Location" description="Lincoln, NE" />
                <Info title="Graduating" description="2026" />
                <Info title="Courses Taken" description="CS I & II, SE III & IV, Discrete Math & Data Structures, Statistics, Data & Models, Data & Network Security" />
                <Info title="Skills" description="Python, Ruby on Rails, Java, C, C#, PostgreSQL, React.js, Node.js" />
                <Info title="Learning" description="Rust, TensorFlow" />
            </div>
        </div>
    )
}

export default About;