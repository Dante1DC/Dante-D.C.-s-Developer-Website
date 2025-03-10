import { useState, ReactElement } from "react";

interface ProjectType {
  title: string;
  description: string;
  href: string;
  tags: string[];
}

const projectsData: ProjectType[] = [
    {
        title: "Reach Test Prep",
        description:
          "ML-powered ACT prep app that empowers students to reach for a better future.",
        href: "https://reachtestprep.org",
        tags: ["Machine Learning", "Data Science", "Education", "Startup", "PostgreSQL", "React.js"],
      },
      {
        title: "Fine-Tuned",
        description:
          "Rhythm game that explores the connections between technology and the arts.",
        href: "https://github.com/Dante1DC/fine-tuned",
        tags: ["C-Sharp", "Unity", "Music", "Education", "Hackathon"],
      },
      {
        title: "Gone Phishing",
        description:
          "Educational video game that teaches children about Internet information safety. Phishing, be gone!",
        href: "https://github.com/j-seibel/GonePhishing",
        tags: ["C-Sharp", "Unity", "Cybersecurity", "Education", "Hackathon"],
      },
  {
    title: "Speedify Video Playback Controls",
    description:
      "Browser extension that modifies video playback features of certain websites.",
    href: "https://github.com/Dante1DC/Speedify-Video-Playback-Controls",
    tags: ["Javascript", "Extension"],
  },
  {
    title: "CatchFire Sports",
    description:
      "Sports betting company that allows users to bet via a prize-linked savings account.",
    href: "https://catchfiresports.com/",
    tags: ["Javascript", "React.js", "Startup", "Data Science", "PostgreSQL", "Cybersecurity"],
  },
  
  {
    title: "dantedc.dev",
    description: "My developer website! You're on it right now!",
    href: "https://dantedc.dev",
    tags: ["Javascript", "React.js"],
  },
  {
    title: "Rex: Command-Line Utility",
    description: "Keyboard-only command-line utility built in Ruby.",
    href: "https://github.com/Dante1DC/rex-cli-util",
    tags: ["Ruby", "CLI"],
  },
  {
    title: "Grid Cropper for Instagram",
    description: "Automating cropping of images for Instagram carousel posts.",
    href: "https://github.com/Dante1DC/Grid-Cropper-for-Instagram",
    tags: ["Ruby"],
  },
];
const Projects: React.FC = (): ReactElement => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projectsData.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="projects-container">
      <input
        type="text"
        placeholder="Search for projects"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <ul className="projects-list">
        {filteredProjects.map((project, index) => (
          <li key={index} className="project-item">
            <a
              href={project.href}
              className="project-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="project-title">{project.title}</div>
              <div className="project-description">
                {project.description}
              </div>
            </a>
            <div className="project-tags">
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="hub-link project-tag"
                  onClick={() => setSearchQuery(tag)}
                >
                  #{tag.toLowerCase().replace(/\s+/g, "_")}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {/* Inline CSS Styles */}
      <style>
        {`
          .projects-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            font-family: sans-serif;
          }

          .search-input {
            width: 100%;
            padding: 10px 0;
            margin-bottom: 20px;
            font-size: 16px;
            border: none;
            border-bottom: 1px solid #555;
            background: transparent;
            color: #fff;
            outline: none;
          }

          .search-input::placeholder {
            color: #aaa;
          }

          .projects-list {
            list-style-type: none;
            padding: 0;
          }

          .project-item {
            display: flex;
            flex-direction: column;
            padding: 15px 10px;
            border-bottom: 1px solid #444; /* Dark gray separator */
          }

          .project-item:hover {
            background-color: #222; /* Slightly lighter background on hover */
          }

          .project-link {
            text-decoration: none;
            color: inherit;
          }

          .project-title {
            font-weight: bold;
            font-size: 20px;
            color: #fff; /* White title text */
          }

          .project-description {
            font-size: 14px;
            color: #bbb; /* Light gray for description */
          }

          .project-tags {
            margin-top: 5px;
          }

          .hub-link {
            font-size: 15px;
            color: #fff;
            text-decoration: none;
            display: inline-block;
            margin-right: 10px;
            cursor: pointer;
          }

          .hub-link:hover {
            text-shadow: #f72585 2px 2px;
          }

          body {
            background-color: #121212; /* Dark background for contrast */
            color: #fff;
          }
        `}
      </style>
    </div>
  );
};

export default Projects;
