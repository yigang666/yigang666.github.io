import fs from 'fs';
import path from 'path';

export interface ResumeData {
  name: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    period: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    period: string;
    bullets: string[];
  }>;
  skills: {
    technical: string[];
    linguistic: string[];
    certifications: string[];
    hobbies: string[];
  };
}

function extractBullets(lines: string[], startIndex: number, stopAtHeading: boolean = true): string[] {
  const bullets: string[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (stopAtHeading && (line.startsWith('##') || line.startsWith('###'))) {
      break;
    }
    if (line.startsWith('- ') && !line.startsWith('- **')) {
      bullets.push(line.slice(2).trim());
    }
  }
  return bullets;
}

function extractFieldValue(lines: string[], startIndex: number, field: string): string {
  for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
    const line = lines[i].trim();
    const prefix = `- **${field}:**`;
    if (line.startsWith(prefix)) {
      return line.slice(prefix.length).trim();
    }
  }
  return '';
}

export function parseResume(filePath: string): ResumeData {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  const result: ResumeData = {
    name: '',
    contact: { phone: '', email: '', linkedin: '' },
    education: [],
    experience: [],
    skills: {
      technical: [],
      linguistic: [],
      certifications: [],
      hobbies: [],
    },
  };

  let section = '';
  let subSection = '';
  let experienceIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# ') && !line.startsWith('## ')) {
      result.name = line.slice(2).trim();
      continue;
    }

    if (line.startsWith('## ')) {
      section = line.slice(3).trim().toLowerCase();
      subSection = '';
      experienceIndex = -1;
      continue;
    }

    if (line.startsWith('### ')) {
      subSection = line.slice(4).trim();

      if (section === 'experience') {
        result.experience.push({
          company: subSection,
          role: '',
          period: '',
          bullets: [],
        });
        experienceIndex = result.experience.length - 1;
      } else if (section === 'education') {
        result.education.push({
          institution: subSection,
          degree: '',
          period: '',
        });
      }
      continue;
    }

    if (section === 'contact') {
      if (line.startsWith('- **Email:**')) {
        result.contact.email = line.slice('- **Email:**'.length).trim();
      } else if (line.startsWith('- **Phone:**')) {
        result.contact.phone = line.slice('- **Phone:**'.length).trim();
      } else if (line.startsWith('- **LinkedIn:**')) {
        result.contact.linkedin = line.slice('- **LinkedIn:**'.length).trim();
      }
    }

    if (section === 'education' && result.education.length > 0) {
      const edu = result.education[result.education.length - 1];
      if (line.startsWith('- **Degree:**')) {
        edu.degree = line.slice('- **Degree:**'.length).trim();
      } else if (line.startsWith('- **Period:**')) {
        edu.period = line.slice('- **Period:**'.length).trim();
      }
    }

    if (section === 'experience' && experienceIndex >= 0) {
      const exp = result.experience[experienceIndex];
      if (line.startsWith('- **Role:**')) {
        exp.role = line.slice('- **Role:**'.length).trim();
      } else if (line.startsWith('- **Period:**')) {
        exp.period = line.slice('- **Period:**'.length).trim();
      } else if (line.startsWith('- ') && !line.startsWith('- **')) {
        exp.bullets.push(line.slice(2).trim());
      }
    }

    if (section === 'skills') {
      if (subSection === 'Technical' && line.startsWith('- ')) {
        result.skills.technical.push(line.slice(2).trim());
      } else if (subSection === 'Certifications' && line.startsWith('- ')) {
        result.skills.certifications.push(line.slice(2).trim());
      } else if (subSection === 'Linguistic' && line.startsWith('- ')) {
        result.skills.linguistic.push(line.slice(2).trim());
      } else if (subSection === 'Hobbies' && line.startsWith('- ')) {
        result.skills.hobbies.push(line.slice(2).trim());
      }
    }
  }

  return result;
}

export function getResumePath(): string {
  return path.join(process.cwd(), '..', '..', 'content', 'resume.md');
}
