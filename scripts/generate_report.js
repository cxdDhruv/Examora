
import { jsPDF } from 'jspdf';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Load content
const logoPath = path.resolve('src/assets/logo.png');
const ownerPath = path.resolve('src/assets/owner.JPG');
const outputPath = path.join(process.env.USERPROFILE, 'Desktop', 'Examora_Project_Report.pdf');

// Create PDF
const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.width;
const pageHeight = doc.internal.pageSize.height;

// ================= HEADER =================
// Add Logo
try {
    const logoData = readFileSync(logoPath).toString('base64');
    doc.addImage(logoData, 'PNG', 10, 10, 25, 25);
} catch (e) {
    console.log("Logo not found, skipping...");
}

doc.setFontSize(24);
doc.setTextColor(99, 102, 241); // Primary Purple
doc.text("Examora", 40, 20);

doc.setFontSize(14);
doc.setTextColor(100);
doc.text("Secure Online Examination System", 40, 28);
doc.text("Project Report & Technical Documentation", 40, 35);

doc.line(10, 40, pageWidth - 10, 40); // Horizontal Line

// ================= INTRODUCTION =================
let y = 55;
doc.setFontSize(16);
doc.setTextColor(40);
doc.text("1. Introduction", 15, y);
y += 10;
doc.setFontSize(11);
doc.setTextColor(60);
const introText = "Examora is a cutting-edge web application designed to conduct secure online examinations. It bridges the gap between traditional robust exam software and accessible web tools. Built with React and modern web technologies, it features real-time monitoring, anti-cheating mechanisms, and a serverless architecture that functions reliably even on restricted networks.";
const splitIntro = doc.splitTextToSize(introText, pageWidth - 30);
doc.text(splitIntro, 15, y);
y += splitIntro.length * 6 + 10;

// ================= KEY FEATURES =================
doc.setFontSize(16);
doc.setTextColor(40);
doc.text("2. Key Features", 15, y);
y += 10;

const features = [
    { title: "Secure Exam Environment", desc: "Prevents tab switching, copy-pasting, and right-clicking. Fullscreen mode enforcement." },
    { title: "AI Proctoring (Beta)", desc: "Detects multiple faces, absence from frame, or unauthorized objects using webcam feed." },
    { title: "Dual-Engine Backend", desc: "Primary: Firebase Firestore for real-time sync. secondary: Google Sheets API for firewall bypass and data redundancy." },
    { title: "Question Bank & Randomization", desc: "Supports MCQs, True/False, Fill-in-Blanks, and Code questions. Randomizes question order per student." },
    { title: "Code Runner", desc: "Integrated JavaScript execution environment for coding assessments." },
    { title: "Advanced Math Support", desc: "Native LaTeX rendering for complex mathematical equations." },
    { title: "Teacher Dashboard", desc: "Live monitoring of student progress, violation logs, and instant resulting." },
];

features.forEach((feat, i) => {
    if (y > pageHeight - 30) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`${i + 1}. ${feat.title}`, 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(80);
    const desc = doc.splitTextToSize(feat.desc, pageWidth - 45);
    doc.text(desc, 25, y);
    y += desc.length * 5 + 6;
});

// ================= TECH STACK =================
if (y > pageHeight - 50) { doc.addPage(); y = 20; }
else y += 10;

doc.setFontSize(16);
doc.setTextColor(40);
doc.text("3. Technology Stack", 15, y);
y += 10;

const tech = [
    "Frontend: React.js (Vite), Framer Motion",
    "Styling: CSS Modules, Glassmorphism UI",
    "Backend: Google Apps Script (Serverless), Firebase Firestore",
    "Security: Face-api.js (AI), Page Visibility API",
    "Deployment: GitHub Pages (CI/CD workflows)"
];

doc.setFontSize(11);
doc.setTextColor(60);
tech.forEach(item => {
    doc.text(`• ${item}`, 20, y);
    y += 7;
});

// ================= DEVELOPER =================
y += 15;
if (y > pageHeight - 60) { doc.addPage(); y = 20; }

doc.line(10, y, pageWidth - 10, y);
y += 15;

try {
    const ownerData = readFileSync(ownerPath).toString('base64');
    doc.addImage(ownerData, 'JPEG', 15, y, 35, 35); // Owner Photo
} catch (e) { }

doc.setFontSize(14);
doc.setTextColor(40);
doc.text("Developed By:", 60, y + 10);
doc.setFontSize(16);
doc.setTextColor(99, 102, 241);
doc.text("Dhruv Jasani", 60, y + 20);
doc.setFontSize(11);
doc.setTextColor(100);
doc.text("Mechatronics Student | GCET", 60, y + 28);

// FOOTER
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Examora Project Report - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
}

// SAVE
doc.save(outputPath);
console.log(`PDF Generated at: ${outputPath}`);
