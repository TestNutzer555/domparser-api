const { JSDOM } = require("jsdom");

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { html } = req.body;
    if (!html) return res.status(400).json({ error: "No HTML provided" });

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const tools = [];
    document.querySelectorAll(".li.l.verified").forEach(tool => {
        tools.push({
            tool_name: tool.getAttribute("data-name"),
            tool_url: tool.getAttribute("data-url"),
            use_case: tool.getAttribute("data-task"),
            pricing: tool.querySelector(".ai_launch_date")?.textContent.trim() || "Unknown",
            bookmarks: parseInt(tool.querySelector(".saves")?.textContent.trim() || "0"),
            ratings: parseFloat(tool.querySelector(".average_rating")?.textContent.trim() || "0")
        });
    });

    res.json({ tools });
}
