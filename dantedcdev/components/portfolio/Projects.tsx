import { MutableRefObject, ReactElement, useRef } from "react";
import Image from 'next/image';

const Project: React.FC<{ title: string, description: string, tags: Array<string>, img: string, href: string, descriptionLong: string }> = ({ title, description, tags = [], img = "", href = "", descriptionLong }): ReactElement => {

    const mouseEnter = (): void => {
        document.querySelector("#hovertext")!.textContent = descriptionLong;
    }

    const mouseLeave = (): void => {
        document.querySelector("#hovertext")!.textContent = "";
    }

    return (
        <a className="portfolio-project" href={href} onMouseEnter={ mouseEnter } onMouseLeave={ mouseLeave }>
            <div className="project-img-container" >
                <Image src={img} className="project-img" height={80} width={80} alt={title} />
            </div>
        </a>
    )
}

const ProjectHoverText: React.FC = (): ReactElement => {

    return (
        <div className="hovertext-container">
            <p id="hovertext" style={{ fontSize: '1.5rem'}}></p>
        </div>
    )
}

const Projects: React.FC = (): ReactElement => {

    const descriptionsLong = [
        "Modifies the video playback features of certain websites, specifically YouTube, to allow for custom speed inputs and the ability to skip unskippable ads",
        "Sports betting company that was born out of a winning hackathon project that allows users to bet on sports games via a prize-linked savings account, winning sweepstakes awards (Currently in beta)",
        "Educates children on the importance of Internet information safety through a series of engaging mini-games ranging topics such as phishing scams all the way to the dangers of cryptocurrency, all in an approachable and fun manner, 2nd place @ Cornhacks 2023 Overall",
        "My developer website!",
    ]

    const descriptions = [
        "Browser extension",
        "Sportsbook website",
        "Educational videogame",
        "You're on it right now!",
    ]

    return (
        <div className="projects" >
            <ProjectHoverText />
            <Project tags={["Javascript", "Extension"]} title="" descriptionLong={descriptionsLong[0]} description="" href={"https://github.com/Dante1DC/Speedify-Video-Playback-Controls"} img={"/portfolio/speedify.png"} />
            <Project tags={["Javascript", "React.js", "Startup", "PostgreSQL"]} title="" descriptionLong={descriptionsLong[1]} description="" href={"https://catchfiresports.com/"} img={"/portfolio/catchfirelogosquaresmall.png"} />
            <Project tags={["C#", "Unity", "Cybersecurity", "Education"]} title="" descriptionLong={descriptionsLong[2]} description="" href={"https://github.com/j-seibel/GonePhishing"} img={"/portfolio/gonephishing.png"} />
            <Project tags={["Javascript", "React.js"]} title="" descriptionLong={descriptionsLong[3]} description="" href={"https://diditupe.dev"} img={"/portfolio/gradient.png"} />
        </div>
    )
}

export default Projects;