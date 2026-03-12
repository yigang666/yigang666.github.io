import fs from 'fs';
import path from 'path';

// --- Types ---

export interface AboutData {
  name: string;
  role: string;
  role_zh: string;
  location: string;
  location_zh: string;
  company: string;
  bio: string;
  bio_zh: string;
  focus: string[];
  focus_zh: string[];
  technologies: string[];
}

export interface ContactData {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  role_zh: string;
  period: string;
  bullets: string[];
  bullets_zh: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  degree_zh: string;
  period: string;
}

export interface Certification {
  name: string;
  url?: string;
}

export interface ResumeSection {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: {
    technical: string[];
    certifications: Certification[];
    languages: string[];
  };
}

export interface ProjectData {
  name: string;
  status: 'LIVE' | 'INTERNAL';
  url: string | null;
  description: string;
  description_zh: string;
  tech: string[];
}

export interface BlogPost {
  title: string;
  title_zh: string;
  date: string;
  tags: string[];
  summary: string;
  summary_zh: string;
}

export interface SiteContent {
  about: AboutData;
  contact: ContactData;
  resume: ResumeSection;
  projects: ProjectData[];
  blog: BlogPost[];
}

// --- Helpers ---

function splitBySections(lines: string[], level: number): Record<string, string[]> {
  const prefix = '#'.repeat(level) + ' ';
  const deeper = '#'.repeat(level + 1);
  const sections: Record<string, string[]> = {};
  let current = '';

  for (const line of lines) {
    if (line.startsWith(prefix) && !line.startsWith(deeper)) {
      current = line.slice(level + 1).trim();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }

  return sections;
}

function getValue(lines: string[], key: string): string {
  for (const line of lines) {
    const match = line.match(new RegExp(`^${key}:\\s*(.+)$`));
    if (match) return match[1].trim();
  }
  return '';
}

/** English bullets: lines starting with "- " (excluding "- **" and "zh- ") */
function getBullets(lines: string[]): string[] {
  return lines
    .filter(l => {
      const t = l.trim();
      return t.startsWith('- ') && !t.startsWith('- **') && !t.startsWith('zh-');
    })
    .map(l => l.trim().slice(2).trim());
}

/** Certifications: "- Name" or "- Name | https://url" */
function getCertifications(lines: string[]): Certification[] {
  return lines
    .filter(l => l.trim().startsWith('- ') && !l.trim().startsWith('- **'))
    .map(l => {
      const text = l.trim().slice(2).trim();
      const pipeIdx = text.indexOf(' | ');
      if (pipeIdx !== -1) {
        return { name: text.slice(0, pipeIdx).trim(), url: text.slice(pipeIdx + 3).trim() };
      }
      return { name: text };
    });
}

/** Chinese bullets: lines starting with "zh- " */
function getBulletsZh(lines: string[]): string[] {
  return lines
    .filter(l => l.trim().startsWith('zh- '))
    .map(l => l.trim().slice(3).trim());
}

// --- Section parsers ---

function parseAbout(lines: string[]): AboutData {
  const sub = splitBySections(lines, 3);
  return {
    name: getValue(lines, 'name'),
    role: getValue(lines, 'role'),
    role_zh: getValue(lines, 'role_zh'),
    location: getValue(lines, 'location'),
    location_zh: getValue(lines, 'location_zh'),
    company: getValue(lines, 'company'),
    bio: getValue(lines, 'bio'),
    bio_zh: getValue(lines, 'bio_zh'),
    focus: getBullets(sub['focus'] ?? []),
    focus_zh: getBullets(sub['focus_zh'] ?? []),
    technologies: getBullets(sub['technologies'] ?? []),
  };
}

function parseContact(lines: string[]): ContactData {
  return {
    email: getValue(lines, 'email'),
    phone: getValue(lines, 'phone'),
    linkedin: getValue(lines, 'linkedin'),
    github: getValue(lines, 'github'),
  };
}

function parseResume(lines: string[]): ResumeSection {
  const sub = splitBySections(lines, 3);

  const expEntries = splitBySections(sub['experience'] ?? [], 4);
  const experience: ExperienceEntry[] = Object.entries(expEntries).map(
    ([company, el]) => ({
      company,
      role: getValue(el, 'role'),
      role_zh: getValue(el, 'role_zh'),
      period: getValue(el, 'period'),
      bullets: getBullets(el),
      bullets_zh: getBulletsZh(el),
    })
  );

  const eduEntries = splitBySections(sub['education'] ?? [], 4);
  const education: EducationEntry[] = Object.entries(eduEntries).map(
    ([institution, el]) => ({
      institution,
      degree: getValue(el, 'degree'),
      degree_zh: getValue(el, 'degree_zh'),
      period: getValue(el, 'period'),
    })
  );

  const skillSections = splitBySections(sub['skills'] ?? [], 4);
  const skills = {
    technical: getBullets(skillSections['technical'] ?? []),
    certifications: getCertifications(skillSections['certifications'] ?? []),
    languages: getBullets(skillSections['languages'] ?? []),
  };

  return { experience, education, skills };
}

function parseProjects(lines: string[]): ProjectData[] {
  const entries = splitBySections(lines, 3);
  return Object.entries(entries).map(([name, el]) => {
    const urlVal = getValue(el, 'url');
    const techVal = getValue(el, 'tech');
    return {
      name,
      status: (getValue(el, 'status') as 'LIVE' | 'INTERNAL') || 'INTERNAL',
      url: urlVal || null,
      description: getValue(el, 'description'),
      description_zh: getValue(el, 'description_zh'),
      tech: techVal ? techVal.split(',').map(t => t.trim()) : [],
    };
  });
}

function parseBlog(lines: string[]): BlogPost[] {
  const entries = splitBySections(lines, 3);
  return Object.entries(entries).map(([title, el]) => {
    const tagsVal = getValue(el, 'tags');
    return {
      title,
      title_zh: getValue(el, 'title_zh'),
      date: getValue(el, 'date'),
      tags: tagsVal ? tagsVal.split(',').map(t => t.trim()) : [],
      summary: getValue(el, 'summary'),
      summary_zh: getValue(el, 'summary_zh'),
    };
  });
}

// --- Public API ---

export function parseContent(filePath: string): SiteContent {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');
  const sections = splitBySections(lines, 2);

  return {
    about: parseAbout(sections['about'] ?? []),
    contact: parseContact(sections['contact'] ?? []),
    resume: parseResume(sections['resume'] ?? []),
    projects: parseProjects(sections['projects'] ?? []),
    blog: parseBlog(sections['blog'] ?? []),
  };
}

export function getContentPath(): string {
  return path.join(process.cwd(), '..', '..', 'content', 'content.md');
}
