import React from 'react';
import AboutCommand from './about';
import ProjectsCommand from './projects';
import ResumeCommand from './resume';
import BlogCommand from './blog';
import DashboardCommand from './dashboard';
import ContactCommand from './contact';
import HelpCommand from './help';
import type { ResumeData } from '../../lib/parseResume';

export interface CommandProps {
  resumeData?: ResumeData;
}

export const COMMANDS: Record<string, React.FC<CommandProps>> = {
  about: AboutCommand,
  projects: ProjectsCommand,
  resume: (props: CommandProps) =>
    props.resumeData
      ? React.createElement(ResumeCommand, { resumeData: props.resumeData })
      : React.createElement('span', { className: 'text-red-400' }, 'Error: resume data not available'),
  blog: BlogCommand,
  dashboard: DashboardCommand,
  contact: ContactCommand,
  help: HelpCommand,
};

export type CommandName = keyof typeof COMMANDS;
