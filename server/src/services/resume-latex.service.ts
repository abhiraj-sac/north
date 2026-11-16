
type ResumeData = Record<string, any>;

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
}

function escapeLatex(value: unknown): string {
  return text(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([{}$&#_%])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\r?\n/g, " ");
}

function section(title: string, content: string): string {
  if (!content.trim()) return "";
  return `\\section*{${escapeLatex(title)}}\n${content}\n`;
}

function bulletList(items: unknown[]): string {
  const validItems = items
    .map((item) => escapeLatex(item))
    .filter(Boolean);

  if (!validItems.length) return "";

  return `\\begin{itemize}
${validItems.map((item) => `\\item ${item}`).join("\n")}
\\end{itemize}`;
}

function getArray(value: unknown): ResumeData[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is ResumeData =>
          !!item && typeof item === "object" && !Array.isArray(item)
      )
    : [];
}

export function renderResumeLatex(content: ResumeData): string {
  const personal = content.personal_information ?? {};
  const skills = content.technical_skills ?? {};

  const name = escapeLatex(personal.full_name || "Resume");
  const contact = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin_url,
    personal.github_url,
    personal.portfolio_url,
  ]
    .map(escapeLatex)
    .filter(Boolean)
    .join(" \\textbar{} ");

  const summary = escapeLatex(content.professional_summary);

  const skillGroups = [
    ["Programming Languages", skills.programming_languages],
    ["Frameworks", skills.frameworks],
    ["Databases", skills.databases],
    ["Tools", skills.tools],
    ["Cloud Platforms", skills.cloud_platforms],
    ["Other Skills", skills.other_skills],
  ]
    .map(([label, values]) => {
      const list = Array.isArray(values)
        ? values.map(escapeLatex).filter(Boolean).join(", ")
        : "";
      return list
        ? `\\textbf{${escapeLatex(label)}:} ${list}\\\\`
        : "";
    })
    .filter(Boolean)
    .join("\n");

  const experience = getArray(content.work_experience)
    .map((job) => {
      const heading = [
        job.role,
        job.company,
        job.location,
        [job.start_date, job.end_date].filter(Boolean).join(" -- "),
      ]
        .map(escapeLatex)
        .filter(Boolean)
        .join(" | ");

      const bullets = bulletList([
        ...getArray(job).flatMap(() => []),
        ...(Array.isArray(job.responsibilities) ? job.responsibilities : []),
        ...(Array.isArray(job.achievements) ? job.achievements : []),
      ]);

      return `\\textbf{${heading}}\\\\
${bullets}`;
    })
    .filter(Boolean)
    .join("\n\\vspace{4pt}\n");

  const projects = getArray(content.projects)
    .map((project) => {
      const heading = escapeLatex(project.name || project.project_url || "Project");
      const description = escapeLatex(project.description);
      const technologies = Array.isArray(project.technologies)
        ? project.technologies.map(escapeLatex).filter(Boolean).join(", ")
        : "";
      const bullets = bulletList(project.contributions || []);

      return `\\textbf{${heading}}\\\\
${description}
${technologies ? `\\\\\\textit{Technologies: ${technologies}}` : ""}
${bullets}`;
    })
    .join("\n\\vspace{4pt}\n");

  const education = getArray(content.education)
    .map((item) => {
      const line = [
        item.degree,
        item.institution,
        item.field_of_study,
        item.graduation_year,
      ]
        .map(escapeLatex)
        .filter(Boolean)
        .join(" | ");
      return line ? `\\item ${line}` : "";
    })
    .filter(Boolean)
    .join("\n");

  const certifications = bulletList(
    getArray(content.certifications).map(
      (item) => [item.name, item.issuer, item.issue_date]
        .filter(Boolean)
        .join(" — ")
    )
  );

  const achievements = bulletList(
    Array.isArray(content.achievements) ? content.achievements : []
  );

  return String.raw`
\documentclass[10pt,a4paper]{article}
\usepackage[margin=0.65in]{geometry}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{titlesec}
\usepackage{iftex}

\ifXeTeX
  \usepackage{fontspec}
  \setmainfont{Latin Modern Roman}
\fi

\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlength{\parskip}{4pt}
\setlist[itemize]{leftmargin=16pt, nosep}
\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\titlespacing*{\section}{0pt}{10pt}{5pt}

\begin{document}

\begin{center}
{\LARGE\textbf{${name}}}\\[4pt]
${contact}
\end{center}

${section("Professional Summary", summary)}
${section("Technical Skills", skillGroups)}
${section("Work Experience", experience)}
${section("Projects", projects)}
${section("Education", education ? `\\begin{itemize}\n${education}\n\\end{itemize}` : "")}
${section("Certifications", certifications)}
${section("Achievements", achievements)}

\end{document}
`;
}
