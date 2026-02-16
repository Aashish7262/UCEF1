"use client";

import { useState } from "react";

/* =========================================================
ACCENT COLORS (NO TAILWIND DYNAMIC BUGS)
========================================================= */

const accentMap: Record<string, any> = {
blue: { text: "text-blue-600", bg: "bg-blue-600", ring: "ring-blue-300" },
green: { text: "text-green-600", bg: "bg-green-600", ring: "ring-green-300" },
purple: { text: "text-purple-600", bg: "bg-purple-600", ring: "ring-purple-300" },
pink: { text: "text-pink-600", bg: "bg-pink-600", ring: "ring-pink-300" },
black: { text: "text-black", bg: "bg-black", ring: "ring-gray-400" },
};

/* =========================================================
SUGGESTION DATA
========================================================= */

const SKILLS = [
"JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
"MongoDB", "SQL", "PostgreSQL", "Python", "FastAPI", "Flask",
"Machine Learning", "Deep Learning", "NLP", "LangChain", "RAG",
"HTML", "CSS", "Tailwind CSS", "Bootstrap",
"Git", "GitHub", "Docker", "AWS", "Firebase",
"REST API", "GraphQL"
];

const LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati", "French", "German", "Spanish"];

const LOCATIONS = [
"Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Chennai",
"Noida", "Gurgaon", "Remote", "Hybrid"
];

/* =========================================================
MAIN COMPONENT
========================================================= */

export default function ResumeBuilder() {
const [step, setStep] = useState<"personal" | "skills" | "projects" | "experience">("personal");
const [accent, setAccent] = useState<keyof typeof accentMap>("blue");

/* PERSONAL */
const [name, setName] = useState("Briar Martin");
const [title, setTitle] = useState("Web Developer");
const [email, setEmail] = useState("test@example.com");
const [phone, setPhone] = useState("");
/* CERTIFICATIONS */
const [certificates, setCertificates] = useState<{
name: string;
issuer: string;
year: string;
file?: string;
fileName?: string;
}[]>([]);

const [location, setLocation] = useState("");
const [photo, setPhoto] = useState<string | null>(null);
const [leetcode, setLeetcode] = useState("");
const [github, setGithub] = useState("");
const [linkedin, setLinkedin] = useState("");


/* SKILLS */
const [skills, setSkills] = useState<string[]>([]);
const [skillInput, setSkillInput] = useState("");

/* LANGUAGES */
const [languages, setLanguages] = useState<string[]>([]);
const [langInput, setLangInput] = useState("");

/* ACHIEVEMENTS */
const [achievements, setAchievements] = useState<string[]>([]);
const [achInput, setAchInput] = useState("");

/* PROJECTS */
const [projects, setProjects] = useState<{ title: string; description: string; url: string }[]>([]);

/* EXPERIENCE */
const [experience, setExperience] = useState<{ company: string; role: string; duration: string; description: string }[]>([]);

const accentStyle = accentMap[accent];

/* ================= AI: PROJECT DESCRIPTION ================= */
const generateProjectDescription = async (index: number) => {
const title = projects[index].title;
if (!title) return;

const res = await fetch("/api/gemini/project", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ title }),
});

const data = await res.json();

if (data.description) {
const updated = [...projects];
updated[index].description = data.description;
setProjects(updated);
}
};



/* ================= AI: EXPERIENCE DESCRIPTION ================= */
const generateExperienceDescription = async (index: number) => {
if (!experience[index].role || !experience[index].company) {
alert("Enter role and company first");
return;
}

const res = await fetch("/api/gemini/experience", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
role: experience[index].role,
company: experience[index].company,
skills,
}),
});

const data = await res.json();

if (data.description) {
const updated = [...experience];
updated[index].description = data.description;
setExperience(updated);
}
};



const downloadPDF = async () => {
const res = await fetch("/api/cv/pdf", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
name,
title,
email,
phone,
location,
skills,
github,
leetcode,
linkedin,
projects, // 👈 FULL OBJECT (title + url + description)
experience, // 👈 FULL OBJECT (company + role + duration + description)
certificates,
achievements,
languages,
}),
});

if (!res.ok) return alert("PDF generation failed");

const blob = await res.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "Resume.pdf";
a.click();
window.URL.revokeObjectURL(url);
};





