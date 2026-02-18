
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2A5F1LP7tjucXqDtDDRRzDMFgMGycmcZ_dJP0eOGOmegGOh_9_VrI7o_6HBWci5Vg1Q/exec";

async function testBackend() {
    console.log("🚀 Starting Backend Verify (Attempt 4)...");

    // 1. Test GET (Read)
    console.log("\n📡 Testing READ (GET)...");
    try {
        const res = await fetch(SCRIPT_URL);
        const text = await res.text();
        console.log("Status:", res.status);
        if (res.ok) {
            console.log("✅ READ Success!");
            // Try to parse JSON
            try {
                const data = JSON.parse(text);
                console.log("Data count:", Array.isArray(data) ? data.length : "Not array");
            } catch {
                console.log("Preview:", text.substring(0, 100));
            }
        } else {
            console.error("❌ READ Failed:", text);
        }
    } catch (e) {
        console.error("❌ READ Error:", e.message);
    }

    // 2. Test POST (Write)
    console.log("\n📝 Testing WRITE (POST)...");
    const dummyData = {
        examId: 99999,
        studentName: "Global Reliability Bot",
        score: 100,
        timestamp: new Date().toISOString()
    };

    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dummyData),
            redirect: 'follow'
        });

        const text = await res.text();
        console.log("Status:", res.status);
        if (res.ok) {
            console.log("✅ WRITE Success!");
            console.log("Response:", text.substring(0, 100));
        } else {
            console.error("❌ WRITE Failed");
            console.log("Response:", text);
        }

    } catch (e) {
        console.error("❌ WRITE Error:", e.message);
    }
}

testBackend();
