const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generateQuestionsOpenAI = async (text, count, types, difficulty) => {
    if (!API_KEY) throw new Error("OpenAI API Key not found");

    const prompt = `
    Generate ${count} exam questions based on the following text.
    
    Configuration:
    - Types: ${types.join(', ')}
    - Difficulty Distribution: ${JSON.stringify(difficulty)}
    - Output Format: JSON array of objects with keys: type, text, options (array for MCQ), correct (index or string), answer (for short answer), difficulty, points (1-5).
    
    Text Content:
    "${text.substring(0, 15000)}" // Limit text to avoid token limits
    `;

    return await callOpenAI(prompt);
};

export const generateQuestionsFromTopicOpenAI = async (topic, count, types, difficulty) => {
    if (!API_KEY) throw new Error("OpenAI API Key not found");

    const prompt = `
    Generate ${count} exam questions on the topic: "${topic}".
    
    Configuration:
    - Types: ${types.join(', ')}
    - Difficulty Distribution: ${JSON.stringify(difficulty)}
    - Output Format: JSON array of objects with keys: id, type, text, options (array for MCQ), correct (index for MCQ/TrueFalse), answer (for Short Answer), difficulty, points.
    
    Ensure questions are academic and accurate.
    `;

    return await callOpenAI(prompt);
};

async function callOpenAI(prompt) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful exam generator. Output ONLY valid JSON array." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Handle if IT returns { "questions": [...] } or just [...]
        const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];

        // Post-process to ensure IDs and structure
        return questions.map((q, i) => ({
            ...q,
            id: Date.now() + i,
            options: q.options || [],
            points: q.points || 1,
            bloom: q.bloom || 'Applying'
        }));
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
}