return (
<div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">
<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

{/* ================= LEFT PANEL ================= */}
<div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 relative">

{/* TABS */}
<div className="flex flex-wrap gap-2 md:gap-3 mb-6">
{["personal", "skills", "projects", "experience"].map((s) => (
<button
key={s}
onClick={() => setStep(s as any)}
className={`flex-1 min-w-[100px] px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition
${step === s ? `${accentStyle.bg} text-white` : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
>
{s.toUpperCase()}
</button>
))}
</div>

{/* ACCENT PICKER */}
<div className="flex gap-3 mb-6 overflow-x-auto pb-2">
{Object.keys(accentMap).map((c) => (
<div
key={c}
onClick={() => setAccent(c as any)}
className={`w-7 h-7 rounded-full cursor-pointer flex-shrink-0 ${accentMap[c].bg}
${accent === c ? "ring-2 ring-black ring-offset-2" : ""}`}
/>
))}
</div>

{/* PERSONAL */}
{step === "personal" && (
<>
<div className="mb-6 flex flex-col sm:items-center sm:flex-row gap-4">
<div className="w-24 h-24 rounded-full border overflow-hidden bg-gray-200">
{photo ? <img src={photo} className="w-full h-full object-cover" /> :
<div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Photo</div>}
</div>
<label className="cursor-pointer px-4 py-2 rounded-lg bg-gray-900 text-white text-sm text-center">
Upload Photo
<input type="file" accept="image/*" hidden
onChange={(e) => {
const f = e.target.files?.[0];
if (!f) return;
const r = new FileReader();
r.onload = () => setPhoto(r.result as string);
r.readAsDataURL(f);
}}
/>
</label>
</div>

<Input label="Full Name" value={name} set={setName} />
<Input label="Title" value={title} set={setTitle} />
<Input label="Email" value={email} set={setEmail} />
<Input label="Phone" value={phone} set={setPhone} />

<SuggestionInput label="Location" value={location} setValue={setLocation} suggestions={LOCATIONS} />
<Input label="GitHub URL" value={github} set={setGithub} />
<Input label="LeetCode URL" value={leetcode} set={setLeetcode} />
<Input label="LinkedIn URL" value={linkedin} set={setLinkedin} />

</>
)}

{/* SKILLS */}
{step === "skills" && (
<>
<SuggestionMulti label="Skills" value={skillInput} setValue={setSkillInput}
items={skills} setItems={setSkills} suggestions={SKILLS} />

<SuggestionMulti label="Languages" value={langInput} setValue={setLangInput}
items={languages} setItems={setLanguages} suggestions={LANGUAGES} />

{/* CERTIFICATIONS */}
<h3 className="mt-6 text-sm font-semibold text-gray-700">
Certifications
</h3>

<button
onClick={() =>
setCertificates([
...certificates,
{ name: "", issuer: "", year: "" },
])
}
className="mt-2 mb-3 px-3 py-1 bg-indigo-600 text-white rounded text-sm"
>
+ Add Certificate
</button>

{certificates.map((c, i) => (
<div key={i} className="border rounded-lg p-3 mb-3 bg-gray-50">
<Input
label="Certificate Name"
value={c.name}
set={(v: string) =>
setCertificates(
certificates.map((x, idx) =>
idx === i ? { ...x, name: v } : x
)
)
}
/>

<Input
label="Issued By"
value={c.issuer}
set={(v: string) =>
setCertificates(
certificates.map((x, idx) =>
idx === i ? { ...x, issuer: v } : x
)
)
}
/>

<Input
label="Year"
value={c.year}
set={(v: string) =>
setCertificates(
certificates.map((x, idx) =>
idx === i ? { ...x, year: v } : x
)
)
}
/>

{/* Optional file upload */}
{/* Certificate File Upload */}
<div className="mt-2">
<label
className="inline-block px-4 py-2 bg-gray-800 text-white text-sm rounded cursor-pointer hover:bg-gray-900"
>
Upload Certificate
<input
type="file"
accept=".pdf,image/*"
hidden
onChange={(e) => {
const file = e.target.files?.[0];
if (!file) return;

const reader = new FileReader();
reader.onload = () => {
setCertificates(
certificates.map((x, idx) =>
idx === i
? { ...x, file: reader.result as string, fileName: file.name }
: x
)
);
};
reader.readAsDataURL(file);
}}
/>
</label>

{/* File name preview */}
{c.fileName && (
<p className="mt-1 text-xs text-gray-600">
📄 {c.fileName}
</p>
)}
</div>

</div>
))}


<label className="text-sm font-medium text-gray-700 mt-6 block">Achievements</label>
<input
value={achInput}
onChange={(e) => setAchInput(e.target.value)}
placeholder="Type achievement and press Enter"
className={inputClass}
onKeyDown={(e) => {
if (e.key === "Enter" && achInput.trim()) {
setAchievements([...achievements, achInput.trim()]);
setAchInput("");
}
}}
/>

<ul className="list-disc ml-5 mt-3 text-sm text-gray-700">
{achievements.map((a, i) => <li key={i}>{a}</li>)}
</ul>
</>
)}

{/* PROJECTS */}
{step === "projects" && (
<>
<button
onClick={() => setProjects([...projects, { title: "", description: "", url: "" }])}
className="mb-4 w-full sm:w-auto px-4 py-2 rounded-lg bg-green-600 text-white"
>
+ Add Project
</button>

{projects.map((p, i) => (
<div key={i} className="border rounded-xl p-4 mb-4 bg-gray-50">
<Input label="Project Title" value={p.title}
set={(v: string) => setProjects(projects.map((x, idx) => idx === i ? { ...x, title: v } : x))} />
<Input label="Project URL" value={p.url}
set={(v: string) => setProjects(projects.map((x, idx) => idx === i ? { ...x, url: v } : x))} />
<Textarea label="Description" value={p.description}
set={(v: string) => setProjects(projects.map((x, idx) => idx === i ? { ...x, description: v } : x))} />
<button
onClick={() => generateProjectDescription(i)}
className="mt-2 w-full sm:w-auto px-3 py-1 bg-blue-600 text-white rounded text-sm"
>
✨ Generate Description (AI)
</button>

</div>
))}
</>
)}

{/* EXPERIENCE */}
{step === "experience" && (
<>
<button
onClick={() => setExperience([...experience, { company: "", role: "", duration: "", description: "" }])}
className="mb-4 w-full sm:w-auto px-4 py-2 rounded-lg bg-green-600 text-white"
>
+ Add Experience
</button>

{experience.map((e, i) => (
<div key={i} className="border rounded-xl p-4 mb-4 bg-gray-50">
<Input label="Company" value={e.company}
set={(v: string) => setExperience(experience.map((x, idx) => idx === i ? { ...x, company: v } : x))} />
<Input label="Role" value={e.role}
set={(v: string) => setExperience(experience.map((x, idx) => idx === i ? { ...x, role: v } : x))} />
<Input label="Duration" value={e.duration}
set={(v: string) => setExperience(experience.map((x, idx) => idx === i ? { ...x, duration: v } : x))} />
<Textarea label="Description" value={e.description}
set={(v: string) => setExperience(experience.map((x, idx) => idx === i ? { ...x, description: v } : x))} />

<button
onClick={() => generateExperienceDescription(i)}
className="mt-2 w-full sm:w-auto px-3 py-1 bg-purple-600 text-white rounded text-sm"
>
✨ Generate Description (AI)
</button>

</div>
))}
</>
)}
</div>

{/* ================= RIGHT PREVIEW ================= */}
<div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-fit lg:sticky lg:top-8">
<div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
{photo && <img src={photo} className="w-20 h-20 rounded-full object-cover border" />}
<div>
<h1 className={`text-2xl md:text-3xl font-bold ${accentStyle.text}`}>{name}</h1>
<p className="text-lg text-gray-600">{title}</p>
</div>
</div>

<p className="text-sm text-gray-500 mt-2 text-center sm:text-left break-words">
{email} {phone && `• ${phone}`} {location && `• ${location}`}
</p>



{/* 🔗 Coding Profiles */}
<div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-blue-600 mt-2">
{github && (
<a
href={github}
target="_blank"
rel="noopener noreferrer"
className="hover:underline"
>
GitHub
</a>
)}
{leetcode && (
<a
href={leetcode}
target="_blank"
rel="noopener noreferrer"
className="hover:underline"
>
LeetCode
</a>
)}
{linkedin && (
<a
href={linkedin}
target="_blank"
rel="noopener noreferrer"
className="hover:underline"
>
LinkedIn
</a>
)}
</div>


<PreviewSection title="Skills">{skills.join(", ")}</PreviewSection>
<PreviewSection title="Certifications">
{certificates.map((c, i) => (
<div key={i} className="mb-2">
<strong>{c.name}</strong>
{c.issuer && <span> – {c.issuer}</span>}
{c.year && <span className="text-gray-500"> ({c.year})</span>}
</div>
))}
</PreviewSection>

<PreviewSection title="Languages">{languages.join(", ")}</PreviewSection>

<PreviewSection title="Achievements">
<ul className="list-disc ml-5">{achievements.map((a, i) => <li key={i}>{a}</li>)}</ul>
</PreviewSection>

<PreviewSection title="Projects">
{projects.map((p, i) => (
<div key={i} className="mb-3">
<strong>{p.title}</strong>
{p.url && <div className="truncate"><a href={p.url} className="text-blue-600 text-sm" target="_blank">{p.url}</a></div>}
<p className="text-sm">{p.description}</p>
</div>
))}
</PreviewSection>

<PreviewSection title="Experience">
{experience.map((e, i) => (
<div key={i} className="mb-3">
<strong>{e.role}</strong> – {e.company}
<div className="text-sm text-gray-500">{e.duration}</div>
<div className="text-sm">{e.description}</div>
</div>
))}
</PreviewSection>

<button
onClick={downloadPDF}
className="mt-8 w-full py-3 rounded-lg bg-black text-white text-lg hover:opacity-90"
>
Download Resume (PDF)
</button>

</div>
</div>
</div>
);
}

/* ================= UI HELPERS ================= */

const inputClass = `
w-full border border-gray-300 rounded-lg px-3 py-2
bg-white text-gray-900 placeholder-gray-500
focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none
`;

function Input({ label, value, set }: any) {
return (
<div className="mb-4">
<label className="text-sm font-medium text-gray-700">{label}</label>
<input value={value} onChange={(e) => set(e.target.value)} className={inputClass} />
</div>
);
}

function Textarea({ label, value, set }: any) {
return (
<div className="mb-4">
<label className="text-sm font-medium text-gray-700">{label}</label>
<textarea rows={4} value={value} onChange={(e) => set(e.target.value)} className={inputClass} />
</div>
);
}

function SuggestionInput({ label, value, setValue, suggestions }: any) {
const [open, setOpen] = useState(false);

const filtered = suggestions.filter(
(s: string) =>
s.toLowerCase().includes(value.toLowerCase()) &&
s.toLowerCase() !== value.toLowerCase()
);

return (
<div className="mb-4 relative">
<label className="text-sm font-medium text-gray-700">
{label}
</label>

<input
value={value}
onChange={(e) => {
setValue(e.target.value);
setOpen(true);
}}
onFocus={() => setOpen(true)}
className={inputClass}
/>

{open && filtered.length > 0 && (
<div className="absolute z-50 w-full border bg-white rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
{filtered.map((s: string) => (
<div
key={s}
className="px-3 py-2 cursor-pointer hover:bg-gray-100"
onClick={() => {
setValue(s);
setOpen(false); // ✅ CLOSE DROPDOWN
}}
>
{s}
</div>
))}
</div>
)}
</div>
);
}


function SuggestionMulti({ label, value, setValue, items, setItems, suggestions }: any) {
const filtered = suggestions.filter((s: string) => s.toLowerCase().includes(value.toLowerCase()) && !items.includes(s));
return (
<div className="mb-6 relative">
<label className="text-sm font-medium text-gray-700">{label}</label>
<input value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
{value && (
<div className="absolute z-50 w-full bg-white border shadow-xl rounded-lg mt-1">
{filtered.map((s: string) => (
<div key={s} className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-gray-900"
onClick={() => { setItems([...items, s]); setValue(""); }}>
{s}
</div>
))}
</div>
)}
<div className="flex flex-wrap gap-2 mt-3">
{items.map((s: string, i: number) => (
<span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm cursor-pointer"
onClick={() => setItems(items.filter((__: any, idx: number) => idx !== i))}>
{s} ✕
</span>
))}
</div>
</div>
);
}

function PreviewSection({ title, children }: any) {
if (
!children ||
(Array.isArray(children) && children.length === 0) ||
children === ""
) {
return null;
}

return (
<div className="mt-6">
<h3 className="text-sm font-bold uppercase tracking-wide text-gray-800 border-b pb-1 mb-2">
{title}
</h3>
<div className="text-sm text-gray-700 leading-relaxed">
{children}
</div>
</div>
);
}