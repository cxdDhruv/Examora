
import { jsPDF } from 'jspdf';
import { readFileSync } from 'fs';
import path from 'path';

// Asset Paths
const logoPath = path.resolve('src/assets/logo.png');
const ownerPath = path.resolve('src/assets/owner.JPG');
const outputPath = path.join(process.env.USERPROFILE, 'Desktop', 'Examora_Detailed_Project_Report.pdf');

// PDF Setup
const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.width;
const pageHeight = doc.internal.pageSize.height;
const margin = 20;
let y = margin;

// Helper: Add Page Check
function checkPageBreak(heightNeeded = 20) {
    if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
    }
    return false;
}

// Helper: Title
function addSectionTitle(title) {
    checkPageBreak(25);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(title, margin, y);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 12;
}

// Helper: Body Text
function addBodyText(text, fontSize = 11, color = 80) {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(color);
    const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
    checkPageBreak(splitText.length * 5);
    doc.text(splitText, margin, y);
    y += splitText.length * 5 + 6; // Line height + spacing
}

// Helper: Bullet Point
function addBullet(text) {
    doc.setFontSize(11);
    doc.setTextColor(80);
    const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2) - 10);
    checkPageBreak(splitText.length * 5);
    doc.text("•", margin, y);
    doc.text(splitText, margin + 8, y);
    y += splitText.length * 5 + 4;
}

// ================= TITLE PAGE =================
try {
    const logoData = readFileSync(logoPath).toString('base64');
    doc.addImage(logoData, 'PNG', pageWidth / 2 - 30, 40, 60, 60);
    y = 110;
} catch (e) { y = 60; }

doc.setFontSize(26);
doc.setFont("helvetica", "bold");
doc.setTextColor(79, 70, 229); // Brand Color (Indigo)
doc.text("EXAMORA", pageWidth / 2, y, { align: 'center' });
y += 15;

doc.setFontSize(16);
doc.setTextColor(100);
doc.setFont("helvetica", "normal");
doc.text("Next-Generation Secure Online Examination System", pageWidth / 2, y, { align: 'center' });
y += 40;

doc.setFontSize(14);
doc.text("Bachelor of Mechatronics Engineering", pageWidth / 2, y, { align: 'center' });
y += 10;
doc.text("Major Project Report", pageWidth / 2, y, { align: 'center' });
y += 40;

// Owner Info
try {
    const ownerData = readFileSync(ownerPath).toString('base64');
    doc.addImage(ownerData, 'JPEG', pageWidth / 2 - 25, y, 50, 50);
    y += 60;
} catch (e) { y += 10; }

doc.setFontSize(14);
doc.setTextColor(0);
doc.text("Developed By:", pageWidth / 2, y, { align: 'center' });
y += 10;
doc.setFontSize(16);
doc.setFont("helvetica", "bold");
doc.text("Dhruv Jasani", pageWidth / 2, y, { align: 'center' });
y += 8;
doc.setFontSize(12);
doc.setFont("helvetica", "normal");
doc.text("Mechatronics Engineering | GCET", pageWidth / 2, y, { align: 'center' });

doc.addPage();
y = margin;

// ================= 1. EXECUTIVE SUMMARY =================
addSectionTitle("1. Executive Summary");
addBodyText("Examora is a full-stack web application developed to address the critical need for secure, reliable, and accessible online assessment tools. Traditional examination software is often expensive, requires complex installation, or lacks robust anti-cheating measures. Examora solves these problems by providing a browser-based, serverless platform that is zero-install and highly secure.");
addBodyText("The system leverages modern web technologies including React.js for a dynamic frontend, Firebase for real-time synchronization, and a custom Google Apps Script backend to ensure connectivity even in restricted network environments. Key features include AI-based proctoring, real-time violation tracking, and automated result generation.");

