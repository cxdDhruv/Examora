
import { jsPDF } from 'jspdf';
import { readFileSync } from 'fs';
import path from 'path';

// Asset Paths
const logoPath = path.resolve('src/assets/logo.png');
const ownerPath = path.resolve('src/assets/owner.JPG');
const outputPath = path.join(process.env.USERPROFILE, 'Desktop', 'Examora_Final_Report_Human.pdf');

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
    doc.setTextColor(0, 0, 0); // Black
    doc.text(title, margin, y);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 12;
}

// Helper: Body Text
function addBodyText(text, fontSize = 12, color = 0) {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(color);
    const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
    checkPageBreak(splitText.length * 6);
    doc.text(splitText, margin, y);
    y += splitText.length * 6 + 8; // Line height + spacing
}

// Helper: Bullet Point
function addBullet(text) {
    doc.setFontSize(12);
    doc.setTextColor(20);
    const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2) - 10);
    checkPageBreak(splitText.length * 6);
    doc.text("•", margin, y);
    doc.text(splitText, margin + 8, y);
    y += splitText.length * 6 + 4;
}

// ================= TITLE PAGE =================
try {
    const logoData = readFileSync(logoPath).toString('base64');
    doc.addImage(logoData, 'PNG', pageWidth / 2 - 30, 40, 60, 60);
    y = 110;
} catch (e) { y = 60; }

doc.setFontSize(28);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 0, 0);
doc.text("EXAMORA", pageWidth / 2, y, { align: 'center' });
y += 15;

doc.setFontSize(18);
doc.setFont("helvetica", "normal");
doc.text("A Secure Online Examination System", pageWidth / 2, y, { align: 'center' });
y += 40;

doc.setFontSize(14);
doc.text("Submitted in partial fulfillment of the requirements for", pageWidth / 2, y, { align: 'center' });
y += 10;
doc.setFont("helvetica", "bold");
doc.text("Bachelor of Mechatronics Engineering", pageWidth / 2, y, { align: 'center' });
y += 40;

// Owner Info
try {
    const ownerData = readFileSync(ownerPath).toString('base64');
    doc.addImage(ownerData, 'JPEG', pageWidth / 2 - 25, y, 50, 50);
    y += 60;
} catch (e) { y += 10; }

doc.setFontSize(14);
doc.setFont("helvetica", "normal");
doc.text("Submitted By:", pageWidth / 2, y, { align: 'center' });
y += 10;
doc.setFontSize(16);
doc.setFont("helvetica", "bold");
doc.text("Dhruv Jasani", pageWidth / 2, y, { align: 'center' });
y += 8;
doc.setFontSize(14);
doc.setFont("helvetica", "normal");
doc.text("GCET College", pageWidth / 2, y, { align: 'center' });

doc.addPage();
y = margin;

// ================= 1. ACKNOWLEDGEMENT =================
addSectionTitle("Acknowledgement");
addBodyText("I would like to express my special thanks of gratitude to my HOD and faculties who gave me the golden opportunity to do this wonderful project on the topic 'Examora'. It helped me in doing a lot of Research and I came to know about so many new things.");
addBodyText("Use of modern technologies like React and Google Cloud was actually quite challenging but very rewarding. I am really thankful to them. Secondly, I would also like to thank my parents and friends who helped me a lot in finalizing this project within the limited time frame.");

// ================= 2. INTRODUCTION =================
addSectionTitle("1. Introduction");
addBodyText("Nowadays, everything is moving online. From shopping to learning, the internet has changed how we do things. However, taking exams online is still a big problem for many colleges and schools. The main issues are cheating students and bad internet connections.");
addBodyText("So, I decided to make 'Examora'. It is basically a web-based platform where teachers can easily create exams and students can give exams from anywhere. The best part is that it is very secure and prevents students from copying.");

// ================= 3. PROBLEM STATEMENT =================
addSectionTitle("2. Why We Need This Project?");
addBullet("Cheating issues: In normal online forms (like Google Forms), students can easily open new tabs and search for answers. We needed something to stop this.");
addBullet("Internet problems: In India, network issues are common. If the internet goes down, student data gets lost. My project solves this.");
addBullet("Cost factor: Professional software is very costly. Examora is free to host and use.");

// ================= 4. DETAILED FEATURES =================
addSectionTitle("3. Detailed Features (What it does)");

doc.setFont("helvetica", "bold");
doc.setFontSize(13);
doc.text("For Teachers (Admin Side):", margin, y);
y += 10;
doc.setFont("helvetica", "normal");
addBullet("Easy Login: Teachers can login directly with their Google Account. No need to remember extra passwords.");
addBullet("Create Any Type of Question: You can add simple MCQs, True/False, and even Coding questions for CS students.");
addBullet("Math Formulas: Actually, writing math formulas online is hard. But here I added LaTeX support so we can write complex equations easily.");
addBullet("Excel Integration: This is the most important feature. All the marks and data directly go to your personal Google Sheet. So you can easily print results later.");
addBullet("Live Monitoring: You can see exactly which student is giving the exam right now.");

doc.setFont("helvetica", "bold");
doc.setFontSize(13);
doc.text("For Students:", margin, y);
y += 10;
doc.setFont("helvetica", "normal");
addBullet("Simple Interface: Students just need a secure link. No need to install any heavy software.");
addBullet("Anti-Cheating (Proctoring): The system uses the camera to check if the student is looking away or if there are two people. Also, if they try to switch tabs, a warning is given.");
addBullet("Code Runner: For programming exams, students can write and run JavaScript code directly in the browser.");
addBullet("Instant Results: As soon as they submit, they can download their result card.");

// ================= 5. SYSTEM DESIGN =================
addSectionTitle("4. How It Works (Technical Part)");
addBodyText("I have used the MERN stack logic but made it serverless for better performance.");

addBullet("Frontend (What you see): Developed using React.js because it is fast and responsive.");
addBullet("Database (Where data goes): I used a dual strategy. Firebase is used for real-time things, and Google Sheets is used as a backup database.");
addBullet("Deployment: The whole project is hosted on GitHub Pages, which is free and reliable.");

// ================= 6. USER GUIDE =================
addSectionTitle("5. How to Run This?");
addBodyText("Running this project is actually very simple:");
addBullet("Step 1: The teacher logs in and clicks 'Create Exam'.");
addBullet("Step 2: Adds questions and sets the time limit.");
addBullet("Step 3: Publishes the exam and shares the generated link on WhatsApp or Classroom.");
addBullet("Step 4: Student clicks the link, enters their Roll No, and starts the exam.");
addBullet("Step 5: The camera monitoring starts automatically.");
addBullet("Step 6: After submission, the teacher gets all data in Excel format.");

// ================= 7. CONCLUSION =================
addSectionTitle("6. Conclusion");
addBodyText("In conclusion, Examora is a complete solution for conducting online exams. It is not just a simple form, but a smart system that ensures fairness. I tried to make it as user-friendly as possible so that even non-technical faculties can use it without any training.");
addBodyText("This project taught me a lot about full-stack development and how to handle real-world problems like network failures.");

// FOOTER
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Examora Final Report - Page ${i}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
}

// SAVE
doc.save(outputPath);
console.log(`Detailed PDF Generated at: ${outputPath}`);
