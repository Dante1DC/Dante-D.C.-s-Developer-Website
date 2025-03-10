import { MutableRefObject, ReactElement, useRef } from "react";
import Image from 'next/image';
import styles from './gallery.module.css';

const Project: React.FC<{ title: string, description: string, tags: Array<string>, img: string, href: string, descriptionLong: string }> = ({ title, description, tags = [], img = "", href = "", descriptionLong }): ReactElement => {

    const mouseEnter = (): void => {
        document.querySelector("#hovertext")!.textContent = descriptionLong;
    }

    const mouseLeave = (): void => {
        document.querySelector("#hovertext")!.textContent = "";
    }

    return (
        <a className={styles.gallery} href={href} onMouseEnter={ mouseEnter } onMouseLeave={ mouseLeave }>
            <div className={styles.gallery}>
                <Image src={img} className={styles.galleryitem} height={250} width={250} alt={title} />
            </div>
        </a>
    )
}

const ProjectHoverText: React.FC = (): ReactElement => {

    return (
        <div className="hovertext-container">
            <p id="hovertext"></p>
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
        <div className="projects">
            <ProjectHoverText />
            <Project tags={["Javascript", "Extension"]} title="Speedify" descriptionLong={descriptionsLong[0]} description={descriptions[0]} href={"https://github.com/Dante1DC/Speedify-Video-Playback-Controls"} img={"/portfolio/speedify.webp"} />
            <Project tags={["Javascript", "React.js", "Startup", "PostgreSQL"]} title="CatchFire" descriptionLong={descriptionsLong[1]} description={descriptions[1]} href={"https://trycatchfire.netlify.app/"} img={"/portfolio/catchfirelogosquaresmall.png"} />
            <Project tags={["C#", "Unity", "Cybersecurity", "Education"]} title="Gone Phishing" descriptionLong={descriptionsLong[2]} description={descriptions[2]} href={"https://github.com/j-seibel/GonePhishing"} img={"/portfolio/gonephishing.png"} />
            <Project tags={["Javascript", "React.js"]} title="dante-dc.dev" descriptionLong={descriptionsLong[3]} description={descriptions[3]} href={"https://dantedc.dev"} img={"/portfolio/gradient.png"} />
        </div>
    )
}

export default Projects;