// ================= 2. PROBLEM STATEMENT =================
addSectionTitle("2. Problem Statement & Solution");
addBullet("Infrastructure Dependency: Most exam systems require high-speed internet and specific hardware.");
addBullet("Security Vulnerabilities: Basic forms (like Google Forms) lack anti-cheating mechanisms like tab-switch detection.");
addBullet("Cost: Commercial proctoring software is prohibitively expensive for individual teachers or small institutes.");
addBodyText("Examora addresses these by running entirely in the browser, using a dual-backend strategy for 100% uptime, and implementing client-side AI for monitoring without streaming heavy video data.");

// ================= 3. SYSTEM ARCHITECTURE =================
addSectionTitle("3. System Architecture");
addBodyText("The application follows a Service-Oriented Architecture (SOA) with a decoupled frontend and backend.");

addBullet("Frontend: Built with React.js (Vite) for high performance. Uses Context API for state management and React Router for navigation.");
addBullet("Primary Backend: Google Firebase (Firestore) for real-time event listeners and data sync.");
addBullet("Secondary Backend (Failover): Google Apps Script acting as a REST API to store data in Google Sheets. This bypasses common school/office firewalls that block Firebase protocols.");
addBullet("AI Engine: integrated face-api.js running on the client side via WebAssembly (WASM) for face detection and tracking.");

// ================= 4. DETAILED FEATURES =================
addSectionTitle("4. Detailed Feature Modules");

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("4.1 Teacher Dashboard", margin, y);
y += 8;
doc.setFont("helvetica", "normal");
addBullet("Exam Creation: Drag-and-drop interface to create MCQs, True/False, and Code questions.");
addBullet("Real-time Monitoring: View live status of all students (In Progress, Submitted, Cheating Detected).");
addBullet("Results & Export: One-click export to CSV and PDF. Direct sync to Google Sheets.");

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("4.2 Student Exam Interface", margin, y);
y += 8;
doc.setFont("helvetica", "normal");
addBullet("Secure Environment: Fullscreen enforcement. Disables Right-Click, Copy/Paste, and Alt+Tab.");
addBullet("AI Proctoring: Continuous webcam analysis to detect face absence or multiple faces.");
addBullet("Smart Connectivity: Automatically selects the best backend (Firebase vs Sheets) based on network conditions.");

// ================= 5. TECHNICAL SPECIFICATIONS =================
addSectionTitle("5. Technical Specifications");
addBullet("Language: JavaScript (ES6+), HTML5, CSS3");
addBullet("Framework: React 19, Framer Motion (Animations)");
addBullet("Build Tool: Vite (Bundler)");
addBullet("Database: NoSQL (Firestore) + Spreadsheet (Google Sheets)");
addBullet("Hosting: GitHub Pages (CI/CD Automated Deployment)");
addBullet("Version Control: Git");

// ================= 6. USER MANUAL =================
addSectionTitle("6. User Manual / Assessment Flow");
addBodyText("Step 1: Teacher logs in via Google OAuth.");
addBodyText("Step 2: Teacher creates an exam and publishes it to generate a unique Link/QR Code.");
addBodyText("Step 3: Teacher shares the link. The system embeds the correct backend URL automatically.");
addBodyText("Step 4: Student joins via the link. AI checks camera and permissions.");
addBodyText("Step 5: Exam begins. Any violation (e.g. switching tabs) is logged.");
addBodyText("Step 6: Upon submission, data is sent to the Teacher's Dashboard and Google Sheet instantly.");

// ================= 7. FUTURE SCOPE =================
addSectionTitle("7. Future Scope");
addBullet("Integration of LLMs for auto-grading subjective answers.");
addBullet("Mobile App using React Native.");
addBullet("Offline Mode with PWA (Progressive Web App) support.");

// ================= CONCLUSION =================
addSectionTitle("8. Conclusion");
addBodyText("Examora successfully demonstrates how modern web technologies can democratize access to secure examination tools. By combining AI proctoring with a resilient serverless architecture, it provides a cost-effective, scalable, and secure solution for educational institutions.");

// FOOTER ON ALL PAGES
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Examora Detailed Project Report - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
}

// SAVE
doc.save(outputPath);
console.log(`Detailed PDF Generated at: ${outputPath}`);